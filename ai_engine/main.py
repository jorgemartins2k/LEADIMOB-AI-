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

from buffer_manager import MessageBufferManager # pyre-ignore

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
    # Inicializa o gerenciador de buffers passando a função de processamento da Raquel
    buffer_manager = MessageBufferManager(raquel.process_message)
except Exception as e:
    print(f"⚠️ ERRO CRÍTICO ao inicializar RaquelAgent: {e}")
    import traceback
    traceback.print_exc()

@app.get("/")
def home() -> Dict[str, str]:
    return {"status": "online", "agent": "Raquel", "scheduler": "active", "debouncing": "25s"}

# Antiga função process_delayed_messages removida em favor do MessageBufferManager

@app.get("/ping")
def ping() -> Dict[str, str]:
    return {"status": "ok", "timestamp": str(datetime.datetime.now())}

@app.post("/webhook/zapi")
async def handle_zapi_webhook(request: Request, background_tasks: BackgroundTasks) -> Dict[str, str]:
    """
    Recebe mensagens do WhatsApp via Z-API
    """
    try:
        data_raw: Any = await request.json()
        data: Dict[str, Any] = data_raw if isinstance(data_raw, dict) else {}
        
        # --- PREVENÇÃO DE LOOP INFINITO ---
        # Ignora mensagens enviadas pela própria instância (ex: IA ou Corretor via WhatsApp Web)
        is_from_me = data.get("fromMe", False)
        if isinstance(is_from_me, str):
            is_from_me = is_from_me.lower() == "true"
            
        if is_from_me:
            print(f"ℹ️ Webhook ignorado (Prevenindo Loop): Mensagem enviada pelo próprio número (fromMe=True).")
            return {"status": "ignored", "reason": "fromMe=True"}
            
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

        # 1. SEPARAÇÃO TOTAL: Corretor vs Lead
        if not raquel:
            print("⚠️ Erro: RaquelAgent não foi inicializado corretamente.")
            return {"status": "error", "message": "RaquelAgent not initialized"}

        is_broker = raquel.db.is_registered_broker(phone_str)
        if is_broker:
            # Se for um corretor cadastrado, tratamos APENAS como ação de corretor
            was_confirmed = raquel.db.confirm_hot_lead(phone_str)
            if was_confirmed:
                print(f"✅ Corretor {sender_name} ({phone_str}) confirmou recebimento de lead.")
            else:
                print(f"ℹ️ Interação de corretor ({sender_name}) ignorada pelo motor de leads.")
            
            # BLOQUEIO: Se é corretor, NUNCA segue para o processamento de Raquel como lead
            return {"status": "broker_acknowledged"}

        # 2. Processamento de Mensagem com o novo MessageBufferManager
        if incoming_text or is_audio:
            # Encaminha para o gerenciador que cuida do agrupamento (25s) e múltiplos ciclos
            await buffer_manager.handle_incoming_message(
                phone_str, 
                incoming_text, 
                sender_name, 
                is_audio=is_audio, 
                audio_url=audio_url
            )
            
            return {"status": "buffering", "wait": "25-30s", "info": "Sua mensagem foi agrupada para processamento consultivo."}
        
        print(f"ℹ️ Webhook recebido mas ignorado (tipo: {raw_type}) de {phone}")
        return {"status": "ignored"}
    except Exception as e:
        print(f"❌ Erro crítico no webhook Z-API: {e}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8080)))
