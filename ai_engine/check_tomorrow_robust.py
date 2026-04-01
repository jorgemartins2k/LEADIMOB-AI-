import os
import requests
import datetime
import pytz
from dotenv import load_dotenv

# Configuração simples via Requests para evitar problemas de encoding/biblioteca
load_dotenv()

url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

def query_supabase(table, params):
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json"
    }
    try:
        r = requests.get(f"{url}/rest/v1/{table}", headers=headers, params=params)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        return {"error": str(e)}

def run():
    tz = pytz.timezone('America/Sao_Paulo')
    now = datetime.datetime.now(tz)
    tomorrow_date = (now + datetime.timedelta(days=1)).strftime('%Y-%m-%d')
    tomorrow_start = (now + datetime.timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    tomorrow_end = (now + datetime.timedelta(days=2)).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()

    print(f"--- Relatorio de Follow-ups para {tomorrow_date} ---")

    # 1. Agendamentos Fixos (Type 3)
    scheduled = query_supabase("leads", {
        "status": "eq.scheduled", 
        "next_follow_up_at": f"gte.{tomorrow_start}",
        "next_follow_up_at": f"lt.{tomorrow_end}"
    })
    
    if isinstance(scheduled, list) and len(scheduled) > 0:
        print(f"\nAgendamentos Fixos (Type 3): {len(scheduled)}")
        for l in scheduled:
            print(f"- {l.get('name', 'Cliente')} ({l.get('phone')})")
    elif "error" in scheduled:
         print(f"\nErro ao buscar agendados: {scheduled['error']}")
    else:
        print("\nNenhum agendamento fixo (Type 3) para amanhã.")

    # 2. Follow-ups por Inatividade (Type 1 e 2)
    # Filtramos quem interagiu hoje (31/03) e que completará 24h amanhã
    today_str = now.strftime('%Y-%m-%d')
    active = query_supabase("leads", {
        "status": "eq.active",
        "updated_at": f"like.*{today_str}*"
    })

    if isinstance(active, list) and len(active) > 0:
        print(f"\nLeads ativos que falaram hoje (completam 24h de silencio amanhã): {len(active)}")
        for l in active:
            print(f"- {l.get('name', 'Cliente')} (Ultima att: {l.get('updated_at')})")
    elif "error" in active:
        print(f"Erro ao buscar ativos: {active['error']}")
    else:
        print("\nNenhum lead ativo interagiu hoje.")

if __name__ == "__main__":
    run()
