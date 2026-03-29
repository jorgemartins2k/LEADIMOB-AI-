import asyncio
import datetime
import pytz
import os
from scheduler import check_leads_and_followups, is_within_schedule
from database import Database
from raquel import RaquelAgent
from dotenv import load_dotenv

load_dotenv()

async def debug_run():
    print("🕵️ INICIANDO DEPURAÇÃO DO AGENDADOR...")
    db = Database()
    raquel = RaquelAgent()
    
    tz = pytz.timezone('America/Sao_Paulo')
    now = datetime.datetime.now(tz)
    print(f"⏰ Hora Atual (Brasília): {now}")
    print(f"📅 Dia da Semana (0-6): { (now.weekday() + 1) % 7 }")

    print("\n1. Verificando Corretores no Banco...")
    brokers = db.get_all_brokers()
    print(f"Found {len(brokers)} brokers.")
    for b in brokers:
        uid = b.get('id')
        name = b.get('name')
        print(f"   - {name} ({uid})")
        
        schedule = db.get_broker_schedule(uid)
        print(f"     Expediente: {schedule}")
        if schedule:
            in_sched = is_within_schedule(schedule, now)
            print(f"     Está dentro do horário? {'SIM' if in_sched else 'NÃO'}")
        else:
            print("     Sem expediente definido (Padrão 8-19h)")

    print("\n2. Buscando Leads 'waiting' para todos os corretores...")
    from database import Database
    response = db.supabase.table("leads").select("*").in_("status", ["waiting", "ooh_rescheduled", "follow_up_pending"]).execute()
    leads = response.data
    print(f"Total de leads aguardando: {len(leads)}")
    for l in leads:
        print(f"   - Lead: {l.get('name')} | Phone: {l.get('phone')} | Status: {l.get('status')} | Broker ID: {l.get('user_id')}")

    print("\n3. Executando varredura oficial (dry run / simulation)...")
    # Vamos rodar a função real e ver os logs detalhados que adicionamos
    await check_leads_and_followups()

if __name__ == "__main__":
    asyncio.run(debug_run())
