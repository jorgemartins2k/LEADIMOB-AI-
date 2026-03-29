from database import Database
from dotenv import load_dotenv
import os

load_dotenv()

def audit():
    db = Database()
    print("--- 🔍 AUDITORIA DE USUÁRIOS ---")
    try:
        # Busca direta do banco para ignorar o cache da classe se houver
        response = db.supabase.table("users").select("id, name, whatsapp").execute()
        users = response.data
        print(f"Total de usuários na tabela 'users': {len(users)}")
        for u in users:
            print(f" - {u.get('name')} (ID: {u.get('id')}) | WhatsApp: {u.get('whatsapp')}")
            
            # Verifica se tem agenda
            s_resp = db.supabase.table("work_schedules").select("*").eq("user_id", u.get('id')).execute()
            print(f"   Agendas configuradas: {len(s_resp.data)}")
            
            # Verifica se tem leads waiting
            l_resp = db.supabase.table("leads").select("id").eq("user_id", u.get('id')).eq("status", "waiting").execute()
            print(f"   Leads em espera: {len(l_resp.data)}")
            
    except Exception as e:
        print(f"Erro: {e}")

if __name__ == "__main__":
    audit()
