import os
import asyncio
import sys

# Forçar encoding UTF-8 para evitar erros de emoji no print
sys.stdout.reconfigure(encoding='utf-8')

from database import Database
from dotenv import load_dotenv

load_dotenv('c:/Users/jorge/.gemini/antigravity/scratch/Leadimob-AI/ai_engine/.env')

async def check():
    db = Database()
    if not db.supabase:
        print("Erro: Supabase não inicializado.")
        return

    # Leads waiting
    waiting = db.supabase.table("leads").select("id, name, status, created_at").eq("status", "waiting").execute()
    print(f"Total leads em espera (waiting): {len(waiting.data)}")
    for l in waiting.data[:10]:
        print(f"- {l['name']} ({l['id']}) em {l['created_at']}")

    # Leads active hoje
    from datetime import datetime, timezone
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    
    active = db.supabase.table("leads").select("id, name, status, updated_at")\
        .eq("status", "active")\
        .gte("updated_at", today.isoformat())\
        .execute()
    
    print(f"\nTotal leads ativos (contatados) hoje: {len(active.data)}")
    for l in active.data[:10]:
        print(f"- {l['name']} ({l['id']}) em {l['updated_at']}")

    # Outros estados terminados hoje
    others = db.supabase.table("leads").select("id, name, status, updated_at")\
        .in_("status", ["completed", "transferred", "opt_out"])\
        .gte("updated_at", today.isoformat())\
        .execute()
    print(f"\nTotal leads finalizados hoje: {len(others.data)}")

if __name__ == "__main__":
    asyncio.run(check())
