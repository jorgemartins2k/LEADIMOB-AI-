import os
import asyncio
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

async def check_leads():
    # Leads waiting
    waiting = supabase.table("leads").select("id, name, status, created_at").eq("status", "waiting").execute()
    print(f"Total leads waiting: {len(waiting.data)}")
    for l in waiting.data[:20]:
        print(f"- {l['name']} ({l['id']}) criado em: {l['created_at']}")

    # Leads active today
    from datetime import datetime, timezone, timedelta
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    active = supabase.table("leads").select("id, name, status, updated_at").eq("status", "active").gte("updated_at", today.isoformat()).execute()
    print(f"\nTotal leads contatados hoje: {len(active.data)}")
    for l in active.data[:20]:
        print(f"- {l['name']} ({l['id']}) contatado em: {l['updated_at']}")

if __name__ == "__main__":
    asyncio.run(check_leads())
