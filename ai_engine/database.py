import os
from supabase import create_client, Client
from dotenv import load_dotenv
import requests # Added for Z-API functionality

load_dotenv()

class Database:
    def __init__(self):
        url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not url or not key:
            print(f"❌ ERRO CRÍTICO: Variáveis do Supabase ausentes! URL: {'OK' if url else 'FALTANDO'}, KEY: {'OK' if key else 'FALTANDO'}")
            raise RuntimeError("Variáveis do Supabase ausentes no Railway.")

        self.supabase: Client = create_client(url, key)

    def get_broker_by_lead_phone(self, phone: str) -> dict | None:
        """
        Busca o corretor associado a um lead via telefone com perfil completo
        """
        response = self.supabase.table("leads").select("user_id, name").eq("phone", phone).limit(1).execute()
        if response.data:
            lead = response.data[0]
            user_id = lead['user_id']
            broker_resp = self.supabase.table("users").select("name, whatsapp, creci, real_estate_agency, presentation").eq("id", user_id).limit(1).execute()
            if broker_resp.data:
                broker = broker_resp.data[0]
                return {
                    "broker_name": broker['name'],
                    "broker_whatsapp": broker['whatsapp'],
                    "broker_creci": broker.get('creci', 'Não informado'),
                    "broker_agency": broker.get('real_estate_agency', 'Autônomo'),
                    "broker_presentation": broker.get('presentation', ''),
                    "user_id": user_id,
                    "lead_name": lead['name']
                }
        return None

    def get_chat_history(self, phone: str, limit: int = 10) -> list[dict]: # Added type hints
        """
        Busca o histórico de conversas do lead
        """
        response = self.supabase.table("conversations")\
            .select("role, content")\
            .eq("phone", phone)\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        
        # Inverte para ordem cronológica
        return response.data[::-1] if response.data else []

    def save_message(self, phone: str, role: str, content: str): # Added type hints
        """
        Salva uma nova mensagem no histórico
        """
        self.supabase.table("conversations").insert({
            "phone": phone,
            "role": role,
            "content": content
        }).execute()

    def get_portfolio(self, user_id):
        """
        Busca os imóveis do corretor
        """
        response = self.supabase.table("properties").select("*").eq("user_id", user_id).limit(20).execute()
        return response.data if response.data else []

    def get_broker_schedule(self, user_id: str) -> list[dict]:
        """
        Busca o expediente configurado pelo corretor
        """
        response = self.supabase.table("work_schedules")\
            .select("day_of_week, start_time, end_time, is_active")\
            .eq("user_id", user_id)\
            .execute()
        return response.data if response.data else []
