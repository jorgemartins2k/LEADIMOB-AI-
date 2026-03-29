from database import Database
from dotenv import load_dotenv
import os
import sys

# Ensure UTF-8 output
if sys.stdout.encoding != 'utf-8':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

load_dotenv()

def check():
    # Force use of provided .env variables if Database class fails to find them
    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        print("ERROR: Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env")
        return

    db = Database()
    print("--- [ DATABASE DIAGNOSTIC ] ---")
    
    # 1. Check all users (brokers)
    print("\n[BROKERS]")
    try:
        users_resp = db.supabase.table("users").select("id, name, whatsapp").execute()
        users = users_resp.data if users_resp.data else []
        for u in users:
            print(f"ID: {u.get('id')} | Name: {u.get('name')} | WhatsApp: {u.get('whatsapp')}")
    except Exception as e:
        print(f"Error fetching users: {e}")

    # 2. Check work schedules
    print("\n[WORK SCHEDULES]")
    try:
        sched_resp = db.supabase.table("work_schedules").select("*").execute()
        scheds = sched_resp.data if sched_resp.data else []
        for s in scheds:
            print(f"User ID: {s.get('user_id')} | Day: {s.get('day_of_week')} | Start: {s.get('start_time')} | End: {s.get('end_time')} | Active: {s.get('is_active')}")
    except Exception as e:
        print(f"Error fetching schedules: {e}")

    # 3. Check leads
    print("\n[RECENT LEADS (last 20)]")
    try:
        leads_resp = db.supabase.table("leads").select("id, name, phone, status, user_id, created_at").order("created_at", desc=True).limit(20).execute()
        leads = leads_resp.data if leads_resp.data else []
        for l in leads:
            print(f"ID: {l.get('id')} | Name: {l.get('name')} | Status: {l.get('status')} | Broker ID: {l.get('user_id')} | Created: {l.get('created_at')}")
    except Exception as e:
        print(f"Error fetching leads: {e}")
    
    print("\n--- [ END OF DIAGNOSTIC ] ---")

if __name__ == "__main__":
    check()
