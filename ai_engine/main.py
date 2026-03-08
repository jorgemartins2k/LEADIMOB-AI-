from fastapi import FastAPI, Request
import uvicorn
import os
from dotenv import load_dotenv
from scheduler import start_scheduler
from raquel import RaquelAgent

load_dotenv()

app = FastAPI(title="Raquel AI Engine - Leadimob-AI")
raquel = RaquelAgent()

@app.get("/")
def home():
    return {"status": "online", "agent": "Raquel"}

@app.post("/webhook/zapi")
async def handle_zapi_webhook(request: Request):
    """
    Recebe mensagens do WhatsApp via Z-API
    """
    data = await request.json()
    
    # Lógica simplificada de processamento
    phone = data.get("phone")
    message = data.get("text", {}).get("message")
    sender_name = data.get("senderName")
    
    if phone and message:
        print(f"Mensagem recebida de {sender_name} ({phone}): {message}")
        # Aqui a Raquel processará e responderá
        response = raquel.process_message(phone, message, sender_name)
        return {"status": "processed"}
    
    return {"status": "ignored"}

if __name__ == "__main__":
    # Inicia o relógio de follow-ups em segundo plano
    start_scheduler()
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8080)))
