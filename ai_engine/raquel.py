import os
import requests
import datetime
import pytz
import time
from openai import OpenAI
from dotenv import load_dotenv
from database import Database

load_dotenv()

class RaquelAgent:
    def __init__(self):
        # Validação robusta de chaves
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            print("❌ ERRO CRÍTICO: Variável 'OPENAI_API_KEY' não encontrada no ambiente!")
            print("Vá no painel do Railway > Seu Serviço > Variables e adicione a chave.")
            raise RuntimeError("OPENAI_API_KEY ausente.")

        self.client = OpenAI(api_key=api_key)
        self.db = Database()

    def get_system_prompt(self, context, lead_name):
        broker_name = context.get('broker_name', 'Corretor')
        creci = context.get('broker_creci', 'Não informado')
        agency = context.get('broker_agency', 'Autônomo')
        presentation = context.get('broker_presentation', '')
        lead_notes = context.get('lead_notes', '')

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

    def is_within_schedule(self, schedule):
        """
        Verifica se o fuso de Brasília (now) está dentro do expediente do corretor
        """
        import pytz
        import datetime
        tz = pytz.timezone('America/Sao_Paulo')
        now = datetime.datetime.now(tz)
        
        # Mon=0 -> Mon=1, ..., Sun=6 -> Sun=0 
        db_day_of_week = (now.weekday() + 1) % 7
        
        # Busca a configuração para o dia de hoje
        today_config = next((s for s in schedule if s['day_of_week'] == db_day_of_week), None)
        
        if not today_config or not today_config['is_active']:
            return False
            
        try:
            def parse_time(t_str):
                if not t_str: return None
                return datetime.datetime.strptime(t_str[:5], "%H:%M").time()

            start_time = parse_time(today_config['start_time'])
            end_time = parse_time(today_config['end_time'])
            current_time = now.time()
            
            if not start_time or not end_time: return False
            return start_time <= current_time <= end_time
        except Exception as e:
            print(f"Erro ao validar horário: {e}")
            return False

    def transcribe_audio(self, audio_url):
        """
        Baixa o áudio da Z-API e transcreve usando OpenAI Whisper
        """
        try:
            print(f"Baixando áudio para transcrição: {audio_url}")
            audio_response = requests.get(audio_url)
            audio_response.raise_for_status()
            
            # Salva temporariamente
            with open("/tmp/temp_audio.ogg", "wb") as f:
                f.write(audio_response.content)
            
            with open("/tmp/temp_audio.ogg", "rb") as audio_file:
                transcript = self.client.audio.transcriptions.create(
                    model="whisper-1", 
                    file=audio_file
                )
            return transcript.text
        except Exception as e:
            print(f"Erro na transcrição: {e}")
            return "[Erro ao transcrever áudio]"

    def process_message(self, phone, message, sender_name, is_audio=False, audio_url=None):
        # 1. Busca dados do corretor
        context = self.db.get_broker_by_lead_phone(phone)
        if not context:
            return "Lead não encontrado no banco."

        user_id = context['user_id']
        lead_real_name = context['lead_name']
        broker_name = context['broker_name']

        # 2. SE FOR ÁUDIO, TRANSCREVE
        if is_audio and audio_url:
            message = self.transcribe_audio(audio_url)
            print(f"Transcrição do áudio: {message}")

        # 3. VERIFICAÇÃO DE EXPEDIENTE (REAGENDAMENTO OOH)
        schedule = self.db.get_broker_schedule(user_id)
        if not self.is_within_schedule(schedule):
            # Mensagem automática de reagendamento conforme o manual
            ooh_msg = f"Olá {lead_real_name}! Obrigado pelo contato. Recebemos sua mensagem, porém nosso expediente por hoje encerrou. Já reagendamos o seu atendimento para o próximo dia útil, quando o corretor {broker_name} entrar em contato. Até logo!"
            self.send_to_zapi(phone, ooh_msg)
            # Atualiza status para reagendado (opcional conforme manual para controle de limites)
            # self.db.update_lead_status(phone, "ooh_rescheduled") 
            return ooh_msg

        # 4. BUSCA HISTÓRICO E PORTFÓLIO
        history = self.db.get_chat_history(phone)
        portfolio_text = self.db.get_portfolio(user_id)

        # 5. MONTA AS MENSAGENS PARA A OPENAI
        messages = [{"role": "system", "content": self.get_system_prompt(context, lead_real_name)}]
        
        # Adiciona portfólio como contexto
        messages.append({"role": "system", "content": f"PORTFÓLIO DISPONÍVEL (Use as descrições e público-alvo para vender melhor):\n{portfolio_text}"})

        # Adiciona histórico
        for h in history:
            messages.append({"role": h['role'], "content": h['content']})

        # Adiciona nova mensagem
        messages.append({"role": "user", "content": message})

        # 6. GERA RESPOSTA
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=messages
        )
        
        reply_content = response.choices[0].message.content

        # 7. SALVA NO BANCO E ENVIA
        self.db.save_message(phone, "user", message)
        self.db.save_message(phone, "assistant", reply_content)

        # 8. VERIFICA SE PRECISA ALERTAR O CORRETOR (LEAD QUENTE)
        if "[ALERT_BROKER]" in reply_content:
            clean_reply = reply_content.replace("[ALERT_BROKER]", "").strip()
            self.send_to_zapi(phone, clean_reply)
            
            # Alerta o corretor e marca no banco para o monitor (puxão de orelha)
            self.alert_broker(context, clean_reply)
            self.db.update_lead_status(phone, "hot_alert_sent")
            self.db.set_lead_transfer_time(phone)
            
            return clean_reply
        
        self.send_to_zapi(phone, reply_content)
        return reply_content

    def alert_broker(self, context, message_context):
        """
        Envia um alerta para o WhatsApp do Corretor
        """
        broker_whatsapp = context['broker_whatsapp']
        lead_name = context['lead_name']
        
        alert_msg = f"🚨 *LEAD QUENTE: {lead_name}*\n\nEste lead demonstrou alto interesse ou pediu visita!\n\n*Resumo da conversa:* {message_context[:100]}...\n\nAssuma o atendimento agora!"
        self.send_to_zapi(broker_whatsapp, alert_msg)

    def send_to_zapi(self, phone, content):
        """
        Envia a mensagem via Z-API usando as chaves do .env.local
        """
        instance_id = os.getenv("ZAPI_INSTANCE_ID")
        token = os.getenv("ZAPI_TOKEN")
        url = f"https://api.z-api.io/instances/{instance_id}/token/{token}/send-text"
        
        payload = {
            "phone": phone,
            "message": content
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            print(f"Mensagem enviada para {phone} via Z-API.")
        except Exception as e:
            print(f"Erro ao enviar para Z-API de {phone}: {e}")
