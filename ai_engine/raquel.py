import os
import requests # pyre-ignore
import datetime
import pytz # pyre-ignore
import time
import random
import asyncio
from typing import List, Dict, Any, Optional, Union
from openai import OpenAI # pyre-ignore
from dotenv import load_dotenv # pyre-ignore
from database import Database

load_dotenv()

class RaquelAgent:
    client: OpenAI
    db: Database
    tz: datetime.tzinfo

    def __init__(self) -> None:
        # Validação robusta de chaves
        api_key: Optional[str] = os.getenv("OPENAI_API_KEY")
        if not api_key:
            print("❌ ERRO CRÍTICO: Variável 'OPENAI_API_KEY' não encontrada no ambiente!")
            print("Vá no painel do Railway > Seu Serviço > Variables e adicione a chave.")
            raise RuntimeError("OPENAI_API_KEY ausente.")

        self.client = OpenAI(api_key=api_key)
        self.db = Database()
        self.tz = pytz.timezone('America/Sao_Paulo')

    def get_system_prompt(self, context: Dict[str, Any], lead_name: str) -> str:
        broker_name: str = context.get('broker_name', 'Corretor')
        creci: str = context.get('broker_creci', 'Não informado')
        agency: str = context.get('broker_agency', 'Autônomo')
        presentation: str = context.get('broker_presentation', '')
        lead_notes: str = context.get('lead_notes', '')
        daily_focus: str = context.get('daily_focus', '')

        focus_instructions = f"""
        [ATENCAO! FOCO DE VENDAS DE HOJE]: O corretor determinou que o FOCO PRINCIPAL de vendas para hoje e: "{daily_focus}".
        Sempre que fizer sentido no contexto da conversa, voce deve introduzir e priorizar este lancamento especifico.
        Se o lead recusar ou se o perfil/orcamento for incompativel, ignore essa diretriz e siga qualificando normalmente.
        """ if daily_focus else ""

        return f"""
        VOCÊ É A RAQUEL — CONSULTORA IMOBILIÁRIA (FOCO EM QUALIFICAÇÃO)
        Você é a assistente oficial do corretor de imóveis {broker_name} (CRECI: {creci}, Agência: {agency}).
        Seu objetivo primordial é COLETAR DADOS e QUALIFICAR o cliente {lead_name} de forma profunda e consultiva.
        As informações que você coleta são mais importantes do que o portfólio de imóveis, pois o {broker_name} buscará opções exclusivas baseadas no perfil que VOCÊ traçar.

        ===== SUA PERSONA =====
        - Consultora Experiente e Tranquila: Transmita segurança e calma. Você não tem pressa de vender, tem pressa de ENTENDER.
        - Discreta: Faça perguntas sobre valores e finanças de forma natural e sem pressão.
        - Analítica: Deduza o perfil do cliente a partir da profissão ou estilo de vida que ele mencionar. 
        - Humana: Linguagem leve, natural, tom amigável.
        - JAMAIS use a palavra "virtual". Você é a assistente real do {broker_name}. Só revele ser IA se perguntarem diretamente.

        ===== REGRAS DE FORMATO (WHATSAPP) =====
        1. CURTO E NATURAL: Mensagens de 2-3 frases. Use emojis para dar tom humano.
        2. UMA PERGUNTA POR VEZ: Nunca atropele o cliente com várias perguntas.
        3. ESCUTA ATIVA: Valide o que ele disse antes de perguntar o próximo item.

        {focus_instructions}

        [INSTRUÇÕES DO CORRETOR]:
        {presentation if presentation else "Tom polido e focado em alta qualidade de atendimento."}

        ===== FLUXO DE QUALIFICAÇÃO (ORDEM OBRIGATÓRIA) =====
        NÃO pule etapas. Siga esta sequência para coletar os dados:

        ETAPA 1 — DESCOBERTA DE INTENÇÃO E NECESSIDADE:
        Agradeça o contato ou boas vindas (se for outbound). Descubra o objetivo principal:
        - É para moradia própria ou investimento?
        - O que é inegociável em um imóvel para você hoje? (Ex: espaço, localização, segurança para os filhos).

        ETAPA 2 — PERFIL E DEDUÇÃO (PROFISSÃO):
        Busque entender quem é a pessoa. Se ela mencionar a profissão (ex: médico, empresário, professor), use isso para deduzir o perfil de imóvel que faz sentido para ela, mas confirme sutilmente.
        Ex: "Entendi, {lead_name}. Como você mencionou que trabalha com [profissão], imagino que uma localização que facilite seu deslocamento seja prioridade, certo?"

        ETAPA 3 — INVESTIMENTO (PENÚLTIMA PERGUNTA):
        Apenas após entender a necessidade, pergunte sobre o valor planejado. Seja discreta.
        Ex: "Para que eu possa direcionar as melhores oportunidades, você já tem em mente uma faixa de investimento que gostaria de manter?"

        ETAPA 4 — FORMA DE PAGAMENTO (ÚLTIMA PERGUNTA):
        Esta é a pergunta final da qualificação.
        Ex: "Perfeito. E sobre a forma de aquisição, vocês pretendem utilizar financiamento ou seria algo mais direto/à vista? Pergunto para saber quais condições de negociação consigo buscar pra você."

        ===== USO DO PORTFÓLIO =====
        O portfólio disponível servirá APENAS como referência. 
        - Se houver um match óbvio, mencione: "Inclusive, temos uma opção no [Bairro] que bate exatamente com isso que você falou."
        - Se NÃO houver match, diga: "Entendi perfeitamente seu perfil. O {broker_name} tem acesso a opções exclusivas fora do mercado comum e vou passar esses detalhes pra ele buscar exatamente o que você precisa."

        ===== ENCERRAMENTO E TRANSFERÊNCIA =====
        Após coletar os dados, sugira o contato direto do corretor:
        Ex: "Vou passar agora mesmo esse seu perfil completo pro {broker_name}. Ele vai fazer uma curadoria específica e te chama pra combinarem os próximos passos, tá bom?"
        Neste momento, use [ALERT_BROKER] no final.

        Lembre-se: Use APENAS o que o cliente responder. Se ele for vago, tente aprofundar gentilmente.
        """

    def is_within_schedule(self, schedule: Any) -> bool:
        """
        Verifica se o fuso de Brasília (now) está dentro do expediente do corretor
        """
        now: datetime.datetime = datetime.datetime.now(self.tz)
        
        # Mon=0 -> Mon=1, ..., Sun=6 -> Sun=0 
        db_day_of_week: int = (now.weekday() + 1) % 7
        
        schedule_list: List[Dict[str, Any]] = schedule if isinstance(schedule, list) else []
        today_config: Optional[Dict[str, Any]] = None
        for s in schedule_list:
            if s.get('day_of_week') == db_day_of_week:
                today_config = s
                break
        
        if not isinstance(today_config, dict):
            return False
            
        if not today_config.get('is_active'):
            return False
            
        try:
            def parse_time(t_str: Optional[str]) -> Optional[datetime.time]:
                if not t_str: return None
                t_val: str = str(t_str)
                parts = t_val.split(":")
                formatted_time = f"{parts[0]}:{parts[1]}" if len(parts) >= 2 else t_val
                return datetime.datetime.strptime(formatted_time, "%H:%M").time()

            start_time_val = today_config.get('start_time')
            end_time_val = today_config.get('end_time')
            
            start_time: Optional[datetime.time] = parse_time(str(start_time_val) if start_time_val else None)
            end_time: Optional[datetime.time] = parse_time(str(end_time_val) if end_time_val else None)
            current_time: datetime.time = now.time()
            
            if start_time is None: return False
            if end_time is None: return False
            return start_time <= current_time <= end_time
        except Exception as e:
            print(f"⚠️ Erro ao validar horário: {e}")
            return False

    def get_next_working_slot(self, schedule: Any) -> tuple[str, str]:
        """
        Retorna (texto_dia, texto_hora) do próximo expediente do corretor
        """
        schedule_list: List[Dict[str, Any]] = schedule if isinstance(schedule, list) else []
        now: datetime.datetime = datetime.datetime.now(self.tz)
        current_db_day: int = (now.weekday() + 1) % 7
        days_map = {0: "no domingo", 1: "na segunda-feira", 2: "na terça-feira", 3: "na quarta-feira", 4: "na quinta-feira", 5: "na sexta-feira", 6: "no sábado"}

        def parse_start_time(cfg: Dict[str, Any]) -> str:
            t_str = str(cfg.get('start_time', '08:00')).split(":")
            return f"{t_str[0]}:{t_str[1]}" if len(t_str) >= 2 else "08:00"

        for offset in range(8):
            check_day = (current_db_day + offset) % 7
            for s in schedule_list:
                if s.get('day_of_week') == check_day and s.get('is_active'):
                    start_time_str = parse_start_time(s)
                    if offset == 0:
                        s_hour = int(start_time_str.split(":")[0])
                        s_min = int(start_time_str.split(":")[1])
                        if now.hour < s_hour or (now.hour == s_hour and now.minute < s_min):
                            return "ainda hoje", start_time_str
                    elif offset == 1:
                        return "amanhã", start_time_str
                    else:
                        return days_map.get(check_day, "no próximo dia útil"), start_time_str
                        
        return "no próximo dia útil", "08:00"

    def transcribe_audio(self, audio_url: str) -> str:
        """
        Baixa o áudio da Z-API e transcreve usando OpenAI Whisper
        """
        temp_path: str = "temp_audio.ogg"
        try:
            print(f"🎙️ Baixando áudio para transcrição: {audio_url}")
            audio_response: requests.Response = requests.get(audio_url)
            audio_response.raise_for_status()
            
            with open(temp_path, "wb") as f:
                f.write(audio_response.content)
            
            with open(temp_path, "rb") as audio_file:
                transcript = self.client.audio.transcriptions.create(
                    model="whisper-1", 
                    file=audio_file
                )
            return str(transcript.text)
        except Exception as e:
            print(f"❌ Erro na transcrição: {e}")
            return "[Erro ao transcrever áudio]"
        finally:
            if os.path.exists(temp_path):
                try: os.remove(temp_path)
                except: pass
        return "[Erro ao transcrever áudio]"

    async def process_message(self, phone: str, message: str, sender_name: str, is_audio: bool = False, audio_url: Optional[str] = None) -> str:
        print(f"📥 Processando mensagem de {sender_name} ({phone})")
        
        # 1. Busca dados do corretor
        context: Optional[Dict[str, Any]] = self.db.get_broker_by_lead_phone(phone)
        if not context:
            print(f"⚠️ Lead {phone} não encontrado no banco.")
            return "Lead não encontrado no banco."

        user_id: str = context.get('user_id', '')
        lead_id: str = context.get('lead_id', '')
        lead_real_name: str = context.get('lead_name', 'Cliente')
        broker_name: str = context.get('broker_name', 'Corretor')

        # 2. SE FOR ÁUDIO, TRANSCREVE
        if is_audio and audio_url:
            message = self.transcribe_audio(audio_url)
            print(f"📝 Transcrição: {message}")

        # 3. VERIFICAÇÃO DE EXPEDIENTE (ANTES BLOQUEAVA, AGORA A IA ATENDE 24/7)
        schedule = self.db.get_broker_schedule(user_id)

        # 4. BUSCA HISTÓRICO E PORTFÓLIO
        history: List[Dict[str, Any]] = self.db.get_chat_history(lead_id)
        portfolio_text: str = self.db.get_portfolio(user_id)
        print(f"📋 Portfólio carregado para {broker_name}: {len(portfolio_text)} caracteres")
        if len(portfolio_text) < 50:
            print(f"⚠️ ALERTA: Portfólio parece VAZIO ou muito curto!")
            print(f"📋 Conteúdo: {portfolio_text}")

        # 5. MONTA AS MENSAGENS PARA A OPENAI
        messages: List[Dict[str, str]] = [{"role": "system", "content": self.get_system_prompt(context, lead_real_name)}]
        messages.append({"role": "system", "content": f"PORTFÓLIO DISPONÍVEL:\n{portfolio_text}"})

        for h in history:
            messages.append({"role": str(h.get('role', 'user')), "content": str(h.get('content', ''))})

        messages.append({"role": "user", "content": message})

        # 6. GERA RESPOSTA
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=messages # pyre-ignore
            )
            reply_content: str = response.choices[0].message.content or "Desculpe, não consegui formular uma resposta."
        except Exception as e:
            print(f"❌ Erro na OpenAI: {e}")
            return "Desculpe, tive um problema técnico momentâneo."

        # 7. SALVA NO BANCO 
        if lead_id and user_id:
            self.db.save_message(lead_id, user_id, "user", message)
            self.db.save_message(lead_id, user_id, "assistant", reply_content)

        import re
        images_to_send = re.findall(r'\[SEND_IMAGE:\s*(.*?)\]', reply_content)
        clean_reply = re.sub(r'\[SEND_IMAGE:\s*.*?\]', '', reply_content).strip()

        # 8. VERIFICA SE PRECISA ALERTAR O CORRETOR (LEAD QUENTE)
        if "[ALERT_BROKER]" in clean_reply:
            print(f"🔥 LEAD QUENTE DETECTADO: {lead_real_name}")
            clean_reply = clean_reply.replace("[ALERT_BROKER]", "").strip()
            
            is_ooh = not self.is_within_schedule(schedule)
            if is_ooh:
                next_day, next_time = self.get_next_working_slot(schedule)
                pass_baton_msg = f"\n\n*Observação:* O nosso escritório no momento está fechado. O corretor {broker_name} estará em atendimento {next_day} a partir das {next_time} e entrará em contato com você assim que possível!"
                clean_reply += pass_baton_msg
            
            typing_delay = random.uniform(2.0, 4.0)
            await asyncio.sleep(typing_delay)
            
            if clean_reply:
                self.send_to_zapi(phone, clean_reply)
            for img_url in images_to_send:
                time.sleep(1)
                self.send_image_to_zapi(phone, img_url)
            
            if is_ooh:
                print(f"⏳ Alerta adiado para o próximo expediente de {broker_name}.")
                self.db.update_lead_status(phone, "ooh_hot_alert_pending")
            else:
                self.alert_broker(context, clean_reply)
                self.db.update_lead_status(phone, "hot_alert_sent")
                self.db.set_lead_transfer_time(phone)
            
            return clean_reply
        
        typing_delay = random.uniform(2.0, 4.0)
        await asyncio.sleep(typing_delay)
        
        if clean_reply:
            self.send_to_zapi(phone, clean_reply)
        for img_url in images_to_send:
            time.sleep(1)
            self.send_image_to_zapi(phone, img_url)
            
        return clean_reply

    def alert_broker(self, context: Dict[str, Any], message_context: str) -> None:
        broker_whatsapp: str = context.get('broker_whatsapp', '')
        lead_name: str = context.get('lead_name', 'Cliente')
        
        message_context_abridged = ""
        for i, char in enumerate(message_context):
            if i >= 100: break
            message_context_abridged += char
            
        alert_msg: str = f"🚨 *LEAD QUENTE: {lead_name}*\n\nEste lead demonstrou alto interesse ou pediu visita!\n\n*Resumo da conversa:* {message_context_abridged}...\n\nAssuma o atendimento agora!"
        self.send_to_zapi(broker_whatsapp, alert_msg)

    def send_to_zapi(self, phone: str, content: str) -> None:
        instance_id: Optional[str] = os.getenv("ZAPI_INSTANCE_ID") or os.getenv("ID_INSTÂNCIA_ZAPI") or os.getenv("ID_INSTANCIA_ZAPI")
        token: Optional[str] = os.getenv("ZAPI_TOKEN") or os.getenv("ZAPI_TÔKEN")
        client_token: str = os.getenv("ZAPI_CLIENT_TOKEN", "Fda343e96334040afb68f54effe118108S")
        
        if not instance_id or not token:
            print("⚠️ ERRO: ZAPI_INSTANCE_ID ou ZAPI_TOKEN ausentes no ambiente.")
            return

        url: str = f"https://api.z-api.io/instances/{instance_id}/token/{token}/send-text"
        
        payload: Dict[str, str] = {"phone": phone, "message": content}
        headers: Dict[str, str] = {"Content-Type": "application/json"}
        if client_token:
            headers["client-token"] = client_token
        
        try:
            response: requests.Response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            print(f"✅ Enviado para {phone}")
        except Exception as e:
            print(f"❌ Erro Z-API ({phone}): {e}")

    def send_image_to_zapi(self, phone: str, image_url: str) -> None:
        instance_id: Optional[str] = os.getenv("ZAPI_INSTANCE_ID") or os.getenv("ID_INSTÂNCIA_ZAPI") or os.getenv("ID_INSTANCIA_ZAPI")
        token: Optional[str] = os.getenv("ZAPI_TOKEN") or os.getenv("ZAPI_TÔKEN")
        client_token: str = os.getenv("ZAPI_CLIENT_TOKEN", "Fda343e96334040afb68f54effe118108S")
        
        if not instance_id or not token:
            print("⚠️ ERRO: ZAPI_INSTANCE_ID ou ZAPI_TOKEN ausentes no ambiente.")
            return

        url: str = f"https://api.z-api.io/instances/{instance_id}/token/{token}/send-image"
        
        payload: Dict[str, str] = {"phone": phone, "image": image_url}
        headers: Dict[str, str] = {"Content-Type": "application/json"}
        if client_token:
            headers["client-token"] = client_token
        
        try:
            response: requests.Response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            print(f"✅ Imagem enviada para {phone}")
        except Exception as e:
            print(f"❌ Erro Z-API ao enviar imagem ({phone}): {e}")
