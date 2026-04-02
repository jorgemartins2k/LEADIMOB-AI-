"""
buffer_manager.py — Gerenciador de buffer de mensagens com debouncing de 25s
Correções aplicadas:
- Sem alterações de lógica (estava correto), apenas melhorias de robustez
"""
import asyncio
import logging
from typing import Dict, Any, List, Optional, Callable

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("MessageBuffer")


class MessageBufferManager:
    """
    Agrupa mensagens do mesmo número por 25s antes de processar,
    evitando respostas fragmentadas quando o cliente manda várias mensagens seguidas.
    Suporta múltiplos ciclos: mensagens que chegam durante o processamento
    são guardadas e disparadas em novo ciclo ao final.
    """

    def __init__(self, process_callback: Callable) -> None:
        self.buffers: Dict[str, Dict[str, Any]] = {}
        self.process_callback = process_callback

    async def handle_incoming_message(
        self,
        phone: str,
        message: str,
        sender_name: str,
        is_audio: bool = False,
        audio_url: Optional[str] = None
    ) -> None:
        """
        Entrada principal para novas mensagens vindas do webhook.
        Estados possíveis: 'idle', 'waiting', 'processing'
        """
        if phone not in self.buffers:
            self.buffers[phone] = {
                "messages": [],
                "audio_urls": [],
                "is_audio": False,
                "sender_name": sender_name,
                "task": None,
                "status": "idle"
            }

        buf = self.buffers[phone]

        # Acumula conteúdo independente do estado atual
        if message:
            buf["messages"].append(message.strip())
        if audio_url:
            buf["audio_urls"].append(audio_url)
            buf["is_audio"] = True

        logger.info(f"📩 [BUFFER] Mensagem adicionada para {phone}. Total no buffer: {len(buf['messages'])} msgs.")

        # Se a IA já está respondendo, apenas guardamos — o ciclo atual vai relançar
        if buf["status"] == "processing":
            logger.info(f"⏳ [BUFFER] {phone} em processamento. Mensagem guardada para próximo ciclo.")
            return

        # Se já havia um timer rodando, reseta os 25s (nova mensagem chegou)
        if buf["task"] and not buf["task"].done():
            buf["task"].cancel()
            logger.info(f"🔄 [BUFFER] Timer resetado para {phone}.")

        buf["status"] = "waiting"
        buf["task"] = asyncio.create_task(self._wait_and_trigger(phone))

    async def _wait_and_trigger(self, phone: str) -> None:
        try:
            await asyncio.sleep(25)
            await self._run_processing_cycle(phone)
        except asyncio.CancelledError:
            pass  # Timer cancelado por nova mensagem — comportamento esperado
        except Exception as e:
            logger.error(f"❌ Erro no timer do buffer para {phone}: {e}")

    async def _run_processing_cycle(self, phone: str) -> None:
        buf = self.buffers[phone]
        buf["status"] = "processing"

        # Captura snapshot do buffer atual e limpa imediatamente
        # para que mensagens que chegarem durante o processamento
        # sejam acumuladas no próximo ciclo
        consolidated_text = "\n".join(buf["messages"])
        current_audio_urls = list(buf["audio_urls"])
        current_is_audio = buf["is_audio"]
        sender_name = buf["sender_name"]

        buf["messages"] = []
        buf["audio_urls"] = []
        buf["is_audio"] = False

        logger.info(f"🚀 [BUFFER] Iniciando processamento para {phone}...")

        try:
            await self.process_callback(
                phone,
                consolidated_text,
                sender_name,
                is_audio=current_is_audio,
                audio_urls=current_audio_urls
            )
        except Exception as e:
            logger.error(f"❌ [BUFFER] Erro durante processamento para {phone}: {e}")
        finally:
            logger.info(f"✅ [BUFFER] Processamento finalizado para {phone}.")

            # Se chegaram novas mensagens enquanto a IA respondia, dispara novo ciclo
            if buf["messages"] or buf["audio_urls"]:
                logger.info(f"🔄 [BUFFER] Novo ciclo detectado para {phone}. Reiniciando timer.")
                buf["status"] = "waiting"
                buf["task"] = asyncio.create_task(self._wait_and_trigger(phone))
            else:
                buf["status"] = "idle"
                buf["task"] = None