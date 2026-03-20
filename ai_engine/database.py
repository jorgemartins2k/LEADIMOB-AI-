import os
from typing import List, Dict, Any, Optional
from supabase import create_client, Client # pyre-ignore
from dotenv import load_dotenv # pyre-ignore
import requests # pyre-ignore

load_dotenv()

class Database:
    def __init__(self) -> None:
        url: Optional[str] = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        key: Optional[str] = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        db_url: Optional[str] = os.getenv("DATABASE_URL") or os.getenv("URL_DO_BANCO_DE_DADOS")
        
        if not db_url:
            print("⚠️ ERRO: DATABASE_URL ou URL_DO_BANCO_DE_DADOS ausente do ambiente.")

        if not url or not key:
            print(f"❌ ERRO CRÍTICO: Variáveis do Supabase ausentes! URL: {'OK' if url else 'FALTANDO'}, KEY: {'OK' if key else 'FALTANDO'}")
            raise RuntimeError("Variáveis do Supabase ausentes no Railway.")

        self.supabase: Client = create_client(url, key)

    def get_all_brokers(self) -> List[Dict[str, Any]]:
        """
        Retorna todos os corretores ativos no sistema
        """
        response = self.supabase.table("users").select("id, name").execute()
        return response.data if response.data else []

    def get_broker_data(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Busca o perfil completo de um corretor específico, incluindo o Foco Diário validado
        """
        response = self.supabase.table("users").select("name, whatsapp, creci, real_estate_agency, presentation, daily_focus, daily_focus_date").eq("id", user_id).limit(1).execute()
        if response.data:
            broker: Dict[str, Any] = response.data[0]
            
            valid_focus = None
            daily_focus = broker.get('daily_focus')
            focus_date = broker.get('daily_focus_date')
            
            if daily_focus and focus_date:
                try:
                    from datetime import datetime
                    import pytz # pyre-ignore
                    tz = pytz.timezone('America/Sao_Paulo')
                    now = datetime.now(tz)
                    today_str = now.strftime('%Y-%m-%d')
                    
                    if focus_date == today_str:
                        # Verifica o expediente
                        js_day = (now.weekday() + 1) % 7
                        schedule_resp = self.supabase.table("work_schedules").select("end_time").eq("user_id", user_id).eq("day_of_week", js_day).limit(1).execute()
                        if schedule_resp.data:
                            end_time_str = schedule_resp.data[0]['end_time']
                            current_time_str = now.strftime('%H:%M:%S')
                            if current_time_str <= end_time_str:
                                valid_focus = daily_focus
                except Exception as e:
                    print("Erro ao validar daily focus:", e)

            return {
                "broker_name": broker.get('name', 'Corretor'),
                "broker_whatsapp": broker.get('whatsapp', ''),
                "broker_creci": broker.get('creci', 'Não informado'),
                "broker_agency": broker.get('real_estate_agency', 'Autônomo'),
                "broker_presentation": broker.get('presentation', ''),
                "daily_focus": valid_focus,
                "user_id": user_id
            }
        return None

    def get_lead_by_phone(self, phone: str) -> Optional[Dict[str, Any]]:
        """
        Busca um lead pelo telefone, considerando a variação do nono dígito para números brasileiros.
        """
        try:
            # Tolerância para o nono dígito do Brasil (Ex: 553499789 vs 55349789)
            phone_variants = [phone]
            if phone.startswith("55") and len(phone) == 13: # Com o 9 (Ex: 55 34 9 97894822)
                phone_variants.append(phone[:4] + phone[5:]) # Remove o 9
            elif phone.startswith("55") and len(phone) == 12: # Sem o 9 (Ex: 55 34 97894822)
                phone_variants.append(phone[:4] + "9" + phone[4:]) # Adiciona o 9
                
            response = self.supabase.table("leads").select("*").in_("phone", phone_variants).execute()
            leads = response.data
            if leads:
                return leads[0]
            return None
        except Exception as e:
            print(f"Erro ao buscar lead por telefone: {e}")
            return None

    def get_broker_by_lead_phone(self, phone: str) -> Optional[Dict[str, Any]]:
        """
        Busca o corretor associado a um lead via telefone com perfil completo e notas do lead
        """
        lead = self.get_lead_by_phone(phone)
        if lead:
            broker_data = self.get_broker_data(lead['user_id'])
            if broker_data:
                broker_data["lead_name"] = lead.get('name', 'Cliente')
                broker_data["lead_notes"] = lead.get('notes', '')
                return broker_data
        return None

    def get_chat_history(self, phone: str, limit: int = 10) -> List[Dict[str, Any]]:
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

    def update_lead_status(self, phone: str, status: str) -> None:
        """
        Atualiza o status de um lead pelo telefone
        """
        self.supabase.table("leads").update({
            "status": status,
            "updated_at": "now()"
        }).eq("phone", phone).execute()

    def set_lead_transfer_time(self, phone: str) -> None:
        """
        Marca o momento em que o lead foi transferido (alerta enviado)
        """
        self.supabase.table("leads").update({
            "transferred_at": "now()"
        }).eq("phone", phone).execute()

    def find_pending_hot_alerts(self, minutes: int = 5) -> List[Dict[str, Any]]:
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

    def find_leads_for_followup(self, hours: int = 24) -> List[Dict[str, Any]]:
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

    def save_message(self, phone: str, role: str, content: str) -> None:
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

    def confirm_hot_lead(self, broker_phone: str) -> bool:
        """
        Busca o corretor pelo telefone de WhatsApp e confirma todos os alertas quentes pendentes dele
        """
        broker_resp = self.supabase.table("users").select("id").eq("whatsapp", broker_phone).limit(1).execute()
        if broker_resp.data:
            user_id = broker_resp.data[0]['id']
            self.supabase.table("leads")\
                .update({"status": "active", "updated_at": "now()"})\
                .eq("user_id", user_id)\
                .in_("status", ["hot_alert_sent", "hot_alert_final"])\
                .execute()
            return True
        return False

    def add_to_best_practices(self, lead_id: str, summary: str, score: int) -> None:
        """
        Adiciona uma conversa ao banco de 200 melhores práticas.
        Se exceder 200, remove a de menor score.
        """
        count_resp = self.supabase.table("ai_brain_samples").select("id", count="exact").execute()
        count = count_resp.count if count_resp.count is not None else 0
        
        if count >= 200:
            weakest = self.supabase.table("ai_brain_samples")\
                .select("id")\
                .order("score", desc=False)\
                .limit(1)\
                .execute()
            if weakest.data:
                self.supabase.table("ai_brain_samples").delete().eq("id", weakest.data[0]['id']).execute()
        
        self.supabase.table("ai_brain_samples").insert({
            "lead_id": lead_id,
            "summary": summary,
            "score": score
        }).execute()

    def get_best_practices(self, limit: int = 10) -> str:
        """
        Retorna as melhores práticas para injetar no prompt (RAG simplificado)
        """
        response = self.supabase.table("ai_brain_samples")\
            .select("summary")\
            .order("score", desc=True)\
            .limit(limit)\
            .execute()
        if response.data:
            return "\n---\n".join([str(d.get('summary', '')) for d in response.data])
        return "Nenhum exemplo disponível ainda."

    def get_portfolio(self, user_id: str) -> str:
        """
        Busca o portfólio completo do corretor (Imóveis e Lançamentos) formatado para o prompt
        """
        props_resp = self.supabase.table("properties")\
            .select("title, description, price, type, city, neighborhood, standard, target_audience, website_url, photos")\
            .eq("user_id", user_id)\
            .eq("status", "available")\
            .execute()
        
        launches_resp = self.supabase.table("launches")\
            .select("name, description, price_from, city, neighborhood, standard, target_audience, website_url, photos")\
            .eq("user_id", user_id)\
            .execute()

        portfolio_parts: List[str] = []
        
        if props_resp.data:
            portfolio_parts.append("--- IMÓVEIS PRONTOS ---\n")
            for p in props_resp.data:
                url = p.get('website_url')
                if url:
                    portfolio_parts.append(f"Título: {p.get('title', 'Sem título')}\nLink do Imóvel: {url}\nTipo: {p.get('type', 'Indefinido')}\nPreço: R$ {p.get('price', 'Sob consulta')}\nLocal: {p.get('neighborhood', '')}, {p.get('city', '')}\nPúblico-alvo: {p.get('target_audience', [])}\n\n")
                else:
                    portfolio_parts.append(f"Título: {p.get('title', 'Sem título')}\nTipo: {p.get('type', 'Indefinido')}\nPreço: R$ {p.get('price', 'Sob consulta')}\nLocal: {p.get('neighborhood', '')}, {p.get('city', '')}\nPadrão: {p.get('standard', '')}\nDescrição: {p.get('description', 'Sem descrição')}\nPúblico-alvo: {p.get('target_audience', [])}\nFotos: {p.get('photos', [])}\n\n")

        if launches_resp.data:
            portfolio_parts.append("--- LANÇAMENTOS ---\n")
            for l in launches_resp.data:
                url = l.get('website_url')
                if url:
                    portfolio_parts.append(f"Nome: {l.get('name', 'Sem nome')}\nLink do Empreendimento: {url}\nPreço a partir: R$ {l.get('price_from', 'Sob consulta')}\nLocal: {l.get('neighborhood', '')}, {l.get('city', '')}\nPúblico-alvo: {l.get('target_audience', [])}\n\n")
                else:
                    portfolio_parts.append(f"Nome: {l.get('name', 'Sem nome')}\nPreço a partir: R$ {l.get('price_from', 'Sob consulta')}\nLocal: {l.get('neighborhood', '')}, {l.get('city', '')}\nPadrão: {l.get('standard', '')}\nDescrição: {l.get('description', 'Sem descrição')}\nPúblico-alvo: {l.get('target_audience', [])}\nFotos: {l.get('photos', [])}\n\n")

        return "".join(portfolio_parts) if portfolio_parts else "Nenhum imóvel ou lançamento cadastrado no portfólio."

    def get_broker_schedule(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Busca o expediente configurado pelo corretor
        """
        response = self.supabase.table("work_schedules")\
            .select("day_of_week, start_time, end_time, is_active")\
            .eq("user_id", user_id)\
            .execute()
        return response.data if response.data else []
