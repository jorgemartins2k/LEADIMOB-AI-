from fastapi import FastAPI, Request
import uvicorn
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from scheduler import start_scheduler
from raquel import RaquelAgent

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicia o relógio de follow-ups em segundo plano ao ligar o servidor
    start_scheduler()
    yield
    # Lógica de encerramento se necessário (opcional)

app = FastAPI(
    title="Raquel AI Engine - Leadimob-AI",
    lifespan=lifespan
)
raquel = RaquelAgent()

@app.get("/")
def home():
    return {"status": "online", "agent": "Raquel", "scheduler": "active"}

@app.post("/webhook/zapi")
async def handle_zapi_webhook(request: Request):
    """
    Recebe mensagens do WhatsApp via Z-API
    """
    try:
        data = await request.json()
        
        phone = data.get("phone")
        message_text = data.get("text", {}).get("message")
        sender_name = data.get("senderName")
        message_type = data.get("type", "text")
        
        if not phone:
            return {"status": "ignored"}

        # 1. Lógica de Confirmação do Corretor ("ok")
        if message_text and message_text.lower().strip() == "ok":
            if raquel.db.confirm_hot_lead(phone):
                print(f"Corretor {sender_name} confirmou recebimento do lead quente.")
                return {"status": "broker_confirmed"}
            return {"status": "ok_ignored"}

        # 2. Processamento de Mensagem (Texto ou Áudio)
        is_audio = message_type in ["audio", "ptt"]
        audio_url = data.get("audio", {}).get("url") if is_audio else None

        if message_text or is_audio:
            print(f"Mensagem ({message_type}) recebida de {sender_name} ({phone})")
            raquel.process_message(phone, message_text, sender_name, is_audio=is_audio, audio_url=audio_url)
            return {"status": "processed"}
        
        return {"status": "ignored"}
    except Exception as e:
        print(f"Erro ao processar webhook da Z-API: {e}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8080)))
