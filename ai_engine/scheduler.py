from apscheduler.schedulers.background import BackgroundScheduler
import datetime
import pytz
from raquel import RaquelAgent
from database import Database

# Instanciamos o agente e o banco uma única vez
raquel = RaquelAgent()
db = Database()

def check_leads_and_followups():
    """
    Esta função roda a cada 5 minutos procurando por:
    1. Novos leads cadastrados que precisam de primeiro contato.
    """
    # Definimos o fuso horário de Brasília/São Paulo
    tz = pytz.timezone('America/Sao_Paulo')
    now = datetime.datetime.now(tz)
    current_hour = now.hour
    
    # REGRA DE OURO: Só envia mensagens automáticas entre 08:00 e 20:00
    # Isso evita acordar o cliente de madrugada e garante um tom mais humano.
    if current_hour < 8 or current_hour >= 20:
        print(f"[{now}] Fora do horário comercial (08h-20h). Pulando automações...")
        return

    print(f"[{now}] Dentro do horário comercial. Iniciando verificação de leads...")
    
    try:
        # Busca leads com status 'pending_contact'
        leads = db.supabase.table("leads").select("*").eq("status", "pending_contact").execute()
        
        for lead in leads.data:
            print(f"Iniciando contato com novo lead: {lead['name']}")
            
            # Raquel processa a primeira mensagem estrategicamente
            raquel.process_message(
                lead['phone'], 
                "Olá! Recebi seu interesse aqui no portal. Sou a Raquel, assistente do seu corretor. Como posso te ajudar hoje?", 
                lead['name']
            )
            
            # Atualiza o status para 'active' para não repetir o contato
            db.supabase.table("leads").update({"status": "active"}).eq("id", lead['id']).execute()
            
    except Exception as e:
        print(f"Erro na automação de 5 minutos: {e}")

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(check_leads_and_followups, 'interval', minutes=5)
    scheduler.start()
    print("Relógio de Automação Raquel Iniciado (5 em 5 minutos)")
