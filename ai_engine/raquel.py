import os
import requests # pyre-ignore
import datetime
import pytz # pyre-ignore
import time
import random
import asyncio
import json
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

        ranking_examples = self.db.get_top_ranking_cases(context.get('user_id', ''), limit=3)
        recent_lessons = self.db.get_recent_lessons(context.get('user_id', ''), limit=5)
        
        return f"""
        VOCÊ É A RAQUEL — CONSULTORA IMOBILIÁRIA ESPECIALISTA
        Você é a assistente estratégica e consultiva do corretor de imóveis {broker_name} (CRECI: {creci}, Agência: {agency}).
        Seu objetivo primordial é QUALIFICAR o cliente {lead_name} de forma profunda e consultiva.

        ===== LIÇÕES APRENDIDAS (NÃO REPITA ESTES ERROS) =====
        {recent_lessons}

        ===== EXEMPLOS DE ATENDIMENTO NOTA 10 (MODELOS) =====
        Use estes exemplos reais do seu histórico para manter o padrão de excelência:
        {ranking_examples}

        ===== DIRETRIZES DE OURO (NÃO NEGOCIÁVEIS) =====
        1. **SEM EMOJIS**: É terminantemente PROIBIDO o uso de emojis.
        2. **ESTILO HÍBRIDO DE COMUNICAÇÃO**: 
           - **Brevidade em Geral**: Para perguntas técnicas e rotineiras, mantenha 2-3 frases curtas.
           - **Empatia em Temas Sensíveis**: Quando o cliente tocar em pontos emocionais (família, filhos, segurança, sonhos), você DEVE ser mais detalhista. Reafirme o que ele disse para mostrar que entendeu (ex: "Entendo, João. Com dois filhos pequenos, a segurança e o lazer no condomínio realmente se tornam a prioridade número um..."). Use mensagens um pouco mais longas e acolhedoras nestes momentos para gerar conexão.
        3. **ASSERTIVIDADE NA TRANSFERÊNCIA**: Não peça permissão. Quando chegar o momento, afirme: "Agora vou transferir sua consulta para o {broker_name}...".
        4. **REGRA DOS LANÇAMENTOS (MARGEM DE 1 ANO)**: Você SÓ deve sugerir um Lançamento se o prazo de mudança bater com a entrega (margem de 1 ano).
        5. **FORMATO DE ENVIO DE LANÇAMENTO**: Envie APENAS Nome + Link. Nada de fotos.
        6. **NÃO PROMETA "ENVIAR OPÇÕES" DEPOIS**: O {broker_name} fará o envio personalizado após a transferência.
        7. **NÃO É ROBÔ**: Nunca use a palavra "virtual", "sistema" ou "IA". Você é a assistente real dele.

        {focus_instructions}

        [INSTRUÇÕES DO CORRETOR]:
        {presentation if presentation else "Tom polido e focado em alta qualidade de atendimento."}

        ===== FLUXO DE QUALIFICAÇÃO (ORDEM OBRIGATÓRIA) =====
        Siga rigorosamente esta ordem:
        ETAPA 1 — DESCOBERTA E OBJETIVO: Moradia ou investimento? Casa ou Apartamento?
        ETAPA 2 — LOCALIZAÇÃO E PROXIMIDADE: Bairros de preferência ou local de trabalho/estudo.
        ETAPA 3 — COMPOSIÇÃO FAMILIAR: Mora sozinho ou com família? Filhos?
        ETAPA 4 — PREFERÊNCIAS TÉCNICAS: Quartos/Suítes e Vagas de Garagem (Crucial).
        ETAPA 5 — PRAZO E MOMENTO: Urgência/Data de mudança (Crucial para a Regra 4).
        ETAPA 6 — INVESTIMENTO E VALORES (A ÚLTIMA PERGUNTA): Somente no final pergunte a faixa de investimento.

        ===== GATILHOS DE TRANSFERÊNCIA =====
        Você deve passar a bola para o {broker_name} usando o comando [ALERT_BROKER] nas seguintes situações:
        1. **PEDIDO DE LIGAÇÃO**: Se o cliente pedir para falar por telefone, ligação ou áudio ao vivo, use [ALERT_BROKER] e informe que o {broker_name} entrará em contato por voz em breve.
        2. **QUALIFICAÇÃO CONCLUÍDA**: Após passar pelas 6 etapas do fluxo.
        
        Exemplo de transferência por ligação: "Com certeza, {lead_name}. Vou avisar o {broker_name} agora mesmo para que ele te ligue e vocês conversem com mais detalhes! [ALERT_BROKER]"
        
        Exemplo de transferência por qualificação: "Perfeito, {lead_name}. Com base no que conversamos, vou transferir seu atendimento agora para o {broker_name}. Ele é o especialista que vai te apresentar as melhores oportunidades que se encaixam exatamente no que você busca. [ALERT_BROKER]"
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

    async def transcribe_audio(self, audio_url: str) -> str:
        """
        Baixa o áudio da Z-API e transcreve usando OpenAI Whisper.
        Adicionado log exaustivo para depuração.
        """
        import tempfile
        import traceback
        suffix = ".ogg"
        if ".mp3" in audio_url.lower(): suffix = ".mp3"
        elif ".wav" in audio_url.lower(): suffix = ".wav"
        
        # Operações de arquivo e rede em executor para não travar o loop
        def do_transcribe():
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                temp_path = tmp.name
                
            try:
                print(f"🎙️ [DEBUG] Iniciando download de: {audio_url}")
                audio_response = requests.get(audio_url, timeout=30, verify=False)
                audio_response.raise_for_status()
                
                with open(temp_path, "wb") as f:
                    f.write(audio_response.content)
                
                file_size = os.path.getsize(temp_path)
                if file_size < 100: return "[O áudio parece estar vazio]"

                with open(temp_path, "rb") as audio_file:
                    transcript = self.client.audio.transcriptions.create(
                        model="whisper-1", 
                        file=audio_file
                    )
                return str(transcript.text).strip()
            except Exception as e:
                print(f"❌ [DEBUG] ERRO NA TRANSCRIÇÃO: {e}")
                return "[Erro ao transcrever áudio]"
            finally:
                if os.path.exists(temp_path):
                    try: os.remove(temp_path)
                    except: pass

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, do_transcribe)

    async def process_message(self, phone: str, message: str, sender_name: str, is_audio: bool = False, audio_urls: List[str] = []) -> str:
        print(f"📥 Processando mensagem de {sender_name} ({phone}). Áudios: {len(audio_urls)}")
        
        # 1. Busca dados do corretor
        context: Optional[Dict[str, Any]] = self.db.get_broker_by_lead_phone(phone)
        if not context:
            print(f"⚠️ Lead {phone} não encontrado no banco.")
            return "Lead não encontrado no banco."

        user_id: str = context.get('user_id', '')
        lead_id: str = context.get('lead_id', '')
        lead_real_name: str = context.get('lead_name', 'Cliente')
        broker_name: str = context.get('broker_name', 'Corretor')

        # 2. SE HOUVER ÁUDIOS, TRANSCREVE TODOS E ACUMULA
        if is_audio and audio_urls:
            transcriptions = []
            for url in audio_urls:
                t = await self.transcribe_audio(url)
                if t and t != "[Erro ao transcrever áudio]":
                    transcriptions.append(t)
            
            if transcriptions:
                audio_text = "\n".join(transcriptions)
                message = (message + "\n" + audio_text).strip() if message else audio_text
            else:
                print("⚠️ Falha em todas as transcrições ou áudios vazios.")
                if not message:
                    return "Desculpe, não consegui entender o áudio. Pode escrever por favor?"

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

        # 6. GERA RESPOSTA (SEM BLOQUEAR O LOOP)
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, 
                lambda: self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages # pyre-ignore
                )
            )
            reply_content: str = response.choices[0].message.content or "Desculpe, não consegui formular uma resposta."
        except Exception as e:
            print(f"❌ Erro na OpenAI: {e}")
            error_msg = "Desculpe, tive um problema técnico momentâneo."
            self.send_to_zapi(phone, error_msg)
            return error_msg

        # 7. SALVA NO BANCO 
        if lead_id and user_id:
            self.db.save_message(lead_id, user_id, "user", message)
            self.db.save_message(lead_id, user_id, "assistant", reply_content)

        import re
        images_to_send = re.findall(r'\[SEND_IMAGE:\s*(.*?)\]', reply_content)
        clean_reply = re.sub(r'\[SEND_IMAGE:\s*.*?\]', '', reply_content).strip()

        # 8. PROCESSA ALERTA DE LEAD QUENTE
        is_hot = "[ALERT_BROKER]" in clean_reply
        if is_hot:
            print(f"🔥 LEAD QUENTE DETECTADO: {lead_real_name}")
            clean_reply = clean_reply.replace("[ALERT_BROKER]", "").strip()
            
            is_ooh = not self.is_within_schedule(schedule)
            if is_ooh:
                next_day, next_time = self.get_next_working_slot(schedule)
                pass_baton_msg = f"\n\n*Observação:* O nosso escritório no momento está fechado. O corretor {broker_name} estará em atendimento {next_day} a partir das {next_time} e entrará em contato com você assim que possível!"
                clean_reply += pass_baton_msg
                self.db.update_lead_status(phone, "ooh_hot_alert_pending")
            else:
                # Disparamos o alerta em background para não travar a resposta ao cliente
                print(f"📡 Disparando alerta para o corretor em background...")
                loop = asyncio.get_event_loop()
                loop.run_in_executor(None, self.alert_broker, context, message)
                
                self.db.update_lead_status(phone, "hot_alert_sent")
                self.db.set_lead_transfer_time(phone)

        # 9. ENVIA RESPOSTA AO CLIENTE
        typing_delay = random.uniform(1.8, 3.2)
        await asyncio.sleep(typing_delay)
        
        if clean_reply:
            print(f"📤 Enviando resposta para {phone}: {clean_reply[:50]}...")
            loop = asyncio.get_event_loop()
            loop.run_in_executor(None, self.send_to_zapi, phone, clean_reply)
        
        # Envia imagens se houver
        for img_url in images_to_send:
            await asyncio.sleep(1)
            self.send_image_to_zapi(phone, img_url)

        # 10. MELHORIA CONTÍNUA (BACKGROUND)
        # Usamos create_task porque agora os métodos são async def
        asyncio.create_task(self.evaluate_and_rank_lead(phone, sender_name, context))
        asyncio.create_task(self.audit_and_log_mistakes(phone, sender_name, message, reply_content, context))

        return clean_reply

    async def evaluate_and_rank_lead(self, phone: str, name: str, context: Dict[str, Any]) -> None:
        """
        Gera um resumo da conversa e adiciona ao ranking de melhoria contínua.
        """
        try:
            lead_id = context.get('lead_id')
            user_id = context.get('user_id')
            if not lead_id or not user_id: return

            # Busca histórico mais completo para avaliação
            history = self.db.get_chat_history(lead_id, limit=20)
            chat_str = "\n".join([f"{h['role']}: {h['content']}" for h in history])

            eval_prompt = f"""
            Analise a conversa abaixo entre a Raquel (IA) e o cliente {name}.
            Gere um resumo técnico para servir de exemplo de "Melhores Práticas" para atendimentos futuros.
            
            CONVERSA:
            {chat_str}

            RESPONDA APENAS EM JSON:
            {{
                "summary": "Breve perfil do lead e o que ele busca (ex: Medico, busca casa em condominio para moradia)",
                "highlights": "Por que esse atendimento foi bom? (ex: Raquel identificou a necessidade de proximidade com o hospital e sugeriu o bairro X)"
            }}
            """

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "system", "content": "Você é um auditor de qualidade de atendimento imobiliário."}, 
                          {"role": "user", "content": eval_prompt}],
                response_format={ "type": "json_object" }
            )
            
            import json
            data = json.loads(response.choices[0].message.content)
            
            self.db.add_to_ranking(
                user_id=user_id,
                lead_id=lead_id,
                summary=data.get("summary", ""),
                highlights=data.get("highlights", "")
            )
            print(f"✅ Lead {name} adicionado ao ranking de melhoria contínua.")
        except Exception as e:
            print(f"Erro ao avaliar lead para ranking: {e}")

    async def audit_and_log_mistakes(self, phone: str, name: str, user_msg: str, ai_reply: str, context: Dict[str, Any]) -> None:
        """
        Analisa se houve confusão ou erro da IA e registra no banco.
        """
        try:
            lead_id = context.get('lead_id')
            user_id = context.get('user_id')
            if not lead_id or not user_id: return

            audit_prompt = f"""
            Analise o diálogo abaixo e identifique se a Raquel (IA) cometeu algum erro, alucinação ou se o cliente precisou corrigi-la.
            
            MENSAGEM DO CLIENTE: "{user_msg}"
            RESPOSTA DA RAQUEL: "{ai_reply}"

            Responda APENAS EM JSON:
            {{
                "has_error": true/false,
                "error_context": "O que a IA disse de errado?",
                "user_correction": "Como o usuário corrigiu?",
                "lesson_learned": "O que a IA NUNCA deve repetir baseado nisso? (Ex: Não assumir que o cliente mora em [Cidade] se ele não disse)"
            }}
            """

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "system", "content": "Você é um auditor crítico de conversas de IA."}, 
                          {"role": "user", "content": audit_prompt}],
                response_format={ "type": "json_object" }
            )
            
            data = json.loads(response.choices[0].message.content)
            
            if data.get("has_error"):
                self.db.add_mistake_log(
                    user_id=user_id,
                    lead_id=lead_id,
                    error_context=data.get("error_context", ""),
                    user_correction=data.get("user_correction", ""),
                    lesson=data.get("lesson_learned", "")
                )
                print(f"⚠️ Erro da IA registrado para melhoria: {data.get('lesson_learned')}")
        except Exception as e:
            print(f"Erro na auditoria da IA: {e}")

    def generate_lead_briefing(self, lead_id: str, context: Dict[str, Any]) -> str:
        """
        Gera um briefing consultivo sobre o lead usando IA.
        """
        try:
            name: str = context.get('lead_name', 'Cliente')
            # 1. Busca histórico recente
            history = self.db.get_chat_history(context.get('phone', ''), limit=15)
            chat_text = "\n".join([f"{m['role']}: {m['content']}" for m in history]) if history else "Sem histórico."

            prompt = f"""
            Gere um resumo executivo para o corretor sobre o lead {name}.
            Baseie-se nestas informações e no histórico abaixo:
            
            HISTÓRICO:
            {chat_text}
            
            INFO DISPONÍVEL:
            {json.dumps(context, indent=2)}

            RESPONDA APENAS O BRIEFING FORMATADO:
            👤 *Cliente*: {name}
            📞 *Contato*: {context.get('phone', 'N/A')}
            🎯 *Objetivo*: (Moradia/Investimento/etc)
            📍 *Interesse*: (Bairros e tipo de imóvel)
            👨‍👩‍👧 *Perfil*: (Composição familiar se houver)
            💰 *Budget*: (Se mencionado)
            
            📝 *Resumo do Atendimento*: (2 frases sobre a última dor/desejo do cliente)
            """

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "system", "content": "Você é um assistente de vendas especialista."}, 
                          {"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content or f"Lead {name} qualificado."
        except Exception as e:
            print(f"Erro ao gerar briefing: {e}")
            return f"Lead {context.get('lead_name', 'Cliente')} qualificado e aguardando."

    def alert_broker(self, context: Dict[str, Any], message_context: str) -> None:
        broker_whatsapp: str = context.get('broker_whatsapp', '')
        lead_name: str = context.get('lead_name', 'Cliente')
        lead_id: str = context.get('lead_id', '')
        user_id: str = context.get('user_id', '')

        if not broker_whatsapp:
            print(f"⚠️ Alerta ignorado: Corretor sem WhatsApp cadastrado.")
            return

        print(f"🚀 Gerando briefing e disparando ALERTA QUENTE para o corretor ({broker_whatsapp})...")
        
        # 1. Gera o briefing inteligente
        briefing = self.generate_lead_briefing(lead_id, context)
        
        # 2. Salva na tabela de notificações do painel
        self.db.add_broker_notification(user_id, lead_id, briefing)

        # 3. Envia para o WhatsApp do corretor
        final_alert = f"🔥 *LEAD QUENTE QUALIFICADO!* 🔥\n\n{briefing}\n\nEnviando para você agora mesmo. Por favor, responda com *ok* para confirmar que recebeu."
        self.send_to_zapi(broker_whatsapp, final_alert)

    def send_to_zapi(self, phone: str, content: str) -> None:
        instance_id: Optional[str] = os.getenv("ZAPI_INSTANCE_ID") or os.getenv("ID_INSTÂNCIA_ZAPI") or os.getenv("ID_INSTANCIA_ZAPI")
        token: Optional[str] = os.getenv("ZAPI_TOKEN") or os.getenv("ZAPI_TÔKEN")
        if not instance_id or not token:
            print("⚠️ ERRO: ZAPI_INSTANCE_ID ou ZAPI_TOKEN ausentes no ambiente.")
            return

        client_token: str = os.getenv("ZAPI_CLIENT_TOKEN", "Fda343e96334040afb68f54effe118108S")
        
        url: str = f"https://api.z-api.io/instances/{instance_id}/token/{token}/send-text"
        
        payload: Dict[str, str] = {"phone": phone, "message": content}
        headers: Dict[str, str] = {
            "Content-Type": "application/json",
            "Client-Token": client_token
        }
        
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
        headers: Dict[str, str] = {
            "Content-Type": "application/json",
            "Client-Token": client_token
        }
        
        try:
            response: requests.Response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            print(f"✅ Imagem enviada para {phone}")
        except Exception as e:
            print(f"❌ Erro Z-API ao enviar imagem ({phone}): {e}")
