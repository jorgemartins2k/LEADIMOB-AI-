import os
import asyncio
import sys

# Adiciona o diretório atual ao path para importar database
sys.path.append('c:/Users/jorge/.gemini/antigravity/scratch/Leadimob-AI/ai_engine')

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
    print(f"Total leads em espera (waiting): {len(waiting.data) if waiting.data else 0}")

    # Leads active hoje
    from datetime import datetime, timezone, timedelta
    # Hoje em SP
    today_sp = datetime.now(timezone(timedelta(hours=-3))).replace(hour=0, minute=0, second=0, microsecond=0)
    
    active = db.supabase.table("leads").select("id, name, status, updated_at")\
        .eq("status", "active")\
        .gte("updated_at", today_sp.isoformat())\
        .execute()
    
    print(f"\nTotal leads ativos (contatados) hoje: {len(active.data) if active.data else 0}")
    for l in active.data[:20]:
        print(f"- {l['name']} ({l['id']}) em {l['updated_at']}")

    # Verifica se há mensagens enviadas para esses leads
    if active.data:
        print("\nVerificando mensagens para os primeiros 5 leads ativos:")
        for l in active.data[:5]:
            msgs = db.supabase.table("conversations").select("content").eq("lead_id", l['id']).eq("role", "assistant").execute()
            print(f"  - Lead {l['name']} ({l['id']}): {len(msgs.data) if msgs.data else 0} mensagens da Raquel.")

if __name__ == "__main__":
    asyncio.run(check())
