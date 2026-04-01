import os
import requests # pyre-ignore
import datetime
import pytz # pyre-ignore
import time
import random
import asyncio
import json
from typing import List, Dict, Any, Optional, Union
import json
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
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY não encontrada no .env")

        self.client = OpenAI(api_key=api_key)
        self.db = Database()
        self.tz = pytz.timezone('America/Sao_Paulo')

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

        area_atuacao = f"{broker_city}"
        intro_area = f"da cidade de {broker_city}"
        if broker_metro:
            area_atuacao += f" e região"
            intro_area += " e região"

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
           - **REGRA DE OURO**: Se o cliente citar um bairro que possa existir em mais de uma cidade da sua região (ex: Setor Bueno em Goiânia vs cidades vizinhas), você DEVE perguntar de qual cidade ele está falando. Ex: "Você está falando do [Bairro] aqui de {broker_city} ou de outra cidade da região?"
           - Nunca assuma a cidade se houver dúvida.

        ===== DIRETRIZES DE OURO (NÃO NEGOCIÁVEIS) =====
        1. **SEM EMOJIS**: É terminantemente PROIBIDO o uso de emojis em qualquer circunstância.
        2. **ESTILO DE COMUNICAÇÃO (CONSULTORA ESPECIALISTA)**: 
           - **Respostas curtas e conversacionais**: Mantenha o estilo natural de WhatsApp. Não transforme a conversa em explicações longas.
           - **Brevidade e Foco**: Seja ágil (1 a 3 frases no máximo), mas sem perder a elegância. O foco continuará sendo a qualificação.
           - **Empatia**: Quando o cliente falar de sua realidade, ouça com atenção e valide para gerar conexão humana rápida.
        3. **ASSERTIVIDADE NA TRANSFERÊNCIA**: Não peça permissão. Quando chegar o momento, afirme: "Agora vou transferir sua consulta para o {broker_name}...".
        4. **REGRA DOS LANÇAMENTOS VS PRAZO (MUITO CRUCIAL)**: 
           - Se o cliente precisa se mudar em **menos de 6 meses**, você NUNCA deve falar de "Lançamentos" (imóveis em construção). Foque exclusivamente em imóveis **Prontos** ou **Semi-novos**.
           - Sugira Lançamentos apenas se o prazo de mudança for maior que 12 meses (entrega futura).
           - Gafie imperdoável: Oferecer imóvel que fica pronto em 3 anos para quem precisa mudar em 2 meses. REVISE O PRAZO ANTES DE FALAR.
        5. **FORMATO DE ENVIO DE LANÇAMENTO**: Envie APENAS Nome + Link. Nada de fotos.
        6. **NÃO PROMETA "ENVIAR OPÇÕES" DEPOIS**: O {broker_name} fará o envio personalizado após a transferência.
        7. **NÃO É ROBÔ**: Nunca use a palavra "virtual", "sistema" ou "IA". Você é a assistente real dele.
        8. **MEMÓRIA DE CURTO PRAZO (CRUCIAL)**: Antes de fazer qualquer pergunta do fluxo, verifique se a informação já foi fornecida pelo cliente no histórico recente. É terminantemente PROIBIDO perguntar o que o cliente já respondeu espontaneamente ou em mensagens anteriores.
        9. **UMA PERGUNTA POR VEZ**: Mantenha a conversa fluida, respondendo e então fazendo a próxima pergunta (desde que ainda não tenha sido respondida).
        10. **AGRUPAMENTO DE MENSAGENS (CRUCIAL PARA WHATSAPP)**:
          - O cliente pode enviar várias mensagens curtas em sequência (frases quebradas).
          - Ao receber uma mensagem, aguarde entre **25 a 30 segundos** antes de responder.
          - Se novas mensagens chegarem dentro desse intervalo, considere todas como parte de uma única mensagem.
          **REGRA**:
          - NÃO responda imediatamente a primeira mensagem.
          - Aguarde o tempo para capturar possíveis complementos do cliente.
          **COMPORTAMENTO**:
          - Leia todas as mensagens enviadas dentro do intervalo como um único contexto.
          - Gere apenas **UMA resposta consolidada**, considerando tudo que o cliente disse.
          **PROIBIDO**:
          - Responder mensagens separadamente quando forem partes da mesma ideia.
          - Enviar respostas fragmentadas ou desconectadas.
          **OBJETIVO**:
          - Simular comportamento humano natural.
          - Evitar respostas apressadas.
          - Melhorar a fluidez e compreensão da conversa.

        {focus_instructions}

        [INSTRUÇÕES ESPECÍFICAS DO CORRETOR]:
        {presentation if presentation else "Tom polido e focado em alta qualidade de atendimento."}

        ===== FLUXO DE QUALIFICAÇÃO (DINÂMICO E SEM REPETIÇÃO) =====
        Seu objetivo principal é preencher exatamente a mesma ordem de requisitos abaixo. Se o cliente já informou algo, NÃO PERGUNTE NOVAMENTE. Pule para o próximo item pendente.
        
        **COMO PERGUNTAR (TÉCNICA DE CONSULTORIA - MANDATÓRIO):**
        - ANTES de cada pergunta abaixo, inclua sempre uma frase curta e natural que: 1) traga contexto ou valor, 2) valide a escolha do cliente, ou 3) demonstre conhecimento forte do mercado. Ex: "Temos excelentes oportunidades com esse perfil...", ou "Ótima escolha, essa região tem se valorizado muito...".
        - EVITE perguntas diretas e secas (estilo formulário). Sempre suavize com uma introdução leve.
        - Mostre segurança e domínio de mercado. Faça o cliente sentir que está sendo muito bem orientado.

       1. OBJETIVO: Pergunte se o interesse é para moradia ou investimento.
       2. TIPO: Pergunte se prefere casa ou apartamento.
       3. LOCALIZAÇÃO: Pergunte quais bairros ou regiões em {area_atuacao}.
         Regra:
             - Se o cliente não souber, use referências como trabalho, pontos conhecidos ou regiões.
             - Ex: “Prefere algo próximo ao trabalho ou alguma região específica?”
       4. PERFIL: Pergunte quem vai morar no imóvel.
             Ex: sozinho, com esposa, filhos, etc.
       5. TÉCNICO: Pergunte quantidade de quartos e vagas de garagem.
       6. DIFERENCIAIS: Pergunte se existe preferência por áreas de lazer ou características específicas.
             OBSERVAÇÃO (INTELIGÊNCIA DE CONTEXTO):
                 - Adapte a pergunta com base no tipo de imóvel (casa ou apartamento).
                 - Cite no máximo 1 ou 2 exemplos relevantes (NUNCA liste muitos).
                 - Use linguagem natural, como continuação da conversa.
                     Exemplos:
                         - Casa: “Você tem preferência por algo como área gourmet ou piscina?”
                         - Apartamento: “Você busca algo com academia ou área de lazer no condomínio?”
             - Não é obrigatório aprofundar. Se o cliente não engajar, siga o fluxo.
       7. MOMENTO: Pergunte quando pretende se mudar.
             Regra:
                 - Curto prazo → focar imóveis prontos
                 - Médio/longo prazo → pode incluir lançamentos
       8. INVESTIMENTO: Pergunte a faixa de valor que pretende investir.
             Regra:
                 - Sempre perguntar por último
                 - Seja direto, mas natural
       9. FORMA DE PAGAMENTO (APROFUNDAMENTO): Após o valor, pergunte como pretende pagar.
              Ex: “Você pretende financiar, pagar à vista ou está avaliando opções?”
              Regra:
              - Essa pergunta aumenta MUITO a qualidade do lead
              - Não precisa forçar, mantenha leve


        ===== REGRA DE OURO DA MEMÓRIA (NÃO NEGOCIÁVEL) =====
        Antes de digitar, revise mentalmente: "Eu já sei a resposta para o que vou perguntar?". Se sim, você está ERRANDO. Avance para o próximo tópico. Se o cliente já deu várias informações de uma vez, agradeça, reafirme brevemente e pergunte o que SOBROU.

        ===== AGENDAMENTO DE RETORNO (FOLLOW-UP) =====
        Hoje é {datetime.datetime.now(self.tz).strftime('%d/%m/%Y %H:%M')} (Fuso de Brasília).
        Se o cliente pedir para você retornar o contato depois (ex: "não posso falar", "me chama amanhã", "fala comigo sexta"):
        1. Se ele não der dia e hora exatos, pergunte gentilmente: "Claro! Qual o melhor dia e horário para eu te chamar de novo?"
        2. Se ele já informou hora e dia (mesmo que seja às 6h da manhã de sábado, fora do horário normal), inclua a tag [SCHEDULE: YYYY-MM-DD HH:MM] no final da sua resposta, preenchendo a data correta baseando-se em hoje.
        Exemplo: "Combinado, {lead_name}! Te chamo amanhã às 14h então. Um abraço! [SCHEDULE: 2026-04-01 14:00]"

        ===== GATILHOS DE TRANSFERÊNCIA =====
        Você deve passar a bola para o {broker_name} usando o comando [ALERT_BROKER] nas seguintes situações:
        1. **PEDIDO DE LIGAÇÃO**: Se o cliente pedir para falar por telefone, ligação ou áudio ao vivo, use [ALERT_BROKER] e informe que o {broker_name} entrará em contato por voz em breve.
        2. **QUALIFICAÇÃO CONCLUÍDA**: Após passar pelas 7 etapas do fluxo acima.
        
        Exemplo de transferência por qualificação: "Perfeito, {lead_name}. Com base no que conversamos, vou transferir seu atendimento agora para o {broker_name}. Ele é o especialista que vai te apresentar as melhores oportunidades em {area_atuacao} que se encaixam exatamente no que você busca. [ALERT_BROKER]"
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
        
        # 1. Busca dados do corretor (Normalizado)
        context: Optional[Dict[str, Any]] = self.db.get_broker_by_lead_phone(phone)
        if not context:
            error_msg = f"⚠️ [ERRO] Lead {phone} não encontrado ou sem corretor no banco."
            print(error_msg)
            return error_msg

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
        messages: List[Dict[str, Any]] = [{"role": "system", "content": self.get_system_prompt(context)}]
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
        schedule_match = re.search(r'\[SCHEDULE:\s*(.*?)\]', reply_content)
        
        reply_content = re.sub(r'\[SEND_IMAGE:\s*.*?\]', '', reply_content).strip()
        
        is_scheduled = False
        if schedule_match:
            schedule_str = schedule_match.group(1).strip()
            reply_content = re.sub(r'\[SCHEDULE:\s*.*?\]', '', reply_content).strip()
            print(f"🗓️ Cliente pediu para agendar: {schedule_str}. Atualizando DB...")
            self.db.schedule_follow_up(phone, schedule_str)
            is_scheduled = True

        # 8. PROCESSA ALERTA DE LEAD QUENTE
        is_hot = "[ALERT_BROKER]" in reply_content
        if is_hot:
            print(f"🔥 LEAD QUENTE DETECTADO: {lead_real_name}")
            reply_content = reply_content.replace("[ALERT_BROKER]", "").strip()
            
            is_ooh = not self.is_within_schedule(schedule)
            if is_ooh:
                next_day, next_time = self.get_next_working_slot(schedule)
                pass_baton_msg = f"\n\n*Observação:* O nosso escritório no momento está fechado. O corretor {broker_name} estará em atendimento {next_day} a partir das {next_time} e entrará em contato com você assim que possível!"
                reply_content += pass_baton_msg
                self.db.update_lead_status(phone, "completed") # Move para Finalizados/Qualificados
                self.db.update_lead_temperature(phone, "quente") # Altera para Quente automaticamente
            else:
                # Disparamos o alerta em background para não travar a resposta ao cliente
                print(f"📡 Disparando alerta para o corretor em background...")
                loop = asyncio.get_event_loop()
                loop.run_in_executor(None, self.alert_broker, context, message)
                
                self.db.update_lead_status(phone, "completed") # Move para Finalizados/Qualificados
                self.db.update_lead_temperature(phone, "quente") # Altera para Quente automaticamente
                self.db.set_lead_transfer_time(phone)

        # Atualiza status normal se não for lead quente nem agendamento
        if not is_hot and not is_scheduled:
            # Reseta o contador para o follow-up types 1 e 2
            self.db.update_lead_status(phone, "active")

        clean_reply = reply_content

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
                "highlights": "Por que esse atendimento foi bom? (ex: Raquel identificou a necessidade de proximidade com o hospital e sugeriu o bairro X)",
                "temperature": "frio", "morno", "quente" ou "very_hot" (Baseado no interesse e prontidão do lead)
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
            
            # Atualiza a temperatura do lead na tabela principal para o CRM
            if "temperature" in data:
                print(f"🌡️ IA definiu temperatura de {name} como: {data['temperature']}")
                self.db.update_lead_temperature(phone, data['temperature'])
                
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
        Gera um briefing consultivo e emocional sobre o lead usando IA.
        """
        try:
            name: str = context.get('lead_name', 'Cliente')
            # 1. Busca histórico recente (CORREÇÃO: usar lead_id em vez de phone)
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
            - Origem: Se é Investimento ou Moradia.
            - Interesses específicos (Bairros, Lançamentos, Atributos do imóvel).

            HISTÓRICO DA CONVERSA:
            {chat_text}
            
            DADOS TÉCNICOS:
            {json.dumps(context, indent=2)}

            RESPONDA APENAS O BRIEFING FORMATADO EM MARKDOWN:
            👤 *Cliente*: {name}
            📞 *WhatsApp*: {context.get('lead_phone', 'N/A')}
            
            🎯 *PERFIL E MOTIVAÇÃO*:
            - **Objetivo**: (Moradia / Investimento)
            - **Motivação**: (O que o move? Ex: Mais espaço para os filhos, sair do aluguel, investir em lançamentos)
            - **Perfil Familiar**: (Quem vai morar? Filhos mencionados?)

            📍 *PREFERÊNCIAS*:
            - **Região**: (Bairros citados)
            - **Tipo de Imóvel**: (EXCLUSIVO: Apartamento, Casa, Sobrado, Terreno, etc - Identifique no histórico)
            - **Configuração**: (Número de quartos, suítes, vagas)
            - **Interesse Especial**: (O que ele mais valorizou na conversa?)

            💰 *CAPACIDADE FINANCEIRA*:
            - **Investimento Estimado**: (Se mencionado ou deduzido)
            - **Forma de Pagamento**: (À vista, Financiamento, FGTS, Permuta)

            💬 *Resumo da Conversa*:
            (Descreva aqui os pontos mais importantes ditos pelo cliente nesta interação)

            💡 *DICA PARA FECHAMENTO*:
            (Sugestão de como o corretor deve abordar este cliente baseado no tom da conversa)
            """

            response = self.client.chat.completions.create(
                model="gpt-4o", # Usando gpt-4o para briefing mais inteligente
                messages=[{"role": "system", "content": "Você é o braço direito do corretor de elite. Gere resumos afiados e consultivos."}, 
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
            print(f"⚠️ Alerta ignorado: Corretor sem WhatsApp cadastrado no banco de dados.")
            return

        # Garante que o número está formatado para o Z-API (apenas números)
        import re
        broker_whatsapp = re.sub(r'\D', '', str(broker_whatsapp))
        if broker_whatsapp and not broker_whatsapp.startswith("55") and len(broker_whatsapp) >= 10:
             broker_whatsapp = "55" + broker_whatsapp

        print(f"🚀 [DEBUG] Gerando briefing para lead {lead_name}...")
        print(f"🚀 [DEBUG] Destinatário (Corretor): {broker_whatsapp}")
        
        # 1. Gera o briefing inteligente
        briefing = self.generate_lead_briefing(lead_id, context)
        print(f"🚀 [DEBUG] Briefing gerado com sucesso.")
        
        # 2. Salva na tabela de notificações do painel
        self.db.add_broker_notification(user_id, lead_id, briefing)

        # 3. Envia para o WhatsApp do corretor
        final_alert = f"🔥 *LEAD QUENTE QUALIFICADO!* 🔥\n\n{briefing}\n\nEnviando para você agora mesmo. Por favor, responda com *ok* para confirmar que recebeu."
        
        # Log persistente para depuração remota
        try:
            with open("last_notification.json", "w", encoding="utf-8") as f:
                json.dump({
                    "timestamp": datetime.datetime.now().isoformat(),
                    "broker_whatsapp": broker_whatsapp,
                    "lead_id": lead_id,
                    "final_alert": final_alert
                }, f, indent=2, ensure_ascii=False)
        except: pass

        self.send_to_zapi(broker_whatsapp, final_alert)

    def send_to_zapi(self, phone: str, content: str) -> bool:
        instance_id: Optional[str] = os.getenv("ZAPI_INSTANCE_ID") or os.getenv("ID_INSTÂNCIA_ZAPI") or os.getenv("ID_INSTANCIA_ZAPI")
        token: Optional[str] = os.getenv("ZAPI_TOKEN") or os.getenv("ZAPI_TÔKEN")
        if not instance_id or not token:
            print("⚠️ ERRO: ZAPI_INSTANCE_ID ou ZAPI_TOKEN ausentes no ambiente.")
            return False

        client_token: str = os.getenv("ZAPI_CLIENT_TOKEN", "Fda343e96334040afb68f54effe118108S")
        
        url: str = f"https://api.z-api.io/instances/{instance_id}/token/{token}/send-text"
        
        payload: Dict[str, str] = {"phone": phone, "message": content}
        headers: Dict[str, str] = {
            "Content-Type": "application/json",
            "Client-Token": client_token
        }
        
        try:
            response: requests.Response = requests.post(url, json=payload, headers=headers)
            print(f"✅ [Z-API] Resposta para {phone}: {response.status_code} - {response.text}")
            response.raise_for_status()
            return True
        except Exception as e:
            print(f"❌ [Z-API ERROR] Falha ao enviar para {phone}: {e}")
            return False

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
