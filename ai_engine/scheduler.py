from apscheduler.schedulers.background import BackgroundScheduler
import datetime
import pytz
import time
from raquel import RaquelAgent
from database import Database

# Instanciamos o agente e o banco uma única vez
raquel = RaquelAgent()
db = Database()

def is_within_schedule(schedule, now):
    """
    Verifica se o fuso de Brasília (now) está dentro do expediente do corretor
    """
    # Mon=0 -> Mon=1, ..., Sun=6 -> Sun=0 
    db_day_of_week = (now.weekday() + 1) % 7
    
    # Busca a configuração para o dia de hoje
    today_config = next((s for s in schedule if s['day_of_week'] == db_day_of_week), None)
    
    if not today_config or not today_config['is_active']:
        return False
        
    try:
        # Formato esperado "HH:MM:SS" vindo do banco (Postgres time type)
        def parse_time(t_str):
            # Lida com casos de None ou strings vazias
            if not t_str: return None
            return datetime.datetime.strptime(t_str[:5], "%H:%M").time()

        start_time = parse_time(today_config['start_time'])
        end_time = parse_time(today_config['end_time'])
        current_time = now.time()
        
        if not start_time or not end_time:
            return False
            
        return start_time <= current_time <= end_time
    except Exception as e:
        print(f"Erro ao validar horário: {e}")
        return False

def monitor_hot_leads():
    """
    Protocolo de Alerta Quente:
    Se o corretor não confirmar ("ok") em 5 min, envia a segunda notificação.
    """
    print("⏲️ Monitorando confirmações de Leads Quentes...")
    pending_leads = db.find_pending_hot_alerts(minutes=5)
    
    for lead in pending_leads:
        context = db.get_broker_data(lead['user_id'])
        if context:
            context['lead_name'] = lead['name']
            print(f"⚠️ Re-notificando corretor {context['broker_name']} sobre o lead {lead['name']}")
            
            # Segunda notificação conforme o manual
            alert_msg = f"⚠️ *SEGUNDO ALERTA: {lead['name']}*\n\nVocê ainda não confirmou o recebimento deste lead quente nas últimas 5 minutos. O cliente está aguardando!\n\nPor favor, envie 'ok' para confirmar."
            raquel.send_to_zapi(context['broker_whatsapp'], alert_msg)
            
            # Marca como notificado pela segunda vez para não repetir infinitamente
            db.update_lead_status(lead['phone'], "hot_alert_final")

def check_24h_followups():
    """
    Sistema de Follow-up:
    Lead sem resposta após 24 horas entra no fluxo automaticamente.
    """
    print("🔍 Buscando leads para Follow-up de 24h...")
    leads_to_follow = db.find_leads_for_followup(hours=24)
    
    for lead in leads_to_follow:
        print(f"📢 Iniciando Follow-up automático de 24h para {lead['name']}")
        
        # O follow-up usa a inteligência da Raquel para retomar naturalmente
        raquel.process_message(
            lead['phone'], 
            "Oi! Passando para ver se você conseguiu ver as informações que te mandei ontem. Como posso te ajudar a avançar?", 
            lead['name']
        )
        
        # Atualiza para que não receba outro follow-up imediatamente
        db.update_lead_status(lead['phone'], "active")

def check_leads_and_followups():
    """
    Lógica Broker-First estendida:
    Processa leads 'waiting', 'ooh_rescheduled' e 'follow_up_pending'.
    """
    tz = pytz.timezone('America/Sao_Paulo')
    now = datetime.datetime.now(tz)
    
    print(f"[{now}] 🔍 Varredura Broker-First (Novos, Reagendados e Follow-ups)...")
    
    try:
        brokers = db.get_all_brokers()
        
        for broker in brokers:
            user_id = broker['id']
            broker_name = broker['name']
            
            schedule = db.get_broker_schedule(user_id)
            if not schedule:
                if now.hour < 8 or now.hour >= 19: continue
            else:
                if not is_within_schedule(schedule, now): continue

            # Busca leads em estados que permitem início de contato automático
            # waiting: novo lead
            # ooh_rescheduled: falou fora de hora, reagendado
            # follow_up_pending: precisa de retorno (ex: 1 semana após crédito)
            leads = db.supabase.table("leads")\
                .select("*")\
                .eq("user_id", user_id)\
                .in_("status", ["waiting", "ooh_rescheduled", "follow_up_pending"])\
                .execute()
            
            if leads.data:
                for lead in leads.data:
                    msg = "Olá! Recebi seu interesse. Sou a Raquel, assistente do seu corretor. Como posso te ajudar?"
                    if lead['status'] == "ooh_rescheduled":
                        msg = f"Olá {lead['name']}! Como prometido, estou entrando em contato agora que iniciamos nosso expediente. Como posso te ajudar hoje?"
                    
                    raquel.process_message(lead['phone'], msg, lead['name'])
                    db.update_lead_status(lead['phone'], "active")
                    time.sleep(3)

    except Exception as e:
        print(f"Erro na varredura multi-corretor: {e}")

def start_scheduler():
    scheduler = BackgroundScheduler()
    # Varredura de novos leads/reagendados a cada 5 min
    scheduler.add_job(check_leads_and_followups, 'interval', minutes=5)
    # Monitor de alerta quente (puxão de orelha) a cada 2 min
    scheduler.add_job(monitor_hot_leads, 'interval', minutes=2)
    # Follow-up de 24h uma vez por hora
    scheduler.add_job(check_24h_followups, 'interval', hours=1)
    
    scheduler.start()
    print("🚀 Sistema de Agendamento Raquel Super-IA Ativo!")
