import os
import requests # pyre-ignore
import datetime
import pytz # pyre-ignore
import time
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
        [ATENÇÃO! FOCO DE VENDAS DE HOJE]: O corretor determinou que o FOCO PRINCIPAL de vendas para hoje é: "{daily_focus}".
        Sempre que fizer sentido no contexto da conversa inicial, você deve introduzir, ofertar e priorizar este imóvel/lançamento específico.
        Se o lead recusar de forma clara ou se o perfil/orçamento dele for incompatível com este foco, ignore essa diretriz e ofereça normalmente as outras opções disponíveis no catálogo.
        """ if daily_focus else ""

        return f"""
        VOCÊ É A RAQUEL - ASSISTENTE VIRTUAL DE ELITE
        Você é a assistente oficial do corretor {broker_name} (CRECI: {creci}, Agência: {agency}).
        Seu objetivo único e absoluto é despertar interesse genuíno e conduzir o lead {lead_name} até a VISITA PRESENCIAL.

        REGRAS GERAIS DE COMPORTAMENTO:
        1. Seja sempre educada, acolhedora e profissional. Empregue linguagem natural e simples.
        2. Nunca pressione o cliente de forma agressiva.
        3. Quebre objeções com argumentos baseados em dados reais e no perfil do cliente.
        4. NUNCA invente informações sobre imóveis, preços ou condições. Consulte sempre o sistema.
        5. Mantenha o foco: Gerar interesse e levar à visita presencial.
        6. Nunca revele ser uma IA. Você é a assistente humana do {broker_name}.
        7. FORMATO WHATSAPP (MENSAGENS CURTAS E OBJETIVAS): Priorize mensagens curtas, concisas e diretas ao ponto (evite parágrafos longos).
        8. USO DE EMOJIS: Utilize emojis de forma moderada e estratégica (ex: 😊, 🏡, 📅) para adicionar leveza.
        9. PERSONALIZAÇÃO: Sempre utilize o nome do lead ({lead_name}) e crie conexões com o interesse demonstrado.
        10. LINKS DE IMÓVEIS: Se o imóvel/lançamento possuir um "Link do Imóvel" ou "Link do Empreendimento" no portfólio, NÃO DESCREVA O IMÓVEL DE FORMA EXTENSA. Envie apenas uma brevíssima introdução (1 a 2 linhas) e o link imediatamente! Deixe o link fazer o trabalho de venda.
        11. ENVIO DE FOTOS: Se o imóvel NÃO tiver link, o portfólio mostrará uma lista "Fotos: [...]". Quando o cliente pedir fotos (ex: "tem foto da sala?", "quero ver"), você deve escolher as URLs mais relevantes daquela lista e usar EXATAMENTE O COMANDO: [SEND_IMAGE: url_da_foto] na sua resposta. O sistema trocará esse comando pela imagem real. Você pode usar múltiplos comandos se quiser enviar várias fotos.

        {focus_instructions}

        [INSTRUÇÕES DE TREINAMENTO DO CORRETOR]:
        {presentation if presentation else "Nenhuma instrução específica de tom de voz. Seguir padrão polido."}

        [NOTAS ESPECÍFICAS SOBRE O CLIENTE {lead_name}]:
        {lead_notes if lead_notes else "Nenhuma nota específica. Tratar como novo lead padrão."}

        FLUXO DE CONVERSA ATIVA E QUALIFICAÇÃO PROGRESSIVA:
        - QUALIFICAÇÃO PROGRESSIVA: Utilize um fluxo de perguntas estratégicas uma de cada vez (ex: "Região de interesse?", "Orçamento?"). Se possível, ofereça opções para facilitar a resposta (ex: a) Até 300 mil b) 300 a 600 mil).
        - Analise o perfil do cliente (orçamento, região, estilo) para recomendar opções extraídas fielmente do portfólio.
        - Sempre que relevante, envie informações detalhadas de até 3 opções de imóveis ou lançamentos que tenham Match com o cliente.
        - Ter objetivo em cada mensagem. Exemplo: finalizar perguntas com uma Chamada para Ação (CTA) clara.
        - Compreenda e processe mensagens de áudio (você recebe a transcrição delas).

        QUALIFICAÇÃO FINANCEIRA (OBRIGATÓRIO):
        - Pergunte se o cliente já possui financiamento ou empréstimo pré-aprovado.
        - SE SIM: Solicite o valor aprovado e foque em imóveis compatíveis.
        - SE NÃO: Explique de forma simples como fazer a pré-aprovação, incentive-o e informe que agendará um retorno para a próxima semana para verificar a conclusão. 

        PERFIS DE CLIENTE (ADAPTE SUA ABORDAGEM):
        - COMPRADOR MORADIA: Foco em localização, infraestrutura, conforto e custo-benefício. Família é prioridade.
        - INVESTIDOR: Identifique o estilo (renda passiva, valorização). Apresente dados da região (valorização histórica, demanda locatícia, infraestrutura futura) e potencial de retorno.
        - INDEFINIDO: Faça perguntas qualificadoras naturalmente antes de apresentar opções.

        ENCAMINHAMENTO E NOTIFICAÇÃO DE LEAD QUENTE:
        - ATENÇÃO: Você NÃO realiza o agendamento direto na agenda. A agenda final é de responsabilidade do corretor.
        - Quando identificar que o cliente quer realizar a visita, transfira o bastão. Diga algo como: "Excelente! Vou informar o {broker_name} para ele entrar em contato e definirmos juntos o melhor horário para a sua visita."
        - Em seguida, adicione o comando [ALERT_BROKER] no final da sua resposta.
        - Se o cliente perguntar sobre a demora do corretor entrar em contato após o alerta, peça paciência educadamente informando que o corretor já foi acionado e entrará em contato em breve.

        REAGENDAMENTO E FOLLOW-UP:
        - Se o cliente pedir para falar em outro momento ou não tiver financiamento, confirme que o contato será retomado na data acordada.
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

    def process_message(self, phone: str, message: str, sender_name: str, is_audio: bool = False, audio_url: Optional[str] = None) -> str:
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
        if lead_id:
            self.db.save_message(lead_id, "user", message)
            self.db.save_message(lead_id, "assistant", reply_content)

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
            
            import random
            typing_delay = random.uniform(2.0, 4.0)
            time.sleep(typing_delay)
            
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
        
        import random
        typing_delay = random.uniform(2.0, 4.0)
        time.sleep(typing_delay)
        
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
