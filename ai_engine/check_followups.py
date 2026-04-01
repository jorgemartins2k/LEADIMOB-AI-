import os
import asyncio
from supabase import create_client, Client
from dotenv import load_dotenv
import datetime
import pytz

# Configuração
load_dotenv()
url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

async def check():
    tz = pytz.timezone('America/Sao_Paulo')
    now = datetime.datetime.now(tz)
    # amanhã é 2026-04-01
    tomorrow_start = (now + datetime.timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow_end = tomorrow_start + datetime.timedelta(days=1)
    
    print(f"--- Relatório de Follow-ups para {tomorrow_start.date()} ---\n")
    
    # 1. Leads com agendamento EXPLÍCITO (Type 3)
    scheduled = supabase.table("leads").select("*")\
        .eq("status", "scheduled")\
        .gte("next_follow_up_at", tomorrow_start.isoformat())\
        .lt("next_follow_up_at", tomorrow_end.isoformat())\
        .execute()
    
    if scheduled.data:
        print(f"✅ Agendamentos Fixos (Type 3): {len(scheduled.data)}")
        for l in scheduled.data:
            print(f"   - {l.get('name')} ({l.get('phone')}): às {l.get('next_follow_up_at')}")
    else:
        print("❌ Nenhum agendamento fixo (Type 3) encontrado para amanhã.")

    # 2. Leads que podem receber follow-up automático (Type 1 e 2)
    # Leads ativos que completarão 24h de silêncio amanhã
    active_resp = supabase.table("leads").select("*").eq("status", "active").execute()
    
    type1_2_tomorrow = []
    if active_resp.data:
        for l in active_resp.data:
            # Se foi atualizado hoje (31/03), fará 24h amanhã (01/04)
            updated_at = l.get('updated_at')
            if updated_at and "2026-03-31" in updated_at:
                type1_2_tomorrow.append(l)
    
    if type1_2_tomorrow:
        print(f"\n📊 Previsão de Follow-ups Automáticos (Silêncio de 24h): {len(type1_2_tomorrow)}")
        for l in type1_2_tomorrow:
            print(f"   - {l.get('name')} (Status: {l.get('status')}, Tentativa: {l.get('follow_up_count', 0) + 1})")
    else:
        print("\nℹ️ Sem previsão de novos follow-ups automáticos de 24h para amanhã.")

if __name__ == "__main__":
    asyncio.run(check())
