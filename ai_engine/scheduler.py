from typing import List, Dict, Any, Optional
from apscheduler.schedulers.background import BackgroundScheduler # pyre-ignore
import datetime
import pytz # pyre-ignore
import time
from raquel import RaquelAgent
from database import Database

# Instanciamos o agente e o banco uma única vez
raquel: RaquelAgent = RaquelAgent()
db: Database = Database()

def is_within_schedule(schedule: List[Dict[str, Any]], now: datetime.datetime) -> bool:
    """
    Verifica se o fuso de Brasília (now) está dentro do expediente do corretor
    """
    # Mon=0 -> Mon=1, ..., Sun=6 -> Sun=0 
    db_day_of_week: int = (now.weekday() + 1) % 7
    
    # Busca a configuração para o dia de hoje
    today_config: Optional[Dict[str, Any]] = next((s for s in schedule if s.get('day_of_week') == db_day_of_week), None)
    
    if not today_config or not today_config.get('is_active'):
        return False
        
    try:
        # Formato esperado "HH:MM:SS" vindo do banco (Postgres time type)
        def parse_time(t_str: Optional[str]) -> Optional[datetime.time]:
            # Lida com casos de None ou strings vazias
            if not t_str: return None
            return datetime.datetime.strptime(str(t_str)[:5], "%H:%M").time()

        start_time: Optional[datetime.time] = parse_time(today_config.get('start_time'))
        end_time: Optional[datetime.time] = parse_time(today_config.get('end_time'))
        current_time: datetime.time = now.time()
        
        if not start_time or not end_time:
            return False
            
        return start_time <= current_time <= end_time
    except Exception as e:
        print(f"Erro ao validar horário: {e}")
        return False

def monitor_hot_leads() -> None:
    """
    Protocolo de Alerta Quente:
    Se o corretor não confirmar ("ok") em 5 min, envia a segunda notificação.
    """
    print("⏲️ Monitorando confirmações de Leads Quentes...")
    pending_leads: List[Dict[str, Any]] = db.find_pending_hot_alerts(minutes=5)
    
    for lead in pending_leads:
        user_id: str = str(lead.get('user_id', ''))
        context: Optional[Dict[str, Any]] = db.get_broker_data(user_id)
        if context:
            context['lead_name'] = lead.get('name', 'Cliente')
            broker_name: str = context.get('broker_name', 'Corretor')
            lead_name: str = str(lead.get('name', 'Cliente'))
            broker_whatsapp: str = context.get('broker_whatsapp', '')
            
            print(f"⚠️ Re-notificando corretor {broker_name} sobre o lead {lead_name}")
            
            # Segunda notificação conforme o manual
            alert_msg: str = f"⚠️ *SEGUNDO ALERTA: {lead_name}*\n\nVocê ainda não confirmou o recebimento deste lead quente nas últimas 5 minutos. O cliente está aguardando!\n\nPor favor, envie 'ok' para confirmar."
            raquel.send_to_zapi(broker_whatsapp, alert_msg)
            
            # Marca como notificado pela segunda vez para não repetir infinitamente
            db.update_lead_status(str(lead.get('phone', '')), "hot_alert_final")

def check_24h_followups() -> None:
    """
    Sistema de Follow-up:
    Lead sem resposta após 24 horas entra no fluxo automaticamente.
    """
    print("🔍 Buscando leads para Follow-up de 24h...")
    leads_to_follow: List[Dict[str, Any]] = db.find_leads_for_followup(hours=24)
    
    for lead in leads_to_follow:
        lead_name: str = str(lead.get('name', 'Cliente'))
        lead_phone: str = str(lead.get('phone', ''))
        
        print(f"📢 Iniciando Follow-up automático de 24h para {lead_name}")
        
        # O follow-up usa a inteligência da Raquel para retomar naturalmente
        raquel.process_message(
            lead_phone, 
            "Oi! Passando para ver se você conseguiu ver as informações que te mandei ontem. Como posso te ajudar a avançar?", 
            lead_name
        )
        
        # Atualiza para que não receba outro follow-up imediatamente
        db.update_lead_status(lead_phone, "active")

def check_leads_and_followups() -> None:
    """
    Lógica Broker-First estendida:
    Processa leads 'waiting', 'ooh_rescheduled' e 'follow_up_pending'.
    """
    tz: datetime.tzinfo = pytz.timezone('America/Sao_Paulo')
    now: datetime.datetime = datetime.datetime.now(tz)
    
    print(f"[{now}] 🔍 Varredura Broker-First (Novos, Reagendados e Follow-ups)...")
    
    try:
        brokers: List[Dict[str, Any]] = db.get_all_brokers()
        
        for broker in brokers:
            user_id: str = str(broker.get('id', ''))
            broker_name: str = str(broker.get('name', 'Corretor'))
            
            schedule: List[Dict[str, Any]] = db.get_broker_schedule(user_id)
            if not schedule:
                if now.hour < 8 or now.hour >= 19: continue
            else:
                if not is_within_schedule(schedule, now): continue

            # Busca leads em estados que permitem início de contato automático
            response = db.supabase.table("leads")\
                .select("*")\
                .eq("user_id", user_id)\
                .in_("status", ["waiting", "ooh_rescheduled", "follow_up_pending"])\
                .execute()
            
            leads_data: List[Dict[str, Any]] = response.data if response.data else []
            
            if leads_data:
                for lead in leads_data:
                    lead_name: str = str(lead.get('name', 'Cliente'))
                    lead_phone: str = str(lead.get('phone', ''))
                    lead_status: str = str(lead.get('status', 'waiting'))
                    
                    msg: str = "Olá! Recebi seu interesse. Sou a Raquel, assistente do seu corretor. Como posso te ajudar?"
                    if lead_status == "ooh_rescheduled":
                        msg = f"Olá {lead_name}! Como prometido, estou entrando em contato agora que iniciamos nosso expediente. Como posso te ajudar hoje?"
                    
                    raquel.process_message(lead_phone, msg, lead_name)
                    db.update_lead_status(lead_phone, "active")
                    time.sleep(3)

    except Exception as e:
        print(f"Erro na varredura multi-corretor: {e}")

def start_scheduler() -> None:
    scheduler = BackgroundScheduler()
    scheduler.add_job(check_leads_and_followups, 'interval', minutes=5)
    scheduler.add_job(monitor_hot_leads, 'interval', minutes=2)
    scheduler.add_job(check_24h_followups, 'interval', hours=1)
    
    scheduler.start()
    print("🚀 Sistema de Agendamento Raquel Super-IA Ativo!")
