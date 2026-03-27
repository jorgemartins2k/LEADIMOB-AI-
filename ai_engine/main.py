from fastapi import FastAPI, Request, BackgroundTasks # pyre-ignore
from typing import Dict, Any, Optional
import uvicorn # pyre-ignore
import os
from dotenv import load_dotenv # pyre-ignore
from contextlib import asynccontextmanager
import asyncio
import json
import datetime
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
raquel: Optional[RaquelAgent] = None
try:
    raquel = RaquelAgent()
except Exception as e:
    print(f"⚠️ ERRO CRÍTICO ao inicializar RaquelAgent: {e}")
    import traceback
    traceback.print_exc()

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
        try:
            print(f"🕒 Janela de debouncing fechada para {phone_str}. Processando {len(buffer['content'])} chars + audio={buffer['is_audio']}")
            # Chamamos o processamento real da Raquel (agora assíncrono)
            await raquel.process_message(
                phone_str, 
                buffer['content'], 
                buffer['sender_name'], 
                is_audio=buffer['is_audio'], 
                audio_urls=buffer.get('audio_urls', [])
            )
        except Exception as e:
            print(f"❌ Erro fatal ao processar mensagem para {phone_str}:")
            import traceback
            traceback.print_exc()

@app.get("/ping")
def ping() -> Dict[str, str]:
    return {"status": "ok", "timestamp": str(datetime.datetime.now())}

@app.get("/clear-memory-secret-99")
async def clear_memory_endpoint():
    """
    Endpoint temporário para resetar a memória da IA (conversas).
    """
    if not raquel or not raquel.db or not raquel.db.supabase:
        return {"status": "error", "message": "Database not initialized"}
    
    try:
        from datetime import datetime
        future = "2099-01-01T00:00:00"
        print("⏳ [HTTP] Apagando memória de conversas...")
        result = raquel.db.supabase.table("conversations").delete().lt("sent_at", future).execute()
        return {"status": "success", "messages_removed": len(result.data)}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/webhook/zapi")
async def handle_zapi_webhook(request: Request, background_tasks: BackgroundTasks) -> Dict[str, str]:
    """
    Recebe mensagens do WhatsApp via Z-API
    """
    try:
        data_raw: Any = await request.json()
        data: Dict[str, Any] = data_raw if isinstance(data_raw, dict) else {}
        
        # --- WEBHOOK DEBUGGER (SEGURO) ---
        try:
            debug_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "last_webhook.json")
            with open(debug_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as dbg_err:
            print(f"⚠️ Erro ao salvar log de webhook: {dbg_err}")
        # ------------------------
        
        phone: Optional[str] = data.get("phone")
        
        phone_str: str = str(phone)
        
        # --- PARSING ROBUSTO Z-API V2 ---
        raw_type = data.get("type", "text")
        is_audio = False
        audio_url = None
        message_text = None
        
        # Z-API v2 envia tudo como 'ReceivedCallback'
        if raw_type == "ReceivedCallback":
            if "text" in data and isinstance(data["text"], dict):
                message_text = data["text"].get("message")
            
            # Busca exaustiva pela URL do áudio no v2
            audio_obj = data.get("audio") or data.get("ptt") or {}
            if isinstance(audio_obj, dict) and audio_obj:
                audio_url = audio_obj.get("url") or audio_obj.get("audioUrl")
            
            # Última tentativa: campos de topo
            if not audio_url:
                audio_url = data.get("audioUrl") or data.get("url")
            
            if audio_url:
                is_audio = True
                print(f"🎙️ [DEBUG] Audio URL extraída: {audio_url}")
            elif "audio" in data or "ptt" in data:
                is_audio = True # Sabemos que é áudio, mas o link falhou
                print(f"⚠️ [DEBUG] É áudio mas a URL NÃO foi encontrada. Keys: {list(data.keys())}")
        else:
            # Compatibilidade com webhooks legados (v1)
            is_audio = raw_type in ["audio", "ptt"]
            text_data = data.get("text", {})
            message_text = text_data.get("message") if isinstance(text_data, dict) else None
            if is_audio:
                audio_url = data.get("audioUrl") or (data.get("audio", {}).get("url") if isinstance(data.get("audio"), dict) else None)

        incoming_text = str(message_text or "")
        sender_name: str = str(data.get("senderName", "Cliente"))
        
        if not phone:
            print("⚠️ Webhook ignorado: campo 'phone' ausente.")
            return {"status": "ignored"}

        # 1. Lógica de Confirmação do Corretor
        if not raquel:
            print("⚠️ Erro: RaquelAgent não foi inicializado corretamente.")
            return {"status": "error", "message": "RaquelAgent not initialized"}

        is_broker_msg = raquel.db.confirm_hot_lead(phone_str)
        if is_broker_msg:
            print(f"✅ Corretor {sender_name} ({phone_str}) confirmou recebimento. Mensagem: {message_text}")
            if message_text and message_text.lower().strip() == "ok":
                return {"status": "broker_confirmed"}
            return {"status": "broker_confirmed"}

        # 2. Processamento de Mensagem com Debouncing
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
                
                if is_audio and audio_url:
                    message_buffers[phone_str]['is_audio'] = True
                    message_buffers[phone_str].setdefault('audio_urls', []).append(audio_url)
            else:
                # Cria novo buffer
                message_buffers[phone_str] = {
                    "content": incoming_text,
                    "sender_name": sender_name,
                    "is_audio": is_audio,
                    "audio_urls": [audio_url] if is_audio and audio_url else [],
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
