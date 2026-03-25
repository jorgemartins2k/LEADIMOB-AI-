from fastapi import FastAPI, Request, BackgroundTasks # pyre-ignore
from typing import Dict, Any, Optional
import uvicorn # pyre-ignore
import os
from dotenv import load_dotenv # pyre-ignore
from contextlib import asynccontextmanager
import asyncio
from scheduler import start_scheduler # pyre-ignore
from raquel import RaquelAgent # pyre-ignore

# Buffer para agrupar mensagens (debouncing de 25-30s)
message_buffers: Dict[str, Dict[str, Any]] = {}

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicia o relógio de follow-ups em segundo plano ao ligar o servidor
    start_scheduler()
    yield

app: FastAPI = FastAPI(
    title="Raquel AI Engine - Leadimob-AI",
    lifespan=lifespan
)
raquel = RaquelAgent() # pyre-ignore

@app.get("/")
def home() -> Dict[str, str]:
    return {"status": "online", "agent": "Raquel", "scheduler": "active", "debouncing": "25s"}

async def process_delayed_messages(phone_str: str):
    """
    Aguarda o tempo estipulado e processa todas as mensagens acumuladas do lead.
    """
    await asyncio.sleep(25)  # Janela de espera de 25 segundos
    
    buffer = message_buffers.pop(phone_str, None)
    if buffer:
        print(f"🕒 Janela de debouncing fechada para {phone_str}. Processando grupo de mensagens...")
        # Chamamos o processamento real da Raquel (agora assíncrono)
        await raquel.process_message(
            phone_str, 
            buffer['content'], 
            buffer['sender_name'], 
            is_audio=buffer['is_audio'], 
            audio_url=buffer.get('audio_url')
        )

@app.post("/webhook/zapi")
async def handle_zapi_webhook(request: Request, background_tasks: BackgroundTasks) -> Dict[str, str]:
    """
    Recebe mensagens do WhatsApp via Z-API
    """
    try:
        data_raw: Any = await request.json()
        data: Dict[str, Any] = data_raw if isinstance(data_raw, dict) else {}
        
        phone: Optional[str] = data.get("phone")
        
        text_data = data.get("text", {})
        message_text: Optional[str] = text_data.get("message") if isinstance(text_data, dict) else None
        
        sender_name: str = str(data.get("senderName", "Cliente"))
        message_type: str = str(data.get("type", "text"))
        
        if not phone:
            print("⚠️ Webhook ignorado: campo 'phone' ausente.")
            return {"status": "ignored"}

        phone_str: str = str(phone)

        # 1. Lógica de Confirmação do Corretor ("ok")
        if message_text and message_text.lower().strip() == "ok":
            if raquel.db.confirm_hot_lead(phone_str):
                print(f"✅ Corretor {sender_name} ({phone_str}) confirmou recebimento do lead quente.")
                return {"status": "broker_confirmed"}
            return {"status": "ok_ignored"}

        # 2. Processamento de Mensagem com Debouncing (Espera 25s)
        is_audio: bool = message_type in ["audio", "ptt"]
        audio_url: Optional[str] = data.get("audio", {}).get("url") if is_audio else None
        incoming_text = str(message_text or "")

        if incoming_text or is_audio:
            print(f"📩 Mensagem recebida de {sender_name} ({phone_str}). Adicionando ao buffer...")
            
            # Se já houver uma tarefa de espera para este telefone, cancelamos para reiniciar o cronômetro
            if phone_str in message_buffers:
                old_buffer = message_buffers[phone_str]
                if old_buffer.get('task'):
                    old_buffer['task'].cancel()
                
                # Acumula o conteúdo
                new_content = old_buffer['content'] + "\n" + incoming_text if incoming_text else old_buffer['content']
                message_buffers[phone_str]['content'] = new_content.strip()
                # Se vier um áudio novo, priorizamos ou mantemos o anterior (simplificado: mantém o último)
                if is_audio:
                    message_buffers[phone_str]['is_audio'] = True
                    message_buffers[phone_str]['audio_url'] = audio_url
            else:
                # Cria novo buffer
                message_buffers[phone_str] = {
                    "content": incoming_text,
                    "sender_name": sender_name,
                    "is_audio": is_audio,
                    "audio_url": audio_url,
                    "task": None
                }

            # Inicia/Reinicia a tarefa de processamento atrasado
            task = asyncio.create_task(process_delayed_messages(phone_str))
            message_buffers[phone_str]['task'] = task
            
            return {"status": "buffering", "wait": "25s"}
        
        print(f"ℹ️ Webhook recebido mas ignorado (tipo: {message_type}) de {phone}")
        return {"status": "ignored"}
    except Exception as e:
        print(f"❌ Erro crítico no webhook Z-API: {e}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8080)))
