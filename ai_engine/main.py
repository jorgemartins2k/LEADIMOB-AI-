from fastapi import FastAPI, Request # pyre-ignore
from typing import Dict, Any, Optional
import uvicorn # pyre-ignore
import os
from dotenv import load_dotenv # pyre-ignore
from contextlib import asynccontextmanager
from scheduler import start_scheduler
from raquel import RaquelAgent

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
raquel: RaquelAgent = RaquelAgent()

@app.get("/")
def home() -> Dict[str, str]:
    return {"status": "online", "agent": "Raquel", "scheduler": "active"}

@app.post("/webhook/zapi")
async def handle_zapi_webhook(request: Request) -> Dict[str, str]:
    """
    Recebe mensagens do WhatsApp via Z-API
    """
    try:
        data: Dict[str, Any] = await request.json()
        
        phone: Optional[str] = data.get("phone")
        message_text: Optional[str] = data.get("text", {}).get("message")
        sender_name: str = str(data.get("senderName", "Cliente"))
        message_type: str = str(data.get("type", "text"))
        
        if not phone:
            print("⚠️ Webhook ignorado: campo 'phone' ausente.")
            return {"status": "ignored"}

        # 1. Lógica de Confirmação do Corretor ("ok")
        if message_text and message_text.lower().strip() == "ok":
            if raquel.db.confirm_hot_lead(phone):
                print(f"✅ Corretor {sender_name} ({phone}) confirmou recebimento do lead quente.")
                return {"status": "broker_confirmed"}
            return {"status": "ok_ignored"}

        # 2. Processamento de Mensagem (Texto ou Áudio)
        is_audio: bool = message_type in ["audio", "ptt"]
        audio_url: Optional[str] = data.get("audio", {}).get("url") if is_audio else None

        if message_text or is_audio:
            print(f"📩 Mensagem ({message_type}) recebida de {sender_name} ({phone})")
            raquel.process_message(phone, str(message_text or ""), sender_name, is_audio=is_audio, audio_url=audio_url)
            return {"status": "processed"}
        
        print(f"ℹ️ Webhook recebido mas ignorado (tipo: {message_type}) de {phone}")
        return {"status": "ignored"}
    except Exception as e:
        print(f"❌ Erro crítico no webhook Z-API: {e}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8080)))
