"""
raquel.py — Agente Raquel — versão final
Correções desta versão:
1. Problema #1: Proibição de "consultora" reforçada com exemplos negativos explícitos
2. Problema #7: Lista de opt-out expandida e normalizada (remove acentos na comparação)
3. Melhoria: Abertura emocional com rapport antes do fluxo
4. Melhoria: Técnica SPIN integrada ao fluxo de qualificação
5. Melhoria: Detecção de temperatura em tempo real (palavras-gatilho de urgência)
6. Melhoria: Gatilho de autoridade e prova social
7. Melhoria: Técnica CVB para contorno de objeção de preço
8. Melhoria: Confirmação do perfil antes de transferir (reduz briefings incompletos)
9. Melhoria: Delay adaptativo pelo tamanho da resposta
"""
import os
import requests
import datetime
import pytz
import asyncio
import json
import re
import unicodedata
from typing import List, Dict, Any, Optional
from openai import OpenAI
from dotenv import load_dotenv
from database import Database
from utils import is_within_schedule

load_dotenv()


def _normalize(text: str) -> str:
    """Remove acentos e converte para minúsculas para comparações robustas."""
    return ''.join(
        c for c in unicodedata.normalize('NFD', text.lower())
        if unicodedata.category(c) != 'Mn'
    )


def _adaptive_delay(message: str) -> float:
    """Delay proporcional ao tamanho da mensagem. Min 1.5s, max 8s."""
    return min(max(len(message) * 0.05, 1.5), 8.0)


class RaquelAgent:
    def __init__(self) -> None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY não encontrada.")
        self.client = OpenAI(api_key=api_key)
        self.db = Database()
        self.tz = pytz.timezone('America/Sao_Paulo')

    def get_system_prompt(self, context: Dict[str, Any]) -> str:
        broker_name = context.get('broker_name', 'Corretor')
        broker_agency = context.get('broker_agency', 'Imobiliária')
        broker_city = context.get('broker_city', 'sua região')
        broker_metro = context.get('broker_metropolitan_regions', '')
        lead_name = context.get('lead_name', 'Cliente')
        presentation = context.get('broker_presentation', '')
        daily_focus = context.get('daily_focus')

        focus_instructions = f"===== FOCO DO DIA: {daily_focus} =====" if daily_focus else ""
        ranking_examples = self.db.get_top_ranking_cases(context.get('user_id', ''), limit=3)
        recent_lessons = self.db.get_recent_lessons(context.get('user_id', ''), limit=5)

        area_atuacao = broker_city + (" e região" if broker_metro else "")
        intro_area = f"da cidade de {broker_city}" + (" e região" if broker_metro else "")
        now_str = datetime.datetime.now(self.tz).strftime('%d/%m/%Y %H:%M')

        return f"""
Você é a Raquel, assistente pessoal do corretor imobiliário {broker_name}, da empresa {broker_agency}, com foco em {area_atuacao}.
Sua missão é realizar uma qualificação profunda, consultiva e empática que converta leads em visitas agendadas.

===== LIÇÕES APRENDIDAS (NÃO REPITA ESTES ERROS) =====
{recent_lessons}

===== EXEMPLOS DE ATENDIMENTO NOTA 10 =====
{ranking_examples}

===== IDENTIDADE — REGRAS ABSOLUTAS =====
1. APRESENTAÇÃO: Apresente-se SEMPRE como "assistente do corretor imobiliário {broker_name} da empresa {broker_agency}, {intro_area}."
   - PROIBIDO: "consultora", "assistente virtual", "sistema", "IA", "robô", "inteligência artificial"
   - CORRETO: "assistente do {broker_name}"
   - EXEMPLO ERRADO: "Olá! Sou a Raquel, consultora imobiliária..."
   - EXEMPLO CERTO: "Olá! Sou a Raquel, assistente do corretor {broker_name}..."

2. SEM EMOJIS: Proibido em qualquer circunstância.

3. ESTILO: Respostas curtas e naturais de WhatsApp (1 a 3 frases). Empático e direto.

4. MEMÓRIA OBRIGATÓRIA: Antes de qualquer pergunta, verifique se o cliente já respondeu. PROIBIDO repetir perguntas.

5. UMA PERGUNTA POR VEZ.

6. CONTEXTO GEOGRÁFICO: Se o cliente citar um bairro ambíguo, pergunte de qual cidade.

===== ABERTURA EMOCIONAL (PRIMEIRA MENSAGEM) =====
Nunca comece direto com perguntas de qualificação. A primeira mensagem deve:
- Criar conexão humana imediata
- Demonstrar conhecimento do mercado local
- Só então fazer a primeira pergunta de forma leve

EXEMPLO DE ABERTURA CORRETA:
"Olá {lead_name}! Sou a Raquel, assistente do corretor {broker_name} aqui em {broker_city}. Que ótimo que você entrou em contato — o mercado aqui está com ótimas oportunidades. Me conta, você está buscando para morar ou para investir?"

===== AUTORIDADE E PROVA SOCIAL =====
Durante a conversa, use sutilmente a autoridade do corretor para gerar confiança:
- "O {broker_name} atua há anos nessa região e conhece cada detalhe dos melhores bairros."
- "Muitos clientes com esse mesmo perfil encontraram exatamente o que buscavam com ele."
Use apenas quando natural na conversa. Não force.

===== DETECÇÃO DE URGÊNCIA (TEMPERATURA EM TEMPO REAL) =====
Se o cliente mencionar qualquer um desses sinais, considere-o QUENTE e acelere para a transferência:
- Prazo curto: "preciso sair logo", "tenho que mudar em X meses", "estou de aluguel vencendo"
- Motivação emocional forte: "vou me casar", "estamos grávidos", "meus filhos precisam de escola"
- Prontidão financeira: "tenho o FGTS disponível", "já tenho entrada", "consigo financiar"
- Pesquisa ativa: "já visitei outros imóveis", "já fui em outros corretores"
Ao detectar esses sinais, conclua a qualificação rapidamente e transfira.

===== FLUXO DE QUALIFICAÇÃO SPIN =====
Siga esta ordem. Pule o que já foi respondido. Use frases de contexto antes de cada pergunta.

1. OBJETIVO: "Você está buscando para morar ou investir?"
   Se já souber, pule.

2. DOR/MOTIVAÇÃO (SPIN — pergunta de implicação):
   Não pergunte diretamente. Introduza naturalmente:
   "O que está te fazendo pensar em mudar agora? Tem algo no lugar atual que incomoda?"
   Isso revela urgência real e humaniza a conversa.

3. TIPO: Casa ou apartamento?

4. LOCALIZAÇÃO: Quais bairros ou regiões em {area_atuacao}?

5. PERFIL: Quem vai morar? (família, filhos, sozinho)

6. TÉCNICO: Quartos e vagas de garagem.

7. DIFERENCIAIS: Preferências específicas (adapte ao tipo — citar só 1 ou 2 exemplos).

8. MOMENTO: Quando pretende se mudar?
   - Menos de 6 meses → focar em prontos. NUNCA mencionar lançamentos.
   - Mais de 12 meses → pode incluir lançamentos.

9. INVESTIMENTO: Faixa de valor (perguntar por último, de forma natural).

10. FORMA DE PAGAMENTO: Financiamento, à vista, FGTS?

===== CONTORNO DE OBJEÇÃO DE PREÇO (TÉCNICA CVB) =====
Se o cliente disser que o valor está alto, NÃO transfira imediatamente nem desista.
Use Característica → Vantagem → Benefício:
"Entendo. Esse valor considera [característica do imóvel/localização]. A vantagem é [o que isso oferece]. Para [perfil do cliente], isso costuma representar [benefício real na vida dele]."
Exemplo: "Entendo. Esse valor já inclui a localização no [bairro], que fica pertinho de [referência que o cliente mencionou]. Para quem tem filhos em idade escolar como você mencionou, isso economiza muito tempo e preocupação no dia a dia."

===== CONFIRMAÇÃO ANTES DE TRANSFERIR =====
Antes do [ALERT_BROKER], faça um mini-resumo e confirme:
"Deixa eu confirmar o que entendi: você busca [tipo] de [X] quartos em [região], para [objetivo], com orçamento em torno de R$ [Y] e pretende se mudar em [prazo]. Está correto?"
Só transfira após confirmação do cliente (ou se ele não corrigir nada).

===== REGRA DOS LANÇAMENTOS =====
- Menos de 6 meses para mudar → NUNCA fale de lançamentos
- Só lançamentos se prazo > 12 meses
- Ao enviar lançamento: APENAS Nome + Link. Nada mais.

===== FORMATO DE ENVIO =====
- PROIBIDO prometer "enviar opções depois" — o {broker_name} faz isso após a transferência
- NÃO use bullet points ou listas longas nas mensagens
- Tom natural de WhatsApp

{focus_instructions}

[INSTRUÇÕES DO CORRETOR]:
{presentation if presentation else "Tom polido e focado em alta qualidade de atendimento."}

===== AGENDAMENTO DE RETORNO =====
Hoje é {now_str} (Fuso de Brasília).
Se o cliente pedir para retornar depois:
1. Se não der dia/hora, pergunte gentilmente.
2. Se informou, inclua [SCHEDULE: YYYY-MM-DD HH:MM] no final.
Exemplo: "Combinado! Te chamo amanhã às 14h. [SCHEDULE: 2026-04-03 14:00]"

Transferência: "Perfeito, {lead_name}. Vou transferir seu atendimento agora para o {broker_name}. Ele vai te apresentar as melhores opções em {area_atuacao} que combinam exatamente com o que você busca. [ALERT_BROKER]"

===== OPT-OUT =====
Se o cliente demonstrar desinteresse:
1. Resposta educada e finalizadora: "Perfeito, {lead_name}. Obrigado pelo retorno e fico à disposição caso precise no futuro. Um abraço!"
2. Adicione [OPT_OUT] obrigatoriamente.
3. PROIBIDO continuar o fluxo ou tentar convencer.
"""

    def check_within_schedule(self, schedule: Any) -> bool:
        now = datetime.datetime.now(self.tz)
        return is_within_schedule(schedule if isinstance(schedule, list) else [], now)

    def get_next_working_slot(self, schedule: Any) -> tuple:
        schedule_list = schedule if isinstance(schedule, list) else []
        now = datetime.datetime.now(self.tz)
        current_db_day = (now.weekday() + 1) % 7
        days_map = {
            0: "no domingo", 1: "na segunda-feira", 2: "na terça-feira",
            3: "na quarta-feira", 4: "na quinta-feira", 5: "na sexta-feira", 6: "no sábado"
        }

        for offset in range(8):
            check_day = (current_db_day + offset) % 7
            for s in schedule_list:
                if s.get('day_of_week') == check_day and s.get('is_active'):
                    t = str(s.get('start_time', '08:00')).split(":")
                    start = f"{t[0]}:{t[1]}" if len(t) >= 2 else "08:00"
                    if offset == 0:
                        sh, sm = int(start.split(":")[0]), int(start.split(":")[1])
                        if now.hour < sh or (now.hour == sh and now.minute < sm):
                            return "ainda hoje", start
                    elif offset == 1:
                        return "amanhã", start
                    else:
                        return days_map.get(check_day, "no próximo dia útil"), start
        return "no próximo dia útil", "08:00"

    async def transcribe_audio(self, audio_url: str) -> str:
        import tempfile
        suffix = ".ogg"
        if ".mp3" in audio_url.lower(): suffix = ".mp3"
        elif ".wav" in audio_url.lower(): suffix = ".wav"

        def do_transcribe() -> str:
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                temp_path = tmp.name
            try:
                r = requests.get(audio_url, timeout=30, verify=False)
                r.raise_for_status()
                with open(temp_path, "wb") as f:
                    f.write(r.content)
                if os.path.getsize(temp_path) < 100:
                    return "[O áudio parece estar vazio]"
                with open(temp_path, "rb") as af:
                    t = self.client.audio.transcriptions.create(model="whisper-1", file=af)
                return str(t.text).strip()
            except Exception as e:
                print(f"❌ Erro na transcrição: {e}")
                return "[Erro ao transcrever áudio]"
            finally:
                if os.path.exists(temp_path):
                    try: os.remove(temp_path)
                    except: pass

        return await asyncio.get_running_loop().run_in_executor(None, do_transcribe)

    async def process_message(
        self,
        phone: str,
        message: str,
        sender_name: str,
        is_audio: bool = False,
        audio_urls: List[str] = []
    ) -> str:
        print(f"📥 [{phone}] Processando mensagem de {sender_name}. Áudios: {len(audio_urls)}")

        context = self.db.get_broker_by_lead_phone(phone)
        if not context:
            print(f"⚠️ Lead {phone} não encontrado no banco.")
            return ""

        user_id = context.get('user_id', '')
        lead_id = context.get('lead_id', '')
        lead_real_name = context.get('lead_name', 'Cliente')
        broker_name = context.get('broker_name', 'Corretor')

        # Transcrição de áudios
        if is_audio and audio_urls:
            transcriptions = []
            for url in audio_urls:
                t = await self.transcribe_audio(url)
                if t not in ("[Erro ao transcrever áudio]", "[O áudio parece estar vazio]"):
                    transcriptions.append(t)
            if transcriptions:
                audio_text = "\n".join(transcriptions)
                message = (message + "\n" + audio_text).strip() if message else audio_text
            elif not message:
                return "Desculpe, não consegui entender o áudio. Pode escrever por favor?"

        # Busca dados para o contexto
        schedule = self.db.get_broker_schedule(user_id)
        history = self.db.get_chat_history(lead_id)
        portfolio_text = self.db.get_portfolio(user_id)

        if len(portfolio_text) < 50:
            print(f"⚠️ Portfólio do corretor {broker_name} parece vazio!")

        # Monta mensagens para a OpenAI
        messages: List[Dict[str, Any]] = [
            {"role": "system", "content": self.get_system_prompt(context)},
            {"role": "system", "content": f"PORTFÓLIO DISPONÍVEL:\n{portfolio_text}"}
        ]
        for h in history:
            messages.append({"role": str(h.get('role', 'user')), "content": str(h.get('content', ''))})
        messages.append({"role": "user", "content": message})

        # Gera resposta
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
            reply_content = response.choices[0].message.content or "Desculpe, não consegui formular uma resposta."
        except Exception as e:
            print(f"❌ Erro na OpenAI: {e}")
            error_msg = "Desculpe, tive um problema técnico momentâneo."
            await self._send_message(phone, error_msg)
            return error_msg

        # Salva no banco
        if lead_id and user_id:
            self.db.save_message(lead_id, user_id, "user", message)
            self.db.save_message(lead_id, user_id, "assistant", reply_content)

        # Processa tags
        images_to_send = re.findall(r'\[SEND_IMAGE:\s*(.*?)\]', reply_content)
        schedule_match = re.search(r'\[SCHEDULE:\s*(.*?)\]', reply_content)
        opt_out_tag = "[OPT_OUT]" in reply_content

        # Opt-out por keywords — versão expandida e normalizada (problema #7)
        msg_norm = _normalize(message)
        opt_out_keywords = [
            "pode parar", "nao quero", "nao tenho interesse", "parar de mandar",
            "nao me mande", "me tire da lista", "nao quero mais", "chega",
            "para de me mandar", "nao preciso", "desistir", "nao vou comprar",
            "cancela", "remove meu numero"
        ]
        user_opt_out = any(k in msg_norm for k in opt_out_keywords)

        # Limpa tags do texto
        reply_content = re.sub(r'\[SEND_IMAGE:\s*.*?\]', '', reply_content).strip()
        reply_content = reply_content.replace("[OPT_OUT]", "").strip()

        is_scheduled = False
        if schedule_match and not (opt_out_tag or user_opt_out):
            schedule_str = schedule_match.group(1).strip()
            reply_content = re.sub(r'\[SCHEDULE:\s*.*?\]', '', reply_content).strip()
            print(f"🗓️ Agendamento: {schedule_str}")
            self.db.schedule_follow_up(phone, schedule_str)
            is_scheduled = True

        # Processa opt-out
        if opt_out_tag or user_opt_out:
            print(f"🚫 OPT-OUT: {lead_real_name}")
            self.db.update_lead_status(phone, "opt_out")
            clean_reply = reply_content if opt_out_tag else \
                "Perfeito. Respeito sua decisão e não entraremos mais em contato. Fico à disposição para o futuro!"
            await asyncio.sleep(1.5)
            await self._send_message(phone, clean_reply)
            return clean_reply

        # Processa lead quente
        is_hot = "[ALERT_BROKER]" in reply_content
        if is_hot:
            print(f"🔥 LEAD QUENTE: {lead_real_name}")
            reply_content = reply_content.replace("[ALERT_BROKER]", "").strip()

            # Usa o schedule já carregado (correção do bug OOH)
            is_ooh = not self.check_within_schedule(schedule)

            if is_ooh:
                print(f"🌙 Fora de horário. Marcando como OOH pendente.")
                self.db.update_lead_status(phone, "ooh_hot_alert_pending")
            else:
                self.db.update_lead_status(phone, "completed")
                self.db.update_lead_temperature(phone, "quente")
                self.db.set_lead_transfer_time(phone)
                self.db.add_broker_notification(user_id, str(lead_id), reply_content)
                self.alert_broker(context, reply_content)

        # Atualiza para active se não for ação terminal
        if not is_hot and not is_scheduled:
            current_lead = self.db.get_lead_by_phone(phone)
            current_status = current_lead.get('status') if current_lead else 'waiting'
            blocked = ["completed", "transferred", "opt_out", "finalizado", "sem_interesse",
                       "abandoned_no_reply", "abandoned_dropout"]
            if current_status not in blocked:
                self.db.update_lead_status(phone, "active")
            else:
                print(f"🛡️ {lead_real_name} em status terminal '{current_status}'. Sem reset.")

        # Envia resposta com delay adaptativo
        delay = _adaptive_delay(reply_content)
        await asyncio.sleep(delay)

        if reply_content:
            print(f"📤 Enviando para {phone}: {reply_content[:80]}...")
            await self._send_message(phone, reply_content)

        for img_url in images_to_send:
            await asyncio.sleep(1)
            self._send_image_to_zapi(phone, img_url)

        asyncio.create_task(self.evaluate_and_rank_lead(phone, sender_name, context))
        asyncio.create_task(self.audit_and_log_mistakes(phone, sender_name, message, reply_content, context))

        return reply_content

    async def _send_message(self, phone: str, content: str) -> bool:
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
            print("⚠️ ZAPI_INSTANCE_ID ou ZAPI_TOKEN ausentes.")
            return False
        if not client_token:
            print("⚠️ ZAPI_CLIENT_TOKEN ausente.")
            return False

        url = f"https://api.z-api.io/instances/{instance_id}/token/{token}/send-text"
        try:
            r = requests.post(
                url,
                json={"phone": phone, "message": content},
                headers={"Content-Type": "application/json", "Client-Token": client_token},
                timeout=15
            )
            print(f"✅ [Z-API] {phone}: {r.status_code}")
            r.raise_for_status()
            return True
        except Exception as e:
            print(f"❌ [Z-API] Falha para {phone}: {e}")
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
            print("⚠️ Credenciais Z-API ausentes para imagem.")
            return
        try:
            r = requests.post(
                f"https://api.z-api.io/instances/{instance_id}/token/{token}/send-image",
                json={"phone": phone, "image": image_url},
                headers={"Content-Type": "application/json", "Client-Token": client_token},
                timeout=15
            )
            r.raise_for_status()
            print(f"✅ Imagem enviada para {phone}")
        except Exception as e:
            print(f"❌ Erro ao enviar imagem para {phone}: {e}")

    async def evaluate_and_rank_lead(self, phone: str, name: str, context: Dict[str, Any]) -> None:
        try:
            lead_id = context.get('lead_id')
            user_id = context.get('user_id')
            if not lead_id or not user_id: return

            history = self.db.get_chat_history(lead_id, limit=20)
            chat_str = "\n".join([f"{h['role']}: {h['content']}" for h in history])

            loop = asyncio.get_running_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "Você é um auditor de qualidade de atendimento imobiliário."},
                        {"role": "user", "content": f"Analise a conversa e gere um resumo técnico.\n\nCONVERSA:\n{chat_str}\n\nRESPONDA APENAS EM JSON:\n{{\"summary\": \"perfil do lead\", \"highlights\": \"por que esse atendimento foi bom\", \"temperature\": \"frio/morno/quente/very_hot\"}}"}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.3
                )
            )
            data = json.loads(response.choices[0].message.content)
            self.db.add_to_ranking(user_id=user_id, lead_id=lead_id,
                                   summary=data.get("summary", ""),
                                   highlights=data.get("highlights", ""))
            if "temperature" in data:
                self.db.update_lead_temperature(phone, data['temperature'])
            print(f"✅ Ranking atualizado para {name}.")
        except Exception as e:
            print(f"❌ Erro ao avaliar lead: {e}")

    async def audit_and_log_mistakes(self, phone: str, name: str, user_msg: str, ai_reply: str, context: Dict[str, Any]) -> None:
        try:
            lead_id = context.get('lead_id')
            user_id = context.get('user_id')
            if not lead_id or not user_id: return

            loop = asyncio.get_running_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "Você é um auditor crítico de conversas de IA."},
                        {"role": "user", "content": f"MENSAGEM DO CLIENTE: \"{user_msg}\"\nRESPOSTA DA RAQUEL: \"{ai_reply}\"\n\nRESPONDA EM JSON:\n{{\"has_error\": true/false, \"error_context\": \"...\", \"user_correction\": \"...\", \"lesson_learned\": \"...\"}}"}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.2
                )
            )
            data = json.loads(response.choices[0].message.content)
            if data.get("has_error"):
                self.db.add_mistake_log(user_id=user_id, lead_id=lead_id,
                                        error_context=data.get("error_context", ""),
                                        user_correction=data.get("user_correction", ""),
                                        lesson=data.get("lesson_learned", ""))
                print(f"⚠️ Erro registrado: {data.get('lesson_learned')}")
        except Exception as e:
            print(f"❌ Erro na auditoria: {e}")

    def generate_lead_briefing(self, lead_id: str, context: Dict[str, Any]) -> str:
        try:
            name = context.get('lead_name', 'Cliente')
            history = self.db.get_chat_history(lead_id, limit=30)
            chat_text = "\n".join([f"{m['role']}: {m['content']}" for m in history]) if history else "Sem histórico."

            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "Você é o braço direito de um corretor de elite. Gere resumos afiados e consultivos."},
                    {"role": "user", "content": f"""
O lead {name} acaba de ser qualificado como QUENTE.
Gere um BRIEFING EXECUTIVO para o corretor.

HISTÓRICO:
{chat_text}

DADOS:
{json.dumps(context, indent=2)}

FORMATO EM MARKDOWN:
👤 *Cliente*: {name}
📞 *WhatsApp*: {context.get('lead_phone', 'N/A')}

🎯 *PERFIL E MOTIVAÇÃO*:
- **Objetivo**: (Moradia / Investimento)
- **Motivação**: (o que o move emocionalmente?)
- **Perfil Familiar**: (quem vai morar?)

📍 *PREFERÊNCIAS*:
- **Região**: (bairros citados)
- **Tipo de Imóvel**: (apartamento, casa, etc.)
- **Configuração**: (quartos, suítes, vagas)
- **Interesse Especial**: (o que mais valorizou?)

💰 *CAPACIDADE FINANCEIRA*:
- **Investimento Estimado**: (se mencionado)
- **Forma de Pagamento**: (à vista, financiamento, FGTS)

💬 *Resumo da Conversa*:
(pontos mais importantes)

💡 *DICA PARA FECHAMENTO*:
(sugestão de abordagem baseada no tom da conversa)
"""}
                ],
                temperature=0.5
            )
            return response.choices[0].message.content or f"Lead {name} qualificado."
        except Exception as e:
            print(f"❌ Erro ao gerar briefing: {e}")
            return f"Lead {context.get('lead_name', 'Cliente')} qualificado e aguardando."

    def alert_broker(self, context: Dict[str, Any], message_context: str) -> None:
        broker_whatsapp = context.get('broker_whatsapp', '')
        lead_name = context.get('lead_name', 'Cliente')
        lead_id = context.get('lead_id', '')
        user_id = context.get('user_id', '')

        if not broker_whatsapp:
            print("⚠️ Corretor sem WhatsApp cadastrado.")
            return

        broker_whatsapp = re.sub(r'\D', '', str(broker_whatsapp))
        if broker_whatsapp and not broker_whatsapp.startswith("55") and len(broker_whatsapp) >= 10:
            broker_whatsapp = "55" + broker_whatsapp

        print(f"🚀 Gerando briefing para {lead_name}...")
        briefing = self.generate_lead_briefing(lead_id, context)
        self.db.add_broker_notification(user_id, lead_id, briefing)

        final_alert = (
            f"🔥 *LEAD QUENTE QUALIFICADO!* 🔥\n\n{briefing}\n\n"
            f"Enviando para você agora. Responda com *ok* para confirmar que recebeu."
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