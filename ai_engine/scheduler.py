from typing import List, Dict, Any, Optional, Union
from apscheduler.schedulers.asyncio import AsyncIOScheduler # pyre-ignore
import asyncio
import datetime
import pytz # pyre-ignore
import time
import random
import json
from raquel import RaquelAgent # pyre-ignore
from database import Database # pyre-ignore

# Instanciamos o agente e o banco uma única vez
raquel = RaquelAgent() # pyre-ignore
db = Database() # pyre-ignore

def is_within_schedule(schedule: List[Dict[str, Any]], now: datetime.datetime) -> bool:
    """
    Verifica se o fuso de Brasília (now) está dentro do expediente do corretor
    """
    # Mon=0 -> Mon=1, ..., Sun=6 -> Sun=0 
    db_day_of_week: int = (now.weekday() + 1) % 7
    
    # Busca a confiuração para o dia de hoje
    today_config: Optional[Dict[str, Any]] = None
    for s in schedule:
        if s.get('day_of_week') == db_day_of_week:
            today_config = s
            break
    
    if not isinstance(today_config, dict):
        return False
        
    if not today_config.get('is_active'):
        return False
    
    # Garantimos que config é um dicionário para o linter
    config: Dict[str, Any] = today_config
        
    try:
        # Formato esperado "HH:MM:SS" vindo do banco (Postgres time type)
        def parse_time(t_str: Optional[str]) -> Optional[datetime.time]:
            # Lida com casos de None ou strings vazias
            if not t_str: return None
            t_val: str = str(t_str)
            
            # Divide usando string methods em vez de slice devido a um bug no Pyre com slices em certas versões
            parts = t_val.split(":")
            formatted_time = f"{parts[0]}:{parts[1]}" if len(parts) >= 2 else t_val
            
            return datetime.datetime.strptime(formatted_time, "%H:%M").time()

        start_time_val = config.get('start_time')
        end_time_val = config.get('end_time')
        start_time: Optional[datetime.time] = parse_time(str(start_time_val) if start_time_val else None)
        end_time: Optional[datetime.time] = parse_time(str(end_time_val) if end_time_val else None)
        current_time: datetime.time = now.time()
        
        if start_time is None:
            return False
        if end_time is None:
            return False
            
        return start_time <= current_time <= end_time
    except Exception as e:
        print(f"Erro ao validar horário: {e}")
        return False

async def monitor_hot_leads() -> None:
    """
    Protocolo de Alerta Quente:
    Se o corretor não confirmar em 5 min, repete a notificação com o briefing.
    """
    print("⏲️ Monitorando confirmações de Leads Quentes...")
    pending_leads = db.find_pending_hot_alerts(minutes=5)
    
    for lead in pending_leads:
        user_id: str = str(lead.get('user_id', ''))
        lead_id: str = str(lead.get('id', ''))
        lead_phone: str = str(lead.get('phone', ''))
        
        context = db.get_broker_data(user_id)
        if context:
            context['lead_name'] = lead.get('name', 'Cliente')
            context['lead_id'] = lead_id
            context['phone'] = lead_phone
            
            broker_name: str = context.get('broker_name', 'Corretor')
            broker_whatsapp: str = context.get('broker_whatsapp', '')
            
            print(f"⚠️ Re-notificando corretor {broker_name} sobre o lead {context['lead_name']}")
            
            # Busca a última notificação (briefing) salva para este lead
            notif_resp = db.supabase.table("broker_notifications")\
                .select("message")\
                .eq("lead_id", lead_id)\
                .order("created_at", desc=True)\
                .limit(1).execute()
            
            briefing = notif_resp.data[0]['message'] if notif_resp.data else "Lead aguardando sua atenção!"
            
            alert_msg: str = f"⚠️ *LEMBRETE: LEAD QUENTE AGUARDANDO!* ⚠️\n\n{briefing}\n\nO cliente ainda não foi atendido. Por favor, envie *ok* para confirmar que assumiu."
            raquel.send_to_zapi(broker_whatsapp, alert_msg)
            
            # Atualiza o timestamp de transferência para contar mais 5 minutos até a próxima repetição
            db.supabase.table("leads").update({
                "status": "hot_alert_retry",
                "transferred_at": now.isoformat()
            }).eq("id", lead_id).execute()

def parse_iso_robust(date_str: str, tz: datetime.tzinfo) -> Optional[datetime.datetime]:
    """
    Parses ISO 8601 strings robustly, handling microsecond variations 
    (like .0 or .05) that can fail in some Python versions of fromisoformat.
    """
    if not date_str:
        return None
    
    # Normalize Z to +00:00
    date_str = date_str.replace("Z", "+00:00")
    
    try:
        # Try direct parsing first
        return datetime.datetime.fromisoformat(date_str).astimezone(tz)
    except ValueError:
        try:
            # Handle cases with non-standard microsecond lengths (fromisoformat expects 0, 3, or 6 digits)
            if "." in date_str:
                if "+" in date_str:
                    base, offset = date_str.split("+", 1)
                    offset = "+" + offset
                elif "-" in date_str.split("T")[1]:
                    # Find the last minus sign (presumed to be the timezone offset)
                    parts = date_str.rsplit("-", 1)
                    base, offset = parts[0], "-" + parts[1]
                else:
                    base, offset = date_str, ""

                if "." in base:
                    main, fraction = base.split(".", 1)
                    # Pad fraction to 6 digits for consistency
                    fraction = (fraction + "000000")[:6]
                    date_str = f"{main}.{fraction}{offset}"
            
            return datetime.datetime.fromisoformat(date_str).astimezone(tz)
        except Exception:
            # Final fallback: strip micro and offset for basic parsing
            try:
                clean_date = date_str.split(".")[0].split("+")[0].split("-")[0] if "T" in date_str else date_str
                return datetime.datetime.strptime(clean_date[:19], "%Y-%m-%dT%H:%M:%S").replace(tzinfo=pytz.UTC).astimezone(tz)
            except Exception:
                return None

async def process_smart_followups() -> None:
    """
    Sistema Inteligente de Follow-up (Tipos 1, 2 e 3)
    Executado a cada 5 minutos.
    """
    from datetime import datetime, timezone, timedelta
    tz = pytz.timezone('America/Sao_Paulo')
    now = datetime.now(tz)
    
    print(f"[{now.strftime('%H:%M:%S')}] 🧠 Processando Smart Follow-ups...")
    
    # Cache para evitar N+1 queries de expediente
    broker_schedules_cache: Dict[str, Any] = {}

    # ---------------------------------------------------------
    # TYPE 3: Agendamentos Exatos (status = 'scheduled')
    # ---------------------------------------------------------
    scheduled_resp = db.supabase.table("leads").select("*").eq("status", "scheduled").lte("next_follow_up_at", now.isoformat()).execute()
    scheduled_leads = scheduled_resp.data if scheduled_resp.data else []
    
    for lead in scheduled_leads:
        lead_id: str = str(lead.get('id', ''))
        lead_name: str = str(lead.get('name', 'Cliente'))
        lead_phone: str = str(lead.get('phone', ''))
        user_id: str = str(lead.get('user_id', ''))
        
        # 🛡️ PONTO DE VERIFICAÇÃO OBRIGATÓRIO (GUARDRAIL)
        # Consultamos o status MAIS ATUALIZADO antes de disparar
        fresh_lead = db.supabase.table("leads").select("status").eq("id", lead_id).execute()
        current_status = fresh_lead.data[0].get('status') if fresh_lead.data else 'scheduled'
        
        blocked_statuses = ["completed", "transferred", "opt_out", "finalizado", "sem_interesse"]
        if current_status in blocked_statuses:
            print(f"🛡️ Follow-up Type 3 cancelado para {lead_name}: Status atual é '{current_status}'.")
            continue

        print(f"⏰ Executando Follow-up Agendado (Type 3) para {lead_name}")
        msg = f"Olá {lead_name}! Conforme combinamos, estou retornando o contato. Como posso te ajudar agora?"
        
        success = raquel.send_to_zapi(lead_phone, msg)
        if success:
            db.save_message(lead_id, user_id, "assistant", msg)
            db.update_lead_status(lead_phone, "active") # Reseta follow_up_count para 0

    # ---------------------------------------------------------
    # TYPE 1 & 2: Leads Ativos sem resposta (status = 'active')
    # ---------------------------------------------------------
    # Busca leads ativos há pelo menos 3 horas (limite mínimo para o Type 2)
    threshold_3h = (now - timedelta(hours=3)).isoformat()
    active_resp = db.supabase.table("leads").select("*").eq("status", "active").lt("updated_at", threshold_3h).execute()
    active_leads = active_resp.data if active_resp.data else []
    
    for lead in active_leads:
        lead_id: str = str(lead.get('id', ''))
        lead_name: str = str(lead.get('name', 'Cliente'))
        lead_phone: str = str(lead.get('phone', ''))
        user_id: str = str(lead.get('user_id', ''))
        
        # 🛡️ PONTO DE VERIFICAÇÃO OBRIGATÓRIO (GUARDRAIL)
        fresh_lead = db.supabase.table("leads").select("status").eq("id", lead_id).execute()
        current_status = fresh_lead.data[0].get('status') if fresh_lead.data else 'active'
        blocked_statuses = ["completed", "transferred", "opt_out", "finalizado", "sem_interesse"]
        
        if current_status in blocked_statuses:
            print(f"🛡️ Follow-up Auto cancelado para {lead_name}: Status atual é '{current_status}'.")
            continue

        follow_up_count: int = lead.get('follow_up_count') or 0
        updated_at_str: str = lead.get('updated_at', '')
        
        # Ignora se não houver updated_at
        if not updated_at_str: continue
            
        updated_at = parse_iso_robust(updated_at_str, tz)
        if not updated_at: continue
        hours_passed = (now - updated_at).total_seconds() / 3600.0

        # Verifica expediente do corretor (USANDO CACHE)
        if user_id not in broker_schedules_cache:
            broker_schedules_cache[user_id] = db.get_broker_schedule(user_id)
        
        schedule = broker_schedules_cache[user_id]
        if schedule:
            schedule_list = schedule if isinstance(schedule, list) else []
            if not is_within_schedule(schedule_list, now):
                continue # Fora do expediente, tenta na próxima varredura
        else:
            if now.hour < 8 or now.hour >= 19:
                continue

        # Acessa o histórico para descobrir se é Type 1 ou Type 2
        history = db.get_chat_history(lead_id, limit=50)
        user_replied_before = any(msg.get('role') == 'user' for msg in history)
        
        # TYPE 1: Cliente nunca respondeu (espera 24h por tentativa, máximo 2)
        if not user_replied_before:
            if hours_passed >= 24:
                if follow_up_count == 0:
                    print(f"📢 Follow-up D1 (Type 1) para {lead_name}")
                    msg = f"Oi {lead_name}, tudo bem? Passo por aqui apenas para reforçar meu contato. Quando tiver um tempinho, me avise se podemos conversar!"
                    if raquel.send_to_zapi(lead_phone, msg):
                        db.save_message(lead_id, user_id, "assistant", msg)
                        db.supabase.table("leads").update({"follow_up_count": 1, "updated_at": now.isoformat()}).eq("id", lead_id).execute()
                elif follow_up_count == 1:
                    print(f"📢 Follow-up D2 (Type 1) para {lead_name}")
                    msg = "Olá! Como não tive retorno, imagino que esteja ocupado. Qualquer coisa estou à disposição por aqui. Um abraço!"
                    if raquel.send_to_zapi(lead_phone, msg):
                        db.save_message(lead_id, user_id, "assistant", msg)
                        db.supabase.table("leads").update({"follow_up_count": 2, "updated_at": now.isoformat()}).eq("id", lead_id).execute()
                elif follow_up_count >= 2:
                    print(f"🗑️ Lead {lead_name} abandonado por falta de resposta (Type 1).")
                    db.supabase.table("leads").update({"status": "abandoned_no_reply"}).eq("id", lead_id).execute()
                    
        # TYPE 2: Cliente parou no meio da conversa (espera 3h, depois 24h, máximo 2)
        else:
            if follow_up_count == 0 and hours_passed >= 3:
                # Regra: se passar das 22h, joga para o próximo dia (isso já é garantido pelo is_within_schedule e now.hour < 22)
                if now.hour >= 22:
                    continue # Espera até amanhã de manhã
                    
                print(f"📢 Follow-up 3h (Type 2) para {lead_name}")
                msg = f"{lead_name}, ainda está por aí? Se preferir, podemos continuar mais tarde."
                if raquel.send_to_zapi(lead_phone, msg):
                    db.save_message(lead_id, user_id, "assistant", msg)
                    db.supabase.table("leads").update({"follow_up_count": 1, "updated_at": now.isoformat()}).eq("id", lead_id).execute()
                    
            elif follow_up_count == 1 and hours_passed >= 24:
                print(f"📢 Follow-up D1 (Type 2) para {lead_name}")
                msg = "Oi! Acabamos nos desencontrando ontem. Tem um minutinho para continuarmos?"
                if raquel.send_to_zapi(lead_phone, msg):
                    db.save_message(lead_id, user_id, "assistant", msg)
                    db.supabase.table("leads").update({"follow_up_count": 2, "updated_at": now.isoformat()}).eq("id", lead_id).execute()
                    
            elif follow_up_count >= 2 and hours_passed >= 24:
                print(f"🗑️ Lead {lead_name} abandonado após pausa na conversa (Type 2).")
                db.supabase.table("leads").update({"status": "abandoned_dropout"}).eq("id", lead_id).execute()

async def check_leads_and_followups() -> None:
    """
    Lógica Broker-First estendida:
    Processa leads 'waiting', 'ooh_rescheduled' e 'follow_up_pending'.
    """
    tz: datetime.tzinfo = pytz.timezone('America/Sao_Paulo')
    now: datetime.datetime = datetime.datetime.now(tz)
    
    print(f"[{now}] 🔍 [HEARTBEAT] Iniciando Varredura Multi-Corretor...", flush=True)
    
    # Caches locais para evitar N+1
    broker_schedules_cache: Dict[str, Any] = {}
    broker_data_cache: Dict[str, Any] = {}

    try:
        brokers = db.get_all_brokers()
        print(f"🕵️ [SCHEDULER] Verificando {len(brokers)} corretores...")
        
        for broker in brokers:
            try:
                user_id: str = str(broker.get('id', ''))
                broker_name: str = str(broker.get('name', 'Corretor'))
                
                if user_id not in broker_schedules_cache:
                    broker_schedules_cache[user_id] = db.get_broker_schedule(user_id)
                
                schedule = broker_schedules_cache[user_id]
                if not schedule:
                    # Default: 08:00 - 19:00 if no schedule set
                    if now.hour < 8 or now.hour >= 19: 
                        print(f"💤 {broker_name} fora do horário padrão (8-19h).")
                        continue
                else:
                    schedule_list: List[Dict[str, Any]] = schedule if isinstance(schedule, list) else []
                    if not is_within_schedule(schedule_list, now):
                        print(f"💤 {broker_name} fora do expediente configurado.")
                        continue

                # -------------- Lógica de Alertas Pendentes (OOH) ----------------
                ooh_hot_resp = db.supabase.table("leads").select("*").eq("user_id", user_id).eq("status", "ooh_hot_alert_pending").execute()
                ooh_hot_leads = ooh_hot_resp.data if hasattr(ooh_hot_resp, 'data') and ooh_hot_resp.data else []
                
                for lead in ooh_hot_leads:
                    try:
                        lead_phone = str(lead.get('phone', ''))
                        lead_id = str(lead.get('id', ''))
                        
                        if user_id not in broker_data_cache:
                            broker_data_cache[user_id] = db.get_broker_data(user_id)
                        
                        context = broker_data_cache[user_id]
                        if context:
                            # Fazemos uma cópia para não poluir o cache com dados de um lead específico
                            lead_context = context.copy()
                            lead_context['lead_name'] = str(lead.get('name', 'Cliente'))
                            lead_context['lead_id'] = lead_id # Essencial para o briefing
                            lead_context['lead_phone'] = lead_phone
                            
                            history = db.get_chat_history(lead_id, limit=1)
                            last_msg = str(history[0].get('content', '')) if history else "Novo interesse gerado fora de horário."
                            last_msg = last_msg.replace("[ALERT_BROKER]", "").strip()
                            
                            print(f"⏰ Disparando alerta OOH pendente para o corretor {broker_name} (Lead ID: {lead_id})")
                            raquel.alert_broker(lead_context, last_msg)
                            
                            db.update_lead_status(lead_phone, "hot_alert_sent")
                            db.set_lead_transfer_time(lead_phone)
                            await asyncio.sleep(2)
                    except Exception as e_ooh:
                        print(f"❌ Erro ao processar lead OOH {lead.get('id')}: {e_ooh}")
                # ---------------------------------------------------------------

                # Busca leads em estados que permitem início de contato automático
                response = db.supabase.table("leads")\
                    .select("*")\
                    .eq("user_id", user_id)\
                    .in_("status", ["waiting", "ooh_rescheduled", "follow_up_pending"])\
                    .execute()
                
                leads_data = response.data if hasattr(response, 'data') and response.data else []
                
                if leads_data:
                    for lead in leads_data:
                        try:
                            lead_name: str = str(lead.get('name', 'Cliente'))
                            lead_id: str = str(lead.get('id', ''))
                            lead_phone: str = str(lead.get('phone', ''))
                            lead_status: str = str(lead.get('status', 'waiting'))
                            
                            print(f"📢 Contatando lead {lead_name} ({lead_phone}) para o corretor {broker_name}")
                            
                            # Recupera dados do corretor para a mensagem (USANDO CACHE)
                            if user_id not in broker_data_cache:
                                broker_data_cache[user_id] = db.get_broker_data(user_id)
                            
                            broker_data = broker_data_cache[user_id]
                            broker_agency = broker_data.get('broker_agency', 'Imobiliária') if broker_data else 'Imobiliária'
                            broker_city = broker_data.get('broker_city', '') if broker_data else ''
                            broker_metro = broker_data.get('broker_metropolitan_regions', '') if broker_data else ''
                            
                            area_text = f"da cidade de {broker_city}" if broker_city else ""
                            if broker_city and broker_metro:
                                area_text += " e região"
                            
                            greeting = f"Olá {lead_name}, aqui é a Raquel, assistente do corretor imobiliário {broker_name} da empresa {broker_agency}"
                            if area_text:
                                greeting += f", {area_text}"
                                
                            msg: str = f"{greeting}. Seria um bom momento para conversarmos?"
                            
                            if lead_status == "ooh_rescheduled":
                                msg = f"{greeting}. Como prometido, estou entrando em contato agora que iniciamos nosso expediente. Seria um bom momento para conversarmos?"
                            
                            # 1. Envia o cumprimento inicial diretamente (sem disparar a "IA respondendo a IA")
                            success = raquel.send_to_zapi(lead_phone, msg)
                            
                            if success:
                                # 2. Registra no histórico como se fosse a Raquel falando
                                db.save_message(lead_id, user_id, "assistant", msg)
                                # 3. Ativa o lead para começar a responder via Webhook
                                db.update_lead_status(lead_phone, "active")
                                print(f"✅ Lead {lead_name} contatado com sucesso e status alterado para 'active'.")
                                await asyncio.sleep(2) # Pequeno delay antes de iniciar a contagem longa
                            else:
                                print(f"⚠️ Falha ao enviar WhatsApp para {lead_name}. Mantendo em espera.")
                            
                            print(f"⏳ Aguardando 90 segundos antes do próximo lead para evitar bloqueios de SPAM...")
                            await asyncio.sleep(90) # Delay de 1.5 minutos sugerido para evitar ban
                        except Exception as e_lead:
                            print(f"❌ Erro ao processar lead individual {lead.get('id')}: {e_lead}")
            except Exception as e_broker:
                print(f"❌ Erro crítico ao processar corretor {broker.get('id')}: {e_broker}")

    except Exception as e:
        print(f"❌ Erro fatal na varredura multi-corretor: {e}")

async def daily_end_of_shift_cleanup() -> None:
    """
    Limpa leads do dia que ficaram ociosos (status 'waiting') exatamente no final do expediente,
    liberando a dashboard para o corretor cadastrar os leads do dia seguinte.
    """
    tz: datetime.tzinfo = pytz.timezone('America/Sao_Paulo')
    now: datetime.datetime = datetime.datetime.now(tz)
    
    try:
        brokers = db.get_all_brokers()
        for broker in brokers:
            user_id: str = str(broker.get('id', ''))
            schedule = db.get_broker_schedule(user_id)
            if not schedule: continue
            
            schedule_list = schedule if isinstance(schedule, list) else []
            db_day_of_week: int = (now.weekday() + 1) % 7
            
            today_config: Optional[Dict[str, Any]] = None
            for s in schedule_list:
                if s.get('day_of_week') == db_day_of_week:
                    today_config = s
                    break
                    
            if not isinstance(today_config, dict):
                continue
            if not today_config.get('is_active'):
                continue
                
            end_time_str = str(today_config.get('end_time', ''))
            if not end_time_str: continue
            
            e_parts = end_time_str.split(":")
            if len(e_parts) >= 2 and e_parts[0].isdigit() and e_parts[1].isdigit():
                e_hour = int(e_parts[0])
                e_min = int(e_parts[1])
                
                shift_end = now.replace(hour=e_hour, minute=e_min, second=0, microsecond=0)
                time_diff = (now - shift_end).total_seconds()
                
                # Se passou de 0 a 5 minutos do fim do expediente (o job roda a cada 5 mins)
                if 0 <= time_diff < 300:
                    print(f"🧹 Expediente ENCERRADO para {broker.get('name', 'Corretor')}. Fila de leads preservada para o próximo turno.")
                    # db.supabase.table("leads").delete().eq("user_id", user_id).eq("status", "waiting").execute()
                    
    except Exception as e:
        print(f"Erro no cleanup auto: {e}")

def start_scheduler() -> None:
    scheduler = AsyncIOScheduler()
    
    # 1. Varredura Broker-First (Novos Leads, Reagendamento OOH e Follow-ups Básicos)
    scheduler.add_job(check_leads_and_followups, 'interval', minutes=5)
    
    # 2. Monitoramento de Leads Quentes (Alertas ao Corretor)
    scheduler.add_job(monitor_hot_leads, 'interval', minutes=2)
    
    # 3. Follow-up Inteligente (Tipos 1, 2 e 3)
    scheduler.add_job(process_smart_followups, 'interval', minutes=5)
    
    # 4. Limpeza de Turno
    scheduler.add_job(daily_end_of_shift_cleanup, 'interval', minutes=5)
    
    scheduler.start()
    
    # Executa uma varredura imediata em background para depuração
    print("🚀 [SCHEDULER] Sistema de Agendamento Raquel Super-IA Ativo!", flush=True)
    print("📢 [SCHEDULER] Iniciando varredura imediata de teste...", flush=True)
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(check_leads_and_followups())
            asyncio.create_task(process_smart_followups())
        else:
            loop.run_until_complete(check_leads_and_followups())
            loop.run_until_complete(process_smart_followups())
    except Exception as e:
        print(f"❌ [SCHEDULER] Erro na varredura inicial: {e}")
