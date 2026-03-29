from database import Database
from dotenv import load_dotenv
import os

load_dotenv()

def find():
    db = Database()
    print("Listing all brokers...")
    try:
        users = db.get_all_brokers()
        for u in users:
            print(f"Name: {u.get('name')} | ID: {u.get('id')}")
            
            # Check his leads
            l_resp = db.supabase.table("leads").select("id, name, status").eq("user_id", u.get('id')).execute()
            print(f"  Total Leads: {len(l_resp.data) if l_resp.data else 0}")
            for l in l_resp.data or []:
                print(f"    - Lead: {l.get('name')} | Status: {l.get('status')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    find()
