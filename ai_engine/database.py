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

    def get_all_brokers(self) -> list[dict]:
        """
        Retorna todos os corretores ativos no sistema
        """
        response = self.supabase.table("users").select("id, name").execute()
        return response.data if response.data else []

    def get_broker_data(self, user_id: str) -> dict | None:
        """
        Busca o perfil completo de um corretor específico
        """
        response = self.supabase.table("users").select("name, whatsapp, creci, real_estate_agency, presentation").eq("id", user_id).limit(1).execute()
        if response.data:
            broker = response.data[0]
            return {
                "broker_name": broker['name'],
                "broker_whatsapp": broker['whatsapp'],
                "broker_creci": broker.get('creci', 'Não informado'),
                "broker_agency": broker.get('real_estate_agency', 'Autônomo'),
                "broker_presentation": broker.get('presentation', ''),
                "user_id": user_id
            }
        return None

    def get_broker_by_lead_phone(self, phone: str) -> dict | None:
        """
        Busca o corretor associado a um lead via telefone com perfil completo e notas do lead
        """
        response = self.supabase.table("leads").select("user_id, name, notes").eq("phone", phone).limit(1).execute()
        if response.data:
            lead = response.data[0]
            broker_data = self.get_broker_data(lead['user_id'])
            if broker_data:
                broker_data["lead_name"] = lead['name']
                broker_data["lead_notes"] = lead.get('notes', '')
                return broker_data
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

    def update_lead_status(self, phone: str, status: str):
        """
        Atualiza o status de um lead pelo telefone
        """
        self.supabase.table("leads").update({
            "status": status,
            "updated_at": "now()"
        }).eq("phone", phone).execute()

    def set_lead_transfer_time(self, phone: str):
        """
        Marca o momento em que o lead foi transferido (alerta enviado)
        """
        self.supabase.table("leads").update({
            "transferred_at": "now()"
        }).eq("phone", phone).execute()

    def find_pending_hot_alerts(self, minutes=5):
        """
        Busca leads que receberam alerta há mais de X minutos e não foram confirmados
        """
        from datetime import datetime, timedelta, timezone
        threshold = datetime.now(timezone.utc) - timedelta(minutes=minutes)
        
        response = self.supabase.table("leads")\
            .select("*")\
            .eq("status", "hot_alert_sent")\
            .lt("transferred_at", threshold.isoformat())\
            .execute()
        return response.data if response.data else []

    def find_leads_for_followup(self, hours=24):
        """
        Busca leads ativos sem interação há mais de X horas
        """
        from datetime import datetime, timedelta, timezone
        threshold = datetime.now(timezone.utc) - timedelta(hours=hours)
        
        response = self.supabase.table("leads")\
            .select("*")\
            .eq("status", "active")\
            .lt("updated_at", threshold.isoformat())\
            .execute()
        return response.data if response.data else []

    def save_message(self, phone: str, role: str, content: str): # Added type hints
        """
        Salva uma nova mensagem e atualiza o timestamp do lead
        """
        self.supabase.table("conversations").insert({
            "phone": phone,
            "role": role,
            "content": content
        }).execute()
        
        # Atualiza o lead para que o follow-up saibam que houve interação
        self.supabase.table("leads").update({"updated_at": "now()"}).eq("phone", phone).execute()

    def confirm_hot_lead(self, broker_phone: str):
        """
        Busca o corretor pelo telefone de WhatsApp e confirma todos os alertas quentes pendentes dele
        """
        # 1. Busca o corretor pelo WhatsApp
        broker_resp = self.supabase.table("users").select("id").eq("whatsapp", broker_phone).limit(1).execute()
        if broker_resp.data:
            user_id = broker_resp.data[0]['id']
            # 2. Atualiza status de leads pendentes de confirmação desse corretor para 'active'
            self.supabase.table("leads")\
                .update({"status": "active", "updated_at": "now()"})\
                .eq("user_id", user_id)\
                .in_("status", ["hot_alert_sent", "hot_alert_final"])\
                .execute()
            return True
        return False

    def add_to_best_practices(self, lead_id: str, summary: str, score: int):
        """
        Adiciona uma conversa ao banco de 200 melhores práticas.
        Se exceder 200, remove a de menor score.
        """
        # 1. Busca total atual
        count_resp = self.supabase.table("ai_brain_samples").select("id", count="exact").execute()
        count = count_resp.count if count_resp.count is not None else 0
        
        if count >= 200:
            # Busca a de menor score para substituir
            weakest = self.supabase.table("ai_brain_samples")\
                .select("id")\
                .order("score", desc=False)\
                .limit(1)\
                .execute()
            if weakest.data:
                self.supabase.table("ai_brain_samples").delete().eq("id", weakest.data[0]['id']).execute()
        
        # Insere nova
        self.supabase.table("ai_brain_samples").insert({
            "lead_id": lead_id,
            "summary": summary,
            "score": score
        }).execute()

    def get_best_practices(self, limit=10) -> str:
        """
        Retorna as melhores práticas para injetar no prompt (RAG simplificado)
        """
        response = self.supabase.table("ai_brain_samples")\
            .select("summary")\
            .order("score", desc=True)\
            .limit(limit)\
            .execute()
        if response.data:
            return "\n---\n".join([d['summary'] for d in response.data])
        return "Nenhum exemplo disponível ainda."

    def get_portfolio(self, user_id: str) -> str:
        """
        Busca o portfólio completo do corretor (Imóveis e Lançamentos) formatado para o prompt
        """
        # 1. Busca Imóveis
        props_resp = self.supabase.table("properties")\
            .select("title, description, price, type, city, neighborhood, standard, target_audience")\
            .eq("user_id", user_id)\
            .eq("status", "available")\
            .execute()
        
        # 2. Busca Lançamentos
        launches_resp = self.supabase.table("launches")\
            .select("name, description, price_from, city, neighborhood, standard, target_audience")\
            .eq("user_id", user_id)\
            .execute()

        portfolio_text = ""
        
        if props_resp.data:
            portfolio_text += "--- IMÓVEIS PRONTOS ---\n"
            for p in props_resp.data:
                portfolio_text += f"Título: {p['title']}\nTipo: {p['type']}\nPreço: R$ {p['price']}\nLocal: {p['neighborhood']}, {p['city']}\nPadrão: {p['standard']}\nDescrição: {p.get('description', 'Sem descrição')}\nPúblico-alvo: {p.get('target_audience', [])}\n\n"

        if launches_resp.data:
            portfolio_text += "--- LANÇAMENTOS ---\n"
            for l in launches_resp.data:
                portfolio_text += f"Nome: {l['name']}\nPreço a partir: R$ {l['price_from']}\nLocal: {l['neighborhood']}, {l['city']}\nPadrão: {l['standard']}\nDescrição: {l.get('description', 'Sem descrição')}\nPúblico-alvo: {l.get('target_audience', [])}\n\n"

        return portfolio_text if portfolio_text else "Nenhum imóvel ou lançamento cadastrado no portfólio."

    def get_broker_schedule(self, user_id: str) -> list[dict]:
        """
        Busca o expediente configurado pelo corretor
        """
        response = self.supabase.table("work_schedules")\
            .select("day_of_week, start_time, end_time, is_active")\
            .eq("user_id", user_id)\
            .execute()
        return response.data if response.data else []
