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

def check_leads_and_followups():
    """
    Lógica Broker-First:
    1. Percorre todos os corretores.
    2. Verifica se o fuso de Brasília está no expediente dele.
    3. Só então busca e processa os leads 'waiting' desse corretor.
    """
    tz = pytz.timezone('America/Sao_Paulo')
    now = datetime.datetime.now(tz)
    
    print(f"[{now}] 🔍 Iniciando Varredura Multi-Corretor (Broker-First)...")
    
    try:
        # 1. Busca todos os corretores
        brokers = db.get_all_brokers()
        
        for broker in brokers:
            user_id = broker['id']
            broker_name = broker['name']
            
            # 2. Verifica expediente do corretor
            schedule = db.get_broker_schedule(user_id)
            
            # Fallback se não tiver agenda (08h-19h)
            if not schedule:
                if now.hour < 8 or now.hour >= 19:
                    continue
            else:
                if not is_within_schedule(schedule, now):
                    # print(f"Broker {broker_name} fora do expediente.")
                    continue

            # 3. Se estiver no expediente, busca leads 'waiting' DESTE corretor
            leads = db.supabase.table("leads")\
                .select("*")\
                .eq("user_id", user_id)\
                .eq("status", "waiting")\
                .execute()
            
            if leads.data:
                print(f"[{now}] ⚡ Processando {len(leads.data)} leads para o Corretor: {broker_name}")
                
                for lead in leads.data:
                    # Inicia contato automático
                    raquel.process_message(
                        lead['phone'], 
                        "Olá! Recebi seu interesse no portal. Sou a Raquel, assistente do seu corretor. Como posso te ajudar hoje?", 
                        lead['name']
                    )
                    
                    # Atualiza o status para 'active'
                    db.supabase.table("leads").update({"status": "active"}).eq("id", lead['id']).execute()
                    
                    # Segurança & Antispam: Delay de 3 segundos entre mensagens do mesmo corretor
                    time.sleep(3)

    except Exception as e:
        print(f"Erro na varredura multi-corretor: {e}")

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(check_leads_and_followups, 'interval', minutes=5)
    scheduler.start()
    print("Relógio de Automação Raquel Iniciado (5 em 5 minutos)")
