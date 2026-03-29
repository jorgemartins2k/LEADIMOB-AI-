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
                "transferred_at": "now()"
            }).eq("id", lead_id).execute()

async def check_24h_followups() -> None:
    """
    Sistema de Follow-up:
    Lead sem resposta após 24 horas entra no fluxo automaticamente.
    """
    print("🔍 Buscando leads para Follow-up de 24h...")
    leads_to_follow = db.find_leads_for_followup(hours=24)
    
    for lead in leads_to_follow:
        lead_name: str = str(lead.get('name', 'Cliente'))
        lead_phone: str = str(lead.get('phone', ''))
        
        print(f"📢 Iniciando Follow-up automático de 24h para {lead_name}")
        
        # O follow-up usa a inteligência da Raquel para retomar naturalmente
        await raquel.process_message(
            lead_phone, 
            "Oi! Passando para ver se você conseguiu ver as informações que te mandei ontem. Como posso te ajudar a avançar?", 
            lead_name
        )
        
        # Atualiza para que não receba outro follow-up imediatamente
        db.update_lead_status(lead_phone, "active")

async def check_leads_and_followups() -> None:
    """
    Lógica Broker-First estendida:
    Processa leads 'waiting', 'ooh_rescheduled' e 'follow_up_pending'.
    """
    tz: datetime.tzinfo = pytz.timezone('America/Sao_Paulo')
    now: datetime.datetime = datetime.datetime.now(tz)
    
    print(f"[{now}] 🔍 Varredura Broker-First (Novos, Reagendados e Follow-ups)...")
    
    try:
        brokers = db.get_all_brokers()
        
        for broker in brokers:
            try:
                user_id: str = str(broker.get('id', ''))
                broker_name: str = str(broker.get('name', 'Corretor'))
                
                schedule = db.get_broker_schedule(user_id)
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
                        context = db.get_broker_data(user_id)
                        if context:
                            context['lead_name'] = str(lead.get('name', 'Cliente'))
                            history = db.get_chat_history(lead_phone, limit=1)
                            last_msg = str(history[0].get('content', '')) if history else "Novo interesse gerado fora de horário."
                            last_msg = last_msg.replace("[ALERT_BROKER]", "").strip()
                            
                            print(f"⏰ Disparando alerta OOH pendente para o corretor {broker_name}")
                            raquel.alert_broker(context, last_msg)
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
                            
                            msg: str = "Olá! Recebi seu interesse. Sou a Raquel, assistente do seu corretor. Como posso te ajudar?"
                            if lead_status == "ooh_rescheduled":
                                msg = f"Olá {lead_name}! Como prometido, estou entrando em contato agora que iniciamos nosso expediente. Como posso te ajudar hoje?"
                            
                            # raquel.process_message retorna a resposta enviada ou um erro
                            result = await raquel.process_message(lead_phone, msg, lead_name)
                            
                            # Se o processamento falhou (ex: lead não encontrado), não marcamos como ativo
                            if "não encontrado" in result.lower():
                                print(f"⚠️ [AVISO] Falha ao contatar lead {lead_id}: {result}")
                                continue

                            db.update_lead_status(lead_phone, "active")
                            await asyncio.sleep(3) # Delay entre leads para evitar spam/bloqueios
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
    scheduler.add_job(check_leads_and_followups, 'interval', minutes=5)
    scheduler.add_job(monitor_hot_leads, 'interval', minutes=2)
    scheduler.add_job(check_24h_followups, 'interval', hours=1)
    scheduler.add_job(daily_end_of_shift_cleanup, 'interval', minutes=5)
    
    scheduler.start()
    print("🚀 Sistema de Agendamento Raquel Super-IA Ativo!")
