from apscheduler.schedulers.background import BackgroundScheduler
import datetime
from raquel import RaquelAgent
from database import Database

# Instanciamos o agente e o banco uma única vez
raquel = RaquelAgent()
db = Database()

def check_leads_and_followups():
    """
    Esta função roda a cada 5 minutos procurando por:
    1. Novos leads cadastrados que precisam de primeiro contato.
    2. Leads que precisam de follow-up (24h sem resposta).
    """
    now = datetime.datetime.now()
    print(f"[{now}] Iniciando verificação de automação...")
    
    # 1. Busca leads que precisam de primeiro contato (exemplo de status 'new')
    # Nota: No seu banco, você pode usar uma flag 'needs_contact' ou o status do lead
    try:
        # Exemplo: busca leads do dia que ainda não tiveram interação da IA
        # Esta lógica será refinada conforme os campos específicos do seu banco
        leads = db.supabase.table("leads").select("*").eq("status", "pending_contact").execute()
        
        for lead in leads.data:
            print(f"Iniciando contato com novo lead: {lead['name']}")
            raquel.process_message(lead['phone'], "Olá! Vi que você tem interesse em um de nossos imóveis. Como posso te ajudar?", lead['name'])
            # Atualiza o status para ativo
            db.supabase.table("leads").update({"status": "active"}).eq("id", lead['id']).execute()
            
    except Exception as e:
        print(f"Erro na automação de 5 minutos: {e}")

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(check_leads_and_followups, 'interval', minutes=5)
    scheduler.start()
    print("Relógio de Automação Raquel Iniciado (5 em 5 minutos)")
