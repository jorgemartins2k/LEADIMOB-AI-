import asyncio
import logging
from typing import Dict, Any, List, Optional, Callable

# Configuração de logging simples
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("MessageBuffer")

class MessageBufferManager:
    """
    Gerenciador de buffers de mensagens para evitar respostas fragmentadas da IA.
    Implementa debouncing de 25-30s e suporte a múltiplos ciclos de processamento.
    """
    def __init__(self, process_callback: Callable):
        self.buffers: Dict[str, Dict[str, Any]] = {}
        self.process_callback = process_callback
        # estados possíveis para cada phone: 'idle', 'waiting', 'processing'

    async def handle_incoming_message(self, phone: str, message: str, sender_name: str, is_audio: bool = False, audio_url: Optional[str] = None):
        """
        Entrada principal para novas mensagens de webhook.
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
        
        # 1. Adicionar conteúdo ao buffer (mesmo se estiver processando)
        if message:
            buf["messages"].append(message.strip())
        if audio_url:
            buf["audio_urls"].append(audio_url)
            buf["is_audio"] = True
        
        logger.info(f"📩 [BUFFER] Mensagem adicionada para {phone}. Total: {len(buf['messages'])} msgs.")

        # 2. Se já estiver processando a IA, apenas guardamos e retornamos.
        # O ciclo atual verificará o buffer ao finalizar.
        if buf["status"] == "processing":
            logger.info(f"⏳ [BUFFER] Usuário {phone} em processamento. Mensagem armazenada para o próximo ciclo.")
            return

        # 3. Se estiver em 'waiting' (timer rodando), cancelamos o timer anterior para resetar os 25s
        if buf["task"] and not buf["task"].done():
            buf["task"].cancel()
            logger.info(f"re-timer resetado para {phone} (nova mensagem chegou)")
        
        # 4. Iniciar/Reiniciar o timer de espera (Debouncing)
        buf["status"] = "waiting"
        buf["task"] = asyncio.create_task(self._wait_and_trigger(phone))

    async def _wait_and_trigger(self, phone: str):
        """
        Aguarda o intervalo de silêncio do usuário antes de disparar o processamento.
        """
        try:
            # Tempo sugerido entre 25 a 30 segundos
            await asyncio.sleep(25)
            await self._run_processing_cycle(phone)
        except asyncio.CancelledError:
            # Timer foi resetado por uma nova mensagem
            pass
        except Exception as e:
            logger.error(f"❌ Erro no timer do buffer para {phone}: {e}")

    async def _run_processing_cycle(self, phone: str):
        """
        Executa o processamento da IA com o conteúdo consolidado.
        """
        buf = self.buffers[phone]
        
        # Marcar como processando para bloquear novos timers
        buf["status"] = "processing"
        
        # Captura o estado atual do buffer para processamento
        consolidated_text = "\n".join(buf["messages"])
        current_audio_urls = list(buf["audio_urls"])
        current_is_audio = buf["is_audio"]
        sender_name = buf["sender_name"]
        
        # LIMPAR o buffer IMEDIATAMENTE para que novas mensagens durante a resposta da IA
        # sejam capturadas em um novo buffer limpo.
        buf["messages"] = []
        buf["audio_urls"] = []
        buf["is_audio"] = False
        
        logger.info(f"🚀 [BUFFER] Processamento iniciado para {phone} (IA respondendo...)")
        
        try:
            # Chama a lógica original da Raquel (process_message)
            await self.process_callback(
                phone, 
                consolidated_text, 
                sender_name, 
                is_audio=current_is_audio, 
                audio_urls=current_audio_urls
            )
        except Exception as e:
            logger.error(f"❌ [BUFFER] Erro durante o processamento da IA para {phone}: {e}")
        finally:
            logger.info(f"✅ [BUFFER] Processamento finalizado para {phone}.")
            
            # Verificação Pós-Processamento: Chegaram novas mensagens enquanto a IA falava?
            if buf["messages"] or buf["audio_urls"]:
                logger.info(f"🔄 [BUFFER] Novo ciclo detectado para {phone}. Reiniciando timer.")
                buf["status"] = "waiting"
                buf["task"] = asyncio.create_task(self._wait_and_trigger(phone))
            else:
                buf["status"] = "idle"
                buf["task"] = None
