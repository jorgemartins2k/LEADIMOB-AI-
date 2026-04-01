import sys
import os
import asyncio
import datetime
import pytz

# Adiciona o diretório atual ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import Database

async def check():
    db = Database()
    if not db.supabase:
        print("Erro: Cliente Supabase não inicializado.")
        return

    tz = pytz.timezone('America/Sao_Paulo')
    now = datetime.datetime.now(tz)
    tomorrow = (now + datetime.timedelta(days=1)).strftime('%Y-%m-%d')
    tomorrow_start = (now + datetime.timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow_end = tomorrow_start + datetime.timedelta(days=1)
    
    print(f"--- Relatório de Follow-ups para {tomorrow} ---\n")
    
    try:
        # 1. Type 3 Agendados
        resp = db.supabase.table("leads").select("*")\
            .eq("status", "scheduled")\
            .gte("next_follow_up_at", tomorrow_start.isoformat())\
            .lt("next_follow_up_at", tomorrow_end.isoformat())\
            .execute()
        
        if resp.data:
            print(f"✅ Agendamentos Fixos: {len(resp.data)}")
            for l in resp.data:
                print(f"   - {l.get('name')} ({l.get('phone')}): {l.get('next_follow_up_at')}")
        else:
            print("❌ Nenhum agendamento fixo para amanhã.")

        # 2. Ativos que podem receber follow-up amanhã (24h de silêncio)
        today_str = now.strftime('%Y-%m-%d')
        resp_active = db.supabase.table("leads").select("*")\
            .eq("status", "active")\
            .execute()
        
        potential = []
        if resp_active.data:
            for l in resp_active.data:
                updated_at = l.get('updated_at', '')
                if today_str in str(updated_at):
                    potential.append(l)
        
        if potential:
            print(f"\n📊 Leads ativos com interação hoje (podem receber follow-up amanhã se ficarem em silêncio): {len(potential)}")
            for l in potential:
                 print(f"   - {l.get('name')} (Última interação: {l.get('updated_at')})")
        else:
            print("\nℹ️ Nenhum lead ativo interagiu hoje.")
    except Exception as e:
        print(f"Erro ao consultar Supabase: {e}")

if __name__ == "__main__":
    asyncio.run(check())
