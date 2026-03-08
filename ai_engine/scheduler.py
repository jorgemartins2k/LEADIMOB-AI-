from apscheduler.schedulers.background import BackgroundScheduler
import datetime
import pytz
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
            return datetime.datetime.strptime(t_str[:5], "%H:%M").time()

        start_time = parse_time(today_config['start_time'])
        end_time = parse_time(today_config['end_time'])
        current_time = now.time()
        
        return start_time <= current_time <= end_time
    except Exception as e:
        print(f"Erro ao validar horário: {e}")
        return False

def check_leads_and_followups():
    """
    Verifica novos leads respeitando o expediente dinâmico de cada corretor.
    """
    tz = pytz.timezone('America/Sao_Paulo')
    now = datetime.datetime.now(tz)
    
    print(f"[{now}] Iniciando verificação de automação dinâmica...")
    
    try:
        # Busca leads com status 'pending_contact'
        leads = db.supabase.table("leads").select("*").eq("status", "pending_contact").execute()
        
        for lead in leads.data:
            user_id = lead['user_id']
            schedule = db.get_broker_schedule(user_id)
            
            # Se não tiver agenda configurada, assume horário comercial padrão (8-19h)
            if not schedule:
                if now.hour < 8 or now.hour >= 19:
                    print(f"Sem agenda para {user_id}. Fora do padrão (8-19h).")
                    continue
            else:
                if not is_within_schedule(schedule, now):
                    print(f"Lead {lead['name']} pulado: Corretor {user_id} fora do expediente.")
                    continue

            print(f"Iniciando contato com lead {lead['name']} dentro do expediente do corretor.")
            
            raquel.process_message(
                lead['phone'], 
                "Olá! Recebi seu interesse aqui no portal. Sou a Raquel, assistente do seu corretor. Como posso te ajudar hoje?", 
                lead['name']
            )
            
            db.supabase.table("leads").update({"status": "active"}).eq("id", lead['id']).execute()
            
    except Exception as e:
        print(f"Erro na automação dinâmica: {e}")

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(check_leads_and_followups, 'interval', minutes=5)
    scheduler.start()
    print("Relógio de Automação Raquel Iniciado (5 em 5 minutos)")
