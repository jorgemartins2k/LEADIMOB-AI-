"""
main.py — Servidor FastAPI: ponto de entrada do sistema Raquel
Correções aplicadas:
1. Tratamento de erro na inicialização do RaquelAgent mais explícito
2. Sem alterações de lógica (estava correto)
3. Pequenas melhorias de robustez e clareza
"""
from fastapi import FastAPI, Request, BackgroundTasks
from typing import Dict, Any, Optional
import uvicorn
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import asyncio
import json
import datetime

from scheduler import start_scheduler
from raquel import RaquelAgent
from buffer_manager import MessageBufferManager

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield


app = FastAPI(
    title="Raquel AI Engine - Leadimob-AI",
    lifespan=lifespan
)

raquel: Optional[RaquelAgent] = None
buffer_manager: Optional[MessageBufferManager] = None

try:
    raquel = RaquelAgent()
    buffer_manager = MessageBufferManager(raquel.process_message)
    print("✅ [MAIN] RaquelAgent e BufferManager inicializados com sucesso.")
except Exception as e:
    print(f"❌ [MAIN] ERRO CRÍTICO ao inicializar: {e}")
    import traceback
    traceback.print_exc()


@app.get("/")
def home() -> Dict[str, str]:
    status = "online" if raquel else "degraded"
    return {
        "status": status,
        "agent": "Raquel",
        "scheduler": "active",
        "debouncing": "25s"
    }


@app.get("/ping")
def ping() -> Dict[str, str]:
    return {"status": "ok", "timestamp": str(datetime.datetime.now())}


@app.post("/webhook/zapi")
async def handle_zapi_webhook(request: Request, background_tasks: BackgroundTasks) -> Dict[str, str]:
    """
    Recebe mensagens do WhatsApp via Z-API.
    """
    try:
        data_raw: Any = await request.json()
        data: Dict[str, Any] = data_raw if isinstance(data_raw, dict) else {}

        # Previne loop infinito: ignora mensagens enviadas pelo próprio número
        is_from_me = data.get("fromMe", False)
        if isinstance(is_from_me, str):
            is_from_me = is_from_me.lower() == "true"

        if is_from_me:
            print("ℹ️ Webhook ignorado (fromMe=True).")
            return {"status": "ignored", "reason": "fromMe=True"}

        # Salva o webhook para debug (não crítico, nunca deve travar o fluxo)
        try:
            debug_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "last_webhook.json")
            with open(debug_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as dbg_err:
            print(f"⚠️ Erro ao salvar log de webhook: {dbg_err}")

        phone: Optional[str] = data.get("phone")
        if not phone:
            print("⚠️ Webhook ignorado: campo 'phone' ausente.")
            return {"status": "ignored", "reason": "phone missing"}

        phone_str = str(phone)

        # Parsing do tipo de mensagem (suporte Z-API v1 e v2)
        raw_type = data.get("type", "text")
        is_audio = False
        audio_url = None
        message_text = None

        if raw_type == "ReceivedCallback":
            # Z-API v2
            if "text" in data and isinstance(data["text"], dict):
                message_text = data["text"].get("message")

            audio_obj = data.get("audio") or data.get("ptt") or {}
            if isinstance(audio_obj, dict) and audio_obj:
                audio_url = audio_obj.get("url") or audio_obj.get("audioUrl")

            if not audio_url:
                audio_url = data.get("audioUrl") or data.get("url")

            if audio_url:
                is_audio = True
                print(f"🎙️ Audio URL extraída: {audio_url}")
            elif "audio" in data or "ptt" in data:
                is_audio = True
                print(f"⚠️ É áudio mas URL não encontrada. Keys: {list(data.keys())}")
        else:
            # Z-API v1 (legado)
            is_audio = raw_type in ["audio", "ptt"]
            text_data = data.get("text", {})
            message_text = text_data.get("message") if isinstance(text_data, dict) else None
            if is_audio:
                audio_url = data.get("audioUrl") or (
                    data.get("audio", {}).get("url") if isinstance(data.get("audio"), dict) else None
                )

        incoming_text = str(message_text or "")
        sender_name = str(data.get("senderName", "Cliente"))

        if not raquel or not buffer_manager:
            print("❌ RaquelAgent não inicializado. Verifique as variáveis de ambiente.")
            return {"status": "error", "message": "Agent not initialized"}

        # Separação: Corretor vs Lead
        is_broker = raquel.db.is_registered_broker(phone_str)
        if is_broker:
            was_confirmed = raquel.db.confirm_hot_lead(phone_str)
            if was_confirmed:
                print(f"✅ Corretor {sender_name} ({phone_str}) confirmou recebimento de lead.")
            else:
                print(f"ℹ️ Interação de corretor ({sender_name}) ignorada.")
            return {"status": "broker_acknowledged"}

        # Encaminha para o buffer (agrupa mensagens por 25s)
        if incoming_text or is_audio:
            await buffer_manager.handle_incoming_message(
                phone_str,
                incoming_text,
                sender_name,
                is_audio=is_audio,
                audio_url=audio_url
            )
            return {
                "status": "buffering",
                "wait": "25-30s",
                "info": "Mensagem agrupada para processamento."
            }

        print(f"ℹ️ Webhook recebido mas ignorado (tipo: {raw_type}) de {phone}")
        return {"status": "ignored"}

    except Exception as e:
        print(f"❌ Erro crítico no webhook Z-API: {e}")
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8080)))