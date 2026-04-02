"""
raquel.py — Agente de IA Raquel
Correções aplicadas:
1. BUG CRÍTICO: send_to_zapi agora é awaited corretamente (mensagens não eram perdidas silenciosamente)
2. BUG CRÍTICO: lógica OOH corrigida (is_ooh era sempre True por usar chave 'schedule' inexistente no contexto)
3. asyncio.get_event_loop() substituído por asyncio.get_running_loop() (API moderna e segura)
4. is_within_schedule movido para utils.py (sem duplicação)
5. temperature=0.7 adicionado às chamadas OpenAI para respostas mais consistentes
6. Tratamento de erros mais robusto em todas as chamadas externas
"""
import os
import requests
import datetime
import pytz
import time
import random
import asyncio
import json
import re
from typing import List, Dict, Any, Optional
from openai import OpenAI
from dotenv import load_dotenv
from database import Database
from utils import is_within_schedule

load_dotenv()


class RaquelAgent:
    client: OpenAI
    db: Database
    tz: datetime.tzinfo

    def __init__(self) -> None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY não encontrada no ambiente.")

        self.client = OpenAI(api_key=api_key)
        self.db = Database()
        self.tz = pytz.timezone('America/Sao_Paulo')

    # ------------------------------------------------------------------
    # PROMPT DO SISTEMA
    # ------------------------------------------------------------------
    def get_system_prompt(self, context: Dict[str, Any]) -> str:
        broker_name: str = context.get('broker_name', 'Corretor')
        broker_agency: str = context.get('broker_agency', 'Imobiliária')
        broker_city: str = context.get('broker_city', 'sua região')
        broker_metro: str = context.get('broker_metropolitan_regions', '')
        lead_name: str = context.get('lead_name', 'Cliente')
        presentation: str = context.get('broker_presentation', '')
        daily_focus: Optional[str] = context.get('daily_focus')

        focus_instructions = f"===== FOCO DO DIA: {daily_focus} =====" if daily_focus else ""

        ranking_examples = self.db.get_top_ranking_cases(context.get('user_id', ''), limit=3)
        recent_lessons = self.db.get_recent_lessons(context.get('user_id', ''), limit=5)

        area_atuacao = broker_city
        intro_area = f"da cidade de {broker_city}"
        if broker_metro:
            area_atuacao += " e região"
            intro_area += " e região"

        now_str = datetime.datetime.now(self.tz).strftime('%d/%m/%Y %H:%M')

        return f"""
        Você é a Raquel, assistente pessoal de alto nível do corretor imobiliário {broker_name}, da empresa {broker_agency}, com foco em {area_atuacao}.
        Sua missão é realizar uma qualificação profunda, consultiva e empática.

        ===== LIÇÕES APRENDIDAS (NÃO REPITA ESTES ERROS) =====
        {recent_lessons}

        ===== EXEMPLOS DE ATENDIMENTO NOTA 10 (MODELOS) =====
        {ranking_examples}

        ===== IDENTIDADE E ABORDAGEM (CRUCIAL) =====
        1. **APRESENTAÇÃO INICIAL**: Na primeira interação, apresente-se exatamente como: "assistente do corretor imobiliário {broker_name} da empresa {broker_agency}, {intro_area}." Nunca use "consultora".
        2. **CONTEXTO GEOGRÁFICO E AMBIGUIDADE**: Você atua em {area_atuacao}.
           - **REGRA DE OURO**: Se o cliente citar um bairro que possa existir em mais de uma cidade da sua região, você DEVE perguntar de qual cidade ele está falando.
           - Nunca assuma a cidade se houver dúvida.

        ===== DIRETRIZES DE OURO (NÃO NEGOCIÁVEIS) =====
        1. **SEM EMOJIS**: É terminantemente PROIBIDO o uso de emojis em qualquer circunstância.
        2. **ESTILO DE COMUNICAÇÃO**: Respostas curtas e conversacionais (1 a 3 frases). Seja ágil, empático e elegante.
        3. **ASSERTIVIDADE NA TRANSFERÊNCIA**: Não peça permissão. Afirme: "Agora vou transferir sua consulta para o {broker_name}...".
        4. **REGRA DOS LANÇAMENTOS VS PRAZO**:
           - Prazo de mudança menor que 6 meses → NUNCA fale de Lançamentos. Foque em imóveis Prontos.
           - Prazo maior que 12 meses → pode incluir Lançamentos.
        5. **FORMATO DE ENVIO DE LANÇAMENTO**: Envie APENAS Nome + Link. Nada mais.
        6. **NÃO PROMETA "ENVIAR OPÇÕES" DEPOIS**: O {broker_name} fará isso após a transferência.
        7. **NÃO É ROBÔ**: Nunca use "virtual", "sistema" ou "IA". Você é a assistente real.
        8. **MEMÓRIA (CRUCIAL)**: PROIBIDO perguntar o que o cliente já respondeu. Revise o histórico antes de perguntar.
        9. **UMA PERGUNTA POR VEZ**: Responda, depois faça a próxima pergunta pendente.
        10. **AGRUPAMENTO**: Você já recebe as mensagens consolidadas. Gere sempre UMA resposta coesa.

        {focus_instructions}

        [INSTRUÇÕES ESPECÍFICAS DO CORRETOR]:
        {presentation if presentation else "Tom polido e focado em alta qualidade de atendimento."}

        ===== FLUXO DE QUALIFICAÇÃO (DINÂMICO E SEM REPETIÇÃO) =====
        Preencha nesta ordem. Se o cliente já informou algo, PULE para o próximo pendente.

        Antes de cada pergunta, inclua frase curta com contexto, validação ou domínio de mercado.

        1. OBJETIVO: Moradia ou investimento?
        2. TIPO: Casa ou apartamento?
        3. LOCALIZAÇÃO: Quais bairros ou regiões em {area_atuacao}?
        4. PERFIL: Quem vai morar?
        5. TÉCNICO: Quantidade de quartos e vagas de garagem.
        6. DIFERENCIAIS: Preferências por áreas de lazer ou características específicas (adapte ao tipo de imóvel, cite 1-2 exemplos no máximo).
        7. MOMENTO: Quando pretende se mudar?
        8. INVESTIMENTO: Faixa de valor (pergunte por último).
        9. FORMA DE PAGAMENTO: Financiamento, à vista ou avaliando opções?

        ===== REGRA DE OURO DA MEMÓRIA =====
        Antes de digitar, pergunte-se: "Eu já sei a resposta para o que vou perguntar?". Se sim, AVANCE.

        ===== AGENDAMENTO DE RETORNO =====
        Hoje é {now_str} (Fuso de Brasília).
        Se o cliente pedir para retornar depois:
        1. Se não der dia/hora exatos, pergunte gentilmente.
        2. Se já informou, inclua [SCHEDULE: YYYY-MM-DD HH:MM] no final da resposta.
        Exemplo: "Combinado, {lead_name}! Te chamo amanhã às 14h. [SCHEDULE: 2026-04-02 14:00]"

        Exemplo de transferência: "Perfeito, {lead_name}. Vou transferir seu atendimento agora para o {broker_name}. Ele é o especialista que vai te apresentar as melhores oportunidades em {area_atuacao}. [ALERT_BROKER]"

        ===== DESINTERESSE E OPT-OUT =====
        Se o cliente demonstrar desinteresse explícito ou pedir para parar:
        1. Responda de forma educada e finalizadora. Ex: "Perfeito, {lead_name}. Obrigado pelo retorno e fico à disposição para o futuro. Um abraço!"
        2. Adicione obrigatoriamente [OPT_OUT] no final.
        3. PROIBIDO: novas perguntas ou tentativas de convencer.
        """

    # ------------------------------------------------------------------
    # VERIFICAÇÃO DE EXPEDIENTE
    # ------------------------------------------------------------------
    def check_within_schedule(self, schedule: Any) -> bool:
        """Wrapper que usa a função centralizada de utils.py"""
        now = datetime.datetime.now(self.tz)
        schedule_list = schedule if isinstance(schedule, list) else []
        return is_within_schedule(schedule_list, now)

    def get_next_working_slot(self, schedule: Any) -> tuple:
        schedule_list = schedule if isinstance(schedule, list) else []
        now = datetime.datetime.now(self.tz)
        current_db_day = (now.weekday() + 1) % 7
        days_map = {
            0: "no domingo", 1: "na segunda-feira", 2: "na terça-feira",
            3: "na quarta-feira", 4: "na quinta-feira", 5: "na sexta-feira", 6: "no sábado"
        }

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

    # ------------------------------------------------------------------
    # TRANSCRIÇÃO DE ÁUDIO
    # ------------------------------------------------------------------
    async def transcribe_audio(self, audio_url: str) -> str:
        import tempfile

        suffix = ".ogg"
        if ".mp3" in audio_url.lower():
            suffix = ".mp3"
        elif ".wav" in audio_url.lower():
            suffix = ".wav"

        def do_transcribe() -> str:
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                temp_path = tmp.name

            try:
                print(f"🎙️ Iniciando download de áudio: {audio_url}")
                audio_response = requests.get(audio_url, timeout=30, verify=False)
                audio_response.raise_for_status()

                with open(temp_path, "wb") as f:
                    f.write(audio_response.content)

                if os.path.getsize(temp_path) < 100:
                    return "[O áudio parece estar vazio]"

                with open(temp_path, "rb") as audio_file:
                    transcript = self.client.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file
                    )
                return str(transcript.text).strip()
            except Exception as e:
                print(f"❌ Erro na transcrição do áudio: {e}")
                return "[Erro ao transcrever áudio]"
            finally:
                if os.path.exists(temp_path):
                    try:
                        os.remove(temp_path)
                    except Exception:
                        pass

        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, do_transcribe)

    # ------------------------------------------------------------------
    # PROCESSAMENTO PRINCIPAL DE MENSAGEM
    # ------------------------------------------------------------------
    async def process_message(
        self,
        phone: str,
        message: str,
        sender_name: str,
        is_audio: bool = False,
        audio_urls: List[str] = []
    ) -> str:
        print(f"📥 Processando mensagem de {sender_name} ({phone}). Áudios: {len(audio_urls)}")

        # 1. Busca contexto do corretor vinculado ao lead
        context: Optional[Dict[str, Any]] = self.db.get_broker_by_lead_phone(phone)
        if not context:
            print(f"⚠️ Lead {phone} não encontrado ou sem corretor no banco.")
            return ""

        user_id: str = context.get('user_id', '')
        lead_id: str = context.get('lead_id', '')
        lead_real_name: str = context.get('lead_name', 'Cliente')
        broker_name: str = context.get('broker_name', 'Corretor')

        # 2. Transcreve áudios se houver
        if is_audio and audio_urls:
            transcriptions = []
            for url in audio_urls:
                t = await self.transcribe_audio(url)
                if t and t not in ("[Erro ao transcrever áudio]", "[O áudio parece estar vazio]"):
                    transcriptions.append(t)

            if transcriptions:
                audio_text = "\n".join(transcriptions)
                message = (message + "\n" + audio_text).strip() if message else audio_text
            elif not message:
                return "Desculpe, não consegui entender o áudio. Pode escrever por favor?"

        # 3. Busca expediente, histórico e portfólio
        schedule = self.db.get_broker_schedule(user_id)
        history: List[Dict[str, Any]] = self.db.get_chat_history(lead_id)
        portfolio_text: str = self.db.get_portfolio(user_id)

        if len(portfolio_text) < 50:
            print(f"⚠️ ALERTA: Portfólio do corretor {broker_name} parece vazio!")

        # 4. Monta as mensagens para a OpenAI
        messages: List[Dict[str, Any]] = [
            {"role": "system", "content": self.get_system_prompt(context)},
            {"role": "system", "content": f"PORTFÓLIO DISPONÍVEL:\n{portfolio_text}"}
        ]
        for h in history:
            messages.append({"role": str(h.get('role', 'user')), "content": str(h.get('content', ''))})
        messages.append({"role": "user", "content": message})

        # 5. Gera resposta da IA
        try:
            loop = asyncio.get_running_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages,
                    temperature=0.7
                )
            )
            reply_content: str = response.choices[0].message.content or "Desculpe, não consegui formular uma resposta."
        except Exception as e:
            print(f"❌ Erro na OpenAI: {e}")
            error_msg = "Desculpe, tive um problema técnico momentâneo."
            await self._send_message(phone, error_msg)
            return error_msg

        # 6. Salva no banco
        if lead_id and user_id:
            self.db.save_message(lead_id, user_id, "user", message)
            self.db.save_message(lead_id, user_id, "assistant", reply_content)

        # 7. Processa tags na resposta da IA
        images_to_send = re.findall(r'\[SEND_IMAGE:\s*(.*?)\]', reply_content)
        schedule_match = re.search(r'\[SCHEDULE:\s*(.*?)\]', reply_content)
        opt_out_match = "[OPT_OUT]" in reply_content

        # Keyword fallback para opt-out (caso a IA não coloque a tag)
        opt_out_keywords = ["pode parar", "não quero", "não tenho interesse", "parar de mandar"]
        user_opt_out = any(k in message.lower() for k in opt_out_keywords)

        # Limpa tags do texto antes de enviar
        reply_content = re.sub(r'\[SEND_IMAGE:\s*.*?\]', '', reply_content).strip()
        reply_content = reply_content.replace("[OPT_OUT]", "").strip()

        is_scheduled = False
        if schedule_match and not (opt_out_match or user_opt_out):
            schedule_str = schedule_match.group(1).strip()
            reply_content = re.sub(r'\[SCHEDULE:\s*.*?\]', '', reply_content).strip()
            print(f"🗓️ Agendamento detectado: {schedule_str}")
            self.db.schedule_follow_up(phone, schedule_str)
            is_scheduled = True

        # 8. Processa OPT-OUT
        if opt_out_match or user_opt_out:
            print(f"🚫 OPT-OUT: {lead_real_name}")
            self.db.update_lead_status(phone, "opt_out")
            clean_reply = reply_content if opt_out_match else \
                "Perfeito. Respeito sua decisão e não entraremos mais em contato pelo sistema. Fico à disposição para o futuro!"
            await asyncio.sleep(random.uniform(1.0, 2.0))
            await self._send_message(phone, clean_reply)
            return clean_reply

        # 9. Processa alerta de lead quente
        is_hot = "[ALERT_BROKER]" in reply_content
        if is_hot:
            print(f"🔥 LEAD QUENTE: {lead_real_name}")
            reply_content = reply_content.replace("[ALERT_BROKER]", "").strip()

            # CORREÇÃO DO BUG OOH: usa o schedule já carregado (não context.get('schedule'))
            is_ooh = not self.check_within_schedule(schedule)

            if is_ooh:
                print(f"🌙 Fora de horário. Marcando como pendente OOH...")
                self.db.update_lead_status(phone, "ooh_hot_alert_pending")
            else:
                self.db.update_lead_status(phone, "completed")
                self.db.update_lead_temperature(phone, "quente")
                self.db.set_lead_transfer_time(phone)
                self.db.add_broker_notification(user_id, str(lead_id), reply_content)
                self.alert_broker(context, reply_content)

        # 10. Atualiza status para 'active' se não for ação terminal
        if not is_hot and not is_scheduled:
            current_lead = self.db.get_lead_by_phone(phone)
            current_status = current_lead.get('status') if current_lead else 'waiting'
            blocked = ["completed", "transferred", "opt_out", "finalizado", "sem_interesse"]
            if current_status not in blocked:
                self.db.update_lead_status(phone, "active")
            else:
                print(f"🛡️ Lead {lead_real_name} em status terminal '{current_status}'. Sem reset.")

        # 11. Envia resposta ao cliente com delay humanizado
        await asyncio.sleep(random.uniform(1.8, 3.2))
        if reply_content:
            print(f"📤 Enviando para {phone}: {reply_content[:80]}...")
            await self._send_message(phone, reply_content)

        for img_url in images_to_send:
            await asyncio.sleep(1)
            self._send_image_to_zapi(phone, img_url)

        # 12. Melhoria contínua em background (não bloqueia a resposta)
        asyncio.create_task(self.evaluate_and_rank_lead(phone, sender_name, context))
        asyncio.create_task(self.audit_and_log_mistakes(phone, sender_name, message, reply_content, context))

        return reply_content

    # ------------------------------------------------------------------
    # ENVIO DE MENSAGENS (CORRIGIDO: agora é async)
    # ------------------------------------------------------------------
    async def _send_message(self, phone: str, content: str) -> bool:
        """
        Versão async do send_to_zapi — garante que a mensagem seja awaited.
        CORREÇÃO DO BUG CRÍTICO: antes era chamado com run_in_executor sem await,
        o que fazia mensagens serem perdidas silenciosamente ao reiniciar o servidor.
        """
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, self.send_to_zapi, phone, content)

    def send_to_zapi(self, phone: str, content: str) -> bool:
        instance_id = (
            os.getenv("ZAPI_INSTANCE_ID") or
            os.getenv("ID_INSTÂNCIA_ZAPI") or
            os.getenv("ID_INSTANCIA_ZAPI")
        )
        token = os.getenv("ZAPI_TOKEN") or os.getenv("ZAPI_TÔKEN")
        client_token = os.getenv("ZAPI_CLIENT_TOKEN")

        if not instance_id or not token:
            print("⚠️ ERRO: ZAPI_INSTANCE_ID ou ZAPI_TOKEN ausentes.")
            return False
        if not client_token:
            print("⚠️ ERRO: ZAPI_CLIENT_TOKEN ausente. Configure a variável de ambiente.")
            return False

        url = f"https://api.z-api.io/instances/{instance_id}/token/{token}/send-text"
        payload = {"phone": phone, "message": content}
        headers = {"Content-Type": "application/json", "Client-Token": client_token}

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=15)
            print(f"✅ [Z-API] Resposta para {phone}: {response.status_code}")
            response.raise_for_status()
            return True
        except Exception as e:
            print(f"❌ [Z-API] Falha ao enviar para {phone}: {e}")
            return False

    def _send_image_to_zapi(self, phone: str, image_url: str) -> None:
        instance_id = (
            os.getenv("ZAPI_INSTANCE_ID") or
            os.getenv("ID_INSTÂNCIA_ZAPI") or
            os.getenv("ID_INSTANCIA_ZAPI")
        )
        token = os.getenv("ZAPI_TOKEN") or os.getenv("ZAPI_TÔKEN")
        client_token = os.getenv("ZAPI_CLIENT_TOKEN")

        if not instance_id or not token or not client_token:
            print("⚠️ ERRO: Credenciais Z-API ausentes para envio de imagem.")
            return

        url = f"https://api.z-api.io/instances/{instance_id}/token/{token}/send-image"
        payload = {"phone": phone, "image": image_url}
        headers = {"Content-Type": "application/json", "Client-Token": client_token}

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=15)
            response.raise_for_status()
            print(f"✅ Imagem enviada para {phone}")
        except Exception as e:
            print(f"❌ Erro ao enviar imagem para {phone}: {e}")

    # ------------------------------------------------------------------
    # AVALIAÇÃO E MELHORIA CONTÍNUA
    # ------------------------------------------------------------------
    async def evaluate_and_rank_lead(self, phone: str, name: str, context: Dict[str, Any]) -> None:
        try:
            lead_id = context.get('lead_id')
            user_id = context.get('user_id')
            if not lead_id or not user_id:
                return

            history = self.db.get_chat_history(lead_id, limit=20)
            chat_str = "\n".join([f"{h['role']}: {h['content']}" for h in history])

            eval_prompt = f"""
            Analise a conversa abaixo entre a Raquel (IA) e o cliente {name}.
            Gere um resumo técnico para servir de exemplo de "Melhores Práticas".

            CONVERSA:
            {chat_str}

            RESPONDA APENAS EM JSON:
            {{
                "summary": "Breve perfil do lead e o que ele busca",
                "highlights": "Por que esse atendimento foi bom?",
                "temperature": "frio, morno, quente ou very_hot"
            }}
            """

            loop = asyncio.get_running_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "Você é um auditor de qualidade de atendimento imobiliário."},
                        {"role": "user", "content": eval_prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.3
                )
            )

            data = json.loads(response.choices[0].message.content)
            self.db.add_to_ranking(
                user_id=user_id,
                lead_id=lead_id,
                summary=data.get("summary", ""),
                highlights=data.get("highlights", "")
            )
            if "temperature" in data:
                print(f"🌡️ Temperatura de {name}: {data['temperature']}")
                self.db.update_lead_temperature(phone, data['temperature'])

            print(f"✅ Lead {name} adicionado ao ranking.")
        except Exception as e:
            print(f"❌ Erro ao avaliar lead para ranking: {e}")

    async def audit_and_log_mistakes(self, phone: str, name: str, user_msg: str, ai_reply: str, context: Dict[str, Any]) -> None:
        try:
            lead_id = context.get('lead_id')
            user_id = context.get('user_id')
            if not lead_id or not user_id:
                return

            audit_prompt = f"""
            Analise o diálogo abaixo e identifique se a Raquel cometeu erro, alucinação ou se o cliente precisou corrigi-la.

            MENSAGEM DO CLIENTE: "{user_msg}"
            RESPOSTA DA RAQUEL: "{ai_reply}"

            RESPONDA APENAS EM JSON:
            {{
                "has_error": true/false,
                "error_context": "O que a IA disse de errado?",
                "user_correction": "Como o usuário corrigiu?",
                "lesson_learned": "O que a IA NUNCA deve repetir?"
            }}
            """

            loop = asyncio.get_running_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "Você é um auditor crítico de conversas de IA."},
                        {"role": "user", "content": audit_prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.2
                )
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
                print(f"⚠️ Erro da IA registrado: {data.get('lesson_learned')}")
        except Exception as e:
            print(f"❌ Erro na auditoria: {e}")

    # ------------------------------------------------------------------
    # BRIEFING E ALERTA AO CORRETOR
    # ------------------------------------------------------------------
    def generate_lead_briefing(self, lead_id: str, context: Dict[str, Any]) -> str:
        try:
            name: str = context.get('lead_name', 'Cliente')
            history = self.db.get_chat_history(lead_id, limit=30)
            chat_text = "\n".join([f"{m['role']}: {m['content']}" for m in history]) if history else "Sem histórico."

            prompt = f"""
            Você é uma assistente de vendas de alto nível (Raquel).
            O lead {name} acaba de ser qualificado como QUENTE.
            Gere um BRIEFING EXECUTIVO DE ALTO IMPACTO para o corretor.

            FOCO:
            - Identificar a "Dor" ou o "Sonho" principal (emocional).
            - Perfil da família (filhos, cônjuge, pets).
            - Perfil Financeiro (Budget e origem do recurso se mencionado).
            - Origem: Investimento ou Moradia.
            - Interesses específicos (Bairros, Lançamentos, Atributos).

            HISTÓRICO DA CONVERSA:
            {chat_text}

            DADOS TÉCNICOS:
            {json.dumps(context, indent=2)}

            RESPONDA APENAS O BRIEFING FORMATADO EM MARKDOWN:
            👤 *Cliente*: {name}
            📞 *WhatsApp*: {context.get('lead_phone', 'N/A')}

            🎯 *PERFIL E MOTIVAÇÃO*:
            - **Objetivo**: (Moradia / Investimento)
            - **Motivação**: (O que o move?)
            - **Perfil Familiar**: (Quem vai morar?)

            📍 *PREFERÊNCIAS*:
            - **Região**: (Bairros citados)
            - **Tipo de Imóvel**: (Apartamento, Casa, etc.)
            - **Configuração**: (Quartos, suítes, vagas)
            - **Interesse Especial**: (O que mais valorizou?)

            💰 *CAPACIDADE FINANCEIRA*:
            - **Investimento Estimado**: (Se mencionado)
            - **Forma de Pagamento**: (À vista, Financiamento, FGTS)

            💬 *Resumo da Conversa*:
            (Pontos mais importantes ditos pelo cliente)

            💡 *DICA PARA FECHAMENTO*:
            (Sugestão de abordagem baseada no tom da conversa)
            """

            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "Você é o braço direito do corretor de elite. Gere resumos afiados e consultivos."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5
            )
            return response.choices[0].message.content or f"Lead {name} qualificado."
        except Exception as e:
            print(f"❌ Erro ao gerar briefing: {e}")
            return f"Lead {context.get('lead_name', 'Cliente')} qualificado e aguardando."

    def alert_broker(self, context: Dict[str, Any], message_context: str) -> None:
        broker_whatsapp: str = context.get('broker_whatsapp', '')
        lead_name: str = context.get('lead_name', 'Cliente')
        lead_id: str = context.get('lead_id', '')
        user_id: str = context.get('user_id', '')

        if not broker_whatsapp:
            print("⚠️ Alerta ignorado: corretor sem WhatsApp cadastrado.")
            return

        broker_whatsapp = re.sub(r'\D', '', str(broker_whatsapp))
        if broker_whatsapp and not broker_whatsapp.startswith("55") and len(broker_whatsapp) >= 10:
            broker_whatsapp = "55" + broker_whatsapp

        print(f"🚀 Gerando briefing para lead {lead_name}...")
        briefing = self.generate_lead_briefing(lead_id, context)

        self.db.add_broker_notification(user_id, lead_id, briefing)

        final_alert = (
            f"🔥 *LEAD QUENTE QUALIFICADO!* 🔥\n\n{briefing}\n\n"
            f"Enviando para você agora mesmo. Por favor, responda com *ok* para confirmar que recebeu."
        )

        try:
            with open("last_notification.json", "w", encoding="utf-8") as f:
                json.dump({
                    "timestamp": datetime.datetime.now().isoformat(),
                    "broker_whatsapp": broker_whatsapp,
                    "lead_id": lead_id,
                    "final_alert": final_alert
                }, f, indent=2, ensure_ascii=False)
        except Exception:
            pass

        self.send_to_zapi(broker_whatsapp, final_alert)