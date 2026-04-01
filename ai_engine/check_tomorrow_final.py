import os
import requests
import datetime
import pytz
from dotenv import load_dotenv

# Configuração simples via Requests
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
    today_str = now.strftime('%Y-%m-%d')
    tomorrow_date = (now + datetime.timedelta(days=1)).strftime('%Y-%m-%d')

    print(f"--- Relatorio de Follow-ups para {tomorrow_date} ---")

    # Busca todos os leads para filtrar localmente (evita erros de sintaxe na API)
    leads = query_supabase("leads", {"select": "*"})
    
    if isinstance(leads, dict) and "error" in leads:
        print(f"Erro ao acessar banco: {leads['error']}")
        return

    # 1. Agendamentos Fixos (Type 3)
    scheduled = [l for l in leads if l.get('status') == 'scheduled' and str(l.get('next_follow_up_at')).startswith(tomorrow_date)]
    
    if scheduled:
        print(f"\nAgendamentos Fixos (Type 3): {len(scheduled)}")
        for l in scheduled:
            print(f"- {l.get('name', 'Cliente')} ({l.get('phone')})")
    else:
        print("\nNenhum agendamento fixo (Type 3) para amanha.")

    # 2. Possiveis Automáticos (Type 1 e 2)
    # Quem falou hoje e fara 24h amanha
    active_today = [l for l in leads if l.get('status') == 'active' and today_str in str(l.get('updated_at'))]

    if active_today:
        print(f"\nLeads ativos que falaram hoje (completam 24h amanhã): {len(active_today)}")
        for l in active_today:
            print(f"- {l.get('name', 'Cliente')}")
    else:
        print("\nNenhum lead ativo interagiu hoje.")

if __name__ == "__main__":
    run()
