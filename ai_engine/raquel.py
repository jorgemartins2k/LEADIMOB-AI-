import os
import requests
import datetime
import pytz
import time
from typing import List, Dict, Any, Optional, Union
from openai import OpenAI
from dotenv import load_dotenv
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

        return f"""
        VOCÊ É A RAQUEL - ASSISTENTE VIRTUAL DE ELITE
        Você é a assistente oficial do corretor {broker_name} (CRECI: {creci}, Agência: {agency}).
        Seu objetivo único e absoluto é despertar interesse genuíno e conduzir o lead {lead_name} até a VISITA PRESENCIAL.

        REGRAS GERAIS DE COMPORTAMENTO:
        1. Seja sempre educada, empática e profissional.
        2. Nunca pressione o cliente de forma agressiva.
        3. Quebre objeções com argumentos baseados em dados reais e no perfil do cliente.
        4. NUNCA invente informações sobre imóveis, preços ou condições. Consulte sempre o sistema.
        5. Mantenha o foco: Gerar interesse e agendar visita.
        6. Respeite o ritmo e o momento do cliente.
        7. Nunca revele ser uma IA. Você é a assistente humana do {broker_name}.

        [INSTRUÇÕES DE TREINAMENTO DO CORRETOR]:
        {presentation if presentation else "Nenhuma instrução específica de tom de voz. Seguir padrão polido."}

        [NOTAS ESPECÍFICAS SOBRE O CLIENTE {lead_name}]:
        {lead_notes if lead_notes else "Nenhuma nota específica. Tratar como novo lead padrão."}

        FLUXO DE CONVERSA ATIVA:
        - Analise o perfil e as respostas do cliente para identificar necessidades.
        - Se o cliente desviar do assunto, redirecione gentilmente para o tema imobiliário.
        - Sempre que relevante, ofereça até 3 opções de imóveis, lançamentos ou eventos do portfólio.
        - Compreenda e processe mensagens de áudio (você recebe a transcrição delas).

        QUALIFICAÇÃO FINANCEIRA (OBRIGATÓRIO):
        - Pergunte se o cliente já possui financiamento ou empréstimo pré-aprovado.
        - SE SIM: Solicite o valor aprovado e foque em imóveis compatíveis.
        - SE NÃO: Explique de forma simples como fazer a pré-aprovação, incentive-o e informe que agendará um retorno para a próxima semana para verificar a conclusão. 

        PERFIS DE CLIENTE (ADAPTE SUA ABORDAGEM):
        - COMPRADOR MORADIA: Foco em localização, infraestrutura, conforto e custo-benefício. Família é prioridade.
        - INVESTIDOR: Identifique o estilo (renda passiva, valorização). Apresente dados da região (valorização histórica, demanda locatícia, infraestrutura futura) e potencial de retorno.
        - INDEFINIDO: Faça perguntas qualificadoras naturalmente antes de apresentar opções.

        NOTIFICAÇÃO DE LEAD QUENTE:
        - Quando detectar alto potencial ou pedido de visita, use o comando interno [ALERT_BROKER] no final da sua resposta.
        - Se o cliente perguntar sobre a demora do corretor entrar em contato após o alerta, peça paciência educadamente informando que o corretor já foi acionado e entrará em contato em breve.

        REAGENDAMENTO E FOLLOW-UP:
        - Se o cliente pedir para falar em outro momento ou não tiver financiamento, confirme que o contato será retomado na data acordada.
        """

    def is_within_schedule(self, schedule: List[Dict[str, Any]]) -> bool:
        """
        Verifica se o fuso de Brasília (now) está dentro do expediente do corretor
        """
        now: datetime.datetime = datetime.datetime.now(self.tz)
        
        # Mon=0 -> Mon=1, ..., Sun=6 -> Sun=0 
        db_day_of_week: int = (now.weekday() + 1) % 7
        
        # Busca a configuração para o dia de hoje
        today_config: Optional[Dict[str, Any]] = next((s for s in schedule if s.get('day_of_week') == db_day_of_week), None)
        
        if not today_config or not today_config.get('is_active'):
            return False
            
        try:
            def parse_time(t_str: Optional[str]) -> Optional[datetime.time]:
                if not t_str: return None
                # Aceita HH:MM ou HH:MM:SS
                return datetime.datetime.strptime(t_str[:5], "%H:%M").time()

            start_str: Optional[str] = str(today_config.get('start_time', '')) if today_config.get('start_time') else None
            end_str: Optional[str] = str(today_config.get('end_time', '')) if today_config.get('end_time') else None
            
            start_time: Optional[datetime.time] = parse_time(start_str)
            end_time: Optional[datetime.time] = parse_time(end_str)
            current_time: datetime.time = now.time()
            
            if not start_time or not end_time: return False
            return start_time <= current_time <= end_time
        except Exception as e:
            print(f"⚠️ Erro ao validar horário: {e}")
            return False

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

    def process_message(self, phone: str, message: str, sender_name: str, is_audio: bool = False, audio_url: Optional[str] = None) -> str:
        print(f"📥 Processando mensagem de {sender_name} ({phone})")
        
        # 1. Busca dados do corretor
        context: Optional[Dict[str, Any]] = self.db.get_broker_by_lead_phone(phone)
        if not context:
            print(f"⚠️ Lead {phone} não encontrado no banco.")
            return "Lead não encontrado no banco."

        user_id: str = context.get('user_id', '')
        lead_real_name: str = context.get('lead_name', 'Cliente')
        broker_name: str = context.get('broker_name', 'Corretor')

        # 2. SE FOR ÁUDIO, TRANSCREVE
        if is_audio and audio_url:
            message = self.transcribe_audio(audio_url)
            print(f"📝 Transcrição: {message}")

        # 3. VERIFICAÇÃO DE EXPEDIENTE (REAGENDAMENTO OOH)
        schedule: List[Dict[str, Any]] = self.db.get_broker_schedule(user_id)
        if not self.is_within_schedule(schedule):
            print(f"🌙 Fora de horário para {broker_name}. Enviando auto-reagendamento.")
            ooh_msg: str = f"Olá {lead_real_name}! Obrigado pelo contato. Recebemos sua mensagem, porém nosso expediente por hoje encerrou. Já reagendamos o seu atendimento para o próximo dia útil, quando o corretor {broker_name} entrar em contato. Até logo!"
            self.send_to_zapi(phone, ooh_msg)
            return ooh_msg

        # 4. BUSCA HISTÓRICO E PORTFÓLIO
        history: List[Dict[str, Any]] = self.db.get_chat_history(phone)
        portfolio_text: str = self.db.get_portfolio(user_id)

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

        # 7. SALVA NO BANCO E ENVIA
        self.db.save_message(phone, "user", message)
        self.db.save_message(phone, "assistant", reply_content)

        # 8. VERIFICA SE PRECISA ALERTAR O CORRETOR (LEAD QUENTE)
        if "[ALERT_BROKER]" in reply_content:
            print(f"🔥 LEAD QUENTE DETECTADO: {lead_real_name}")
            clean_reply: str = reply_content.replace("[ALERT_BROKER]", "").strip()
            self.send_to_zapi(phone, clean_reply)
            
            self.alert_broker(context, clean_reply)
            self.db.update_lead_status(phone, "hot_alert_sent")
            self.db.set_lead_transfer_time(phone)
            
            return clean_reply
        
        self.send_to_zapi(phone, reply_content)
        return reply_content

    def alert_broker(self, context: Dict[str, Any], message_context: str) -> None:
        broker_whatsapp: str = context.get('broker_whatsapp', '')
        lead_name: str = context.get('lead_name', 'Cliente')
        
        alert_msg: str = f"🚨 *LEAD QUENTE: {lead_name}*\n\nEste lead demonstrou alto interesse ou pediu visita!\n\n*Resumo da conversa:* {message_context[:100]}...\n\nAssuma o atendimento agora!"
        self.send_to_zapi(broker_whatsapp, alert_msg)

    def send_to_zapi(self, phone: str, content: str) -> None:
        instance_id: Optional[str] = os.getenv("ZAPI_INSTANCE_ID")
        token: Optional[str] = os.getenv("ZAPI_TOKEN")
        
        if not instance_id or not token:
            print("⚠️ ERRO: ZAPI_INSTANCE_ID ou ZAPI_TOKEN ausentes no ambiente.")
            return

        url: str = f"https://api.z-api.io/instances/{instance_id}/token/{token}/send-text"
        
        payload: Dict[str, str] = {"phone": phone, "message": content}
        headers: Dict[str, str] = {"Content-Type": "application/json"}
        
        try:
            response: requests.Response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            print(f"✅ Enviado para {phone}")
        except Exception as e:
            print(f"❌ Erro Z-API ({phone}): {e}")
