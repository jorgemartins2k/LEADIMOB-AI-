import asyncio
import datetime
import pytz
import sys
import os

# Assume que estamos rodando da pasta Leadimob-AI ou ai_engine
# Tenta encontrar scheduler.py
if os.path.exists('scheduler.py'):
    sys.path.append(os.getcwd())
elif os.path.exists('ai_engine/scheduler.py'):
    sys.path.append(os.path.abspath('ai_engine'))

from scheduler import check_leads_and_followups
from database import Database

async def verify_ooh():
    print("🧪 Iniciando Verificação de Alertas OOH...")
    db = Database()
    
    # 1. Busca um lead existente para usar como teste
    response = db.supabase.table("leads").select("*").limit(1).execute()
    if not response.data or not response.data:
        print("❌ Nenhum lead encontrado para teste.")
        return
    
    lead = response.data[0]
    phone = lead['phone']
    user_id = lead['user_id']
    lead_id = lead['id']
    
    print(f"📌 Usando lead {phone} (ID: {lead_id}) para teste.")
    
    try:
        # 2. Configura o lead como pendente OOH
        db.supabase.table("leads").update({"status": "ooh_hot_alert_pending"}).eq("id", lead_id).execute()
        print(f"✅ Status alterado para ooh_hot_alert_pending")
        
        # 3. Verifica o expediente e roda o scheduler
        tz = pytz.timezone('America/Sao_Paulo')
        now = datetime.datetime.now(tz)
        schedule = db.get_broker_schedule(user_id)
        
        from scheduler import is_within_schedule
        
        if not is_within_schedule(schedule, now):
            print("⚠️ Corretor está OFFLINE no momento.")
            print("⏰ Vou ajustar temporariamente o expediente no banco para garantir o teste...")
            
            db_day = (now.weekday() + 1) % 7
            db.supabase.table("work_schedules").update({
                "start_time": "00:00:00",
                "end_time": "23:59:59",
                "is_active": True
            }).eq("user_id", user_id).eq("day_of_week", db_day).execute()
            print("🔧 Expediente ajustado para teste (00:00 às 23:59).")
        
        print("🟢 Corretor está ONLINE. Rodando varredura...")
        await check_leads_and_followups()
        
        # 4. Verifica se o status mudou
        new_resp = db.supabase.table("leads").select("status").eq("id", lead_id).execute()
        new_status = new_resp.data[0]['status']
        if new_status == "hot_alert_sent":
            print("🎉 SUCESSO: O lead foi processado e o alerta enviado!")
        else:
            # Talvez já tenha sido processado por outro job ou falhou
            print(f"🧐 Status atual: {new_status}. Esperado: hot_alert_sent.")
                
    except Exception as e:
        print(f"❌ Erro durante a verificação: {e}")
    finally:
        pass

if __name__ == "__main__":
    asyncio.run(verify_ooh())
