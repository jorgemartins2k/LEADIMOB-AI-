import os
import datetime
import pytz # pyre-ignore
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
            # Não levantamos RuntimeError para evitar que o uvicorn morra no Railway, permitindo logs
            self.supabase = None
        else:
            self.supabase: Client = create_client(url, key)

    def _normalize_phone(self, phone: str) -> str:
        """
        Remove caracteres não numéricos.
        """
        import re
        return re.sub(r'\D', '', str(phone))

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
        response = self.supabase.table("users").select("name, whatsapp, creci, real_estate_agency, city, metropolitan_regions, presentation, daily_focus, daily_focus_date").eq("id", user_id).limit(1).execute()
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
                "broker_city": broker.get('city', 'sua região'),
                "broker_metropolitan_regions": broker.get('metropolitan_regions', ''),
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
            clean_phone = self._normalize_phone(phone)
            # Tolerância para o nono dígito do Brasil (Ex: 553499789 vs 55349789)
            phone_variants = [clean_phone]
            if clean_phone.startswith("55") and len(clean_phone) == 13: # Com o 9 (Ex: 55 34 9 97894822)
                phone_variants.append(clean_phone[:4] + clean_phone[5:])
            elif clean_phone.startswith("55") and len(clean_phone) == 12: # Sem o 9 (Ex: 55 34 97894822)
                phone_variants.append(clean_phone[:4] + "9" + clean_phone[4:])
                
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
                broker_data["lead_id"] = lead.get('id')
                broker_data["lead_name"] = lead.get('name', 'Cliente')
                broker_data["lead_notes"] = lead.get('notes', '')
                return broker_data
        return None

    def get_chat_history(self, lead_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Busca o histórico de conversas do lead
        """
        response = self.supabase.table("conversations")\
            .select("role, content")\
            .eq("lead_id", lead_id)\
            .order("sent_at", desc=True)\
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

    def add_broker_notification(self, user_id: str, lead_id: str, message: str) -> None:
        """
        Salva o briefing da notificação na tabela do painel
        """
        try:
            self.supabase.table("broker_notifications").insert({
                "user_id": user_id,
                "lead_id": lead_id,
                "message": message,
                "status": "unread"
            }).execute()
        except Exception as e:
            print(f"Erro ao salvar notificação: {e}")

    def confirm_hot_lead(self, broker_phone: str) -> bool:
        """
        Marca todos os leads pendentes de confirmação como 'active' para este corretor.
        Retorna True apenas se houver leads pendentes que foram confirmados.
        """
        try:
            # 1. Busca o ID do corretor pelo telefone
            broker = self.supabase.table("users").select("id").eq("whatsapp", broker_phone).execute()
            if not broker.data: return False
            user_id = broker.data[0]['id']

            # 2. Verifica se existem leads pendentes ANTES de retornar True
            pending = self.supabase.table("leads").select("id")\
                .eq("user_id", user_id)\
                .in_("status", ["hot_alert_sent", "hot_alert_retry", "hot_alert_final"])\
                .execute()
            
            if not pending.data:
                return False

            # 3. Confirma os leads pendentes
            self.supabase.table("leads").update({"status": "active"})\
                .eq("user_id", user_id)\
                .in_("status", ["hot_alert_sent", "hot_alert_retry", "hot_alert_final"])\
                .execute()
            
            # 4. Marca notificações como lidas
            self.supabase.table("broker_notifications").update({"status": "read"})\
                .eq("user_id", user_id)\
                .eq("status", "unread")\
                .execute()
                
            return True
        except Exception as e:
            print(f"Erro ao confirmar lead quente: {e}")
            return False

    def find_pending_hot_alerts(self, minutes: int = 5) -> List[Dict[str, Any]]:
        """
        Busca leads em estado 'hot_alert_sent' ou 'hot_alert_retry' que não foram confirmados.
        Baseia-se no transferred_at para o intervalo.
        """
        limit_time = (datetime.datetime.now(pytz.timezone('America/Sao_Paulo')) - datetime.timedelta(minutes=minutes)).isoformat()
        
        response = self.supabase.table("leads")\
            .select("*")\
            .in_("status", ["hot_alert_sent", "hot_alert_retry"])\
            .lt("transferred_at", limit_time)\
            .execute()
        
        return response.data if hasattr(response, 'data') and response.data else []

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

    def save_message(self, lead_id: str, user_id: str, role: str, content: str) -> None:
        """
        Salva uma nova mensagem e atualiza o timestamp do lead
        """
        if not lead_id or not user_id: return
        self.supabase.table("conversations").insert({
            "lead_id": lead_id,
            "user_id": user_id,
            "role": role,
            "content": content
        }).execute()
        
        # Atualiza o lead para que o follow-up saibam que houve interação
        self.supabase.table("leads").update({"updated_at": "now()"}).eq("id", lead_id).execute()

    def is_registered_broker(self, phone: str) -> bool:
        """
        Verifica se o telefone pertence a um corretor cadastrado na tabela de usuários.
        """
        try:
            clean_phone = self._normalize_phone(phone)
            
            # Testa variações (com e sem 55)
            phone_variants = [clean_phone]
            if clean_phone.startswith("55"):
                phone_variants.append(clean_phone[2:])
            else:
                phone_variants.append("55" + clean_phone)

            response = self.supabase.table("users").select("id").in_("whatsapp", phone_variants).execute()
            return len(response.data) > 0 if response.data else False
        except Exception as e:
            print(f"Erro ao verificar corretor: {e}")
            return False

    def add_to_ranking(self, user_id: str, lead_id: str, summary: str, highlights: str) -> None:
        """
        Adiciona o lead ao Top 1 do ranking, empurrando os outros para baixo.
        Mantém apenas os 100 melhores por corretor.
        """
        try:
            # 1. Empurra todos os existentes um degrau abaixo
            self.supabase.rpc("increment_lead_ranks", {"p_user_id": user_id}).execute()
            
            # 2. Insere o novo como Rank 1
            self.supabase.table("best_leads_ranking").insert({
                "user_id": user_id,
                "lead_id": lead_id,
                "rank": 1,
                "lead_summary": summary,
                "interaction_highlights": highlights
            }).execute()
            
            # 3. Remove quem passou do centésimo
            self.supabase.table("best_leads_ranking").delete().eq("user_id", user_id).gt("rank", 100).execute()
        except Exception as e:
            print(f"Erro ao atualizar ranking: {e}")

    def get_top_ranking_cases(self, user_id: str, limit: int = 5) -> str:
        """
        Retorna os melhores casos do ranking para inspirar a IA (Few-Shot Prompting)
        """
        response = self.supabase.table("best_leads_ranking")\
            .select("lead_summary, interaction_highlights")\
            .eq("user_id", user_id)\
            .order("rank", desc=False)\
            .limit(limit)\
            .execute()
        
        if response.data:
            cases = []
            for i, d in enumerate(response.data):
                cases.append(f"EXEMPLO {i+1}:\nPerfil: {d['lead_summary']}\nDestaque: {d['interaction_highlights']}")
            return "\n\n".join(cases)
        return "Ainda não há casos modelo salvos para este corretor."

    def add_mistake_log(self, user_id: str, lead_id: str, error_context: str, user_correction: str, lesson: str) -> None:
        """
        Registra uma confusão ou alucinação da IA para evitar repetição.
        """
        try:
            self.supabase.table("ai_mistakes_log").insert({
                "user_id": user_id,
                "lead_id": lead_id,
                "error_context": error_context,
                "user_correction": user_correction,
                "lesson_learned": lesson
            }).execute()
        except Exception as e:
            print(f"Erro ao registrar erro da IA: {e}")

    def get_recent_lessons(self, user_id: str, limit: int = 5) -> str:
        """
        Busca as lições aprendidas com erros passados para injetar como Restrições Negativas.
        """
        response = self.supabase.table("ai_mistakes_log")\
            .select("lesson_learned")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        
        if response.data:
            lessons = [f"- {d['lesson_learned']}" for d in response.data]
            return "\n".join(lessons)
        return "Nenhum erro registrado ainda. Continue mantendo a precisão."

    def get_portfolio(self, user_id: str) -> str:
        """
        Busca o portfólio completo do corretor (Imóveis e Lançamentos) formatado para o prompt
        """
        launches_resp = self.supabase.table("launches")\
            .select("name, description, price_from, city, neighborhood, standard, target_audience, website_url, photos, delivery_date, launch_units:launch_units(name, area_sqm, bedrooms, bathrooms, parking_spots, price, minha_casa_minha_vida, allows_financing, down_payment, condo_fee, is_condo, target_audience)")\
            .eq("user_id", user_id)\
            .execute()
        portfolio_parts: List[str] = []
        
        if launches_resp.data:
            portfolio_parts.append("--- LANÇAMENTOS ---\n")
            for l in launches_resp.data:
                item = [
                    f"Nome: {l.get('name', 'Sem nome')}",
                    f"Preço a partir: R$ {l.get('price_from', 'Sob consulta')}",
                    f"Local: {l.get('neighborhood', '')}, {l.get('city', '')}",
                    f"Padrão: {l.get('standard', '')}",
                    f"Descrição: {l.get('description', 'Sem descrição')}",
                    f"Público-alvo: {l.get('target_audience', [])}",
                    f"Previsão de Entrega: {l.get('delivery_date', 'Não informada')}"
                ]
                url = l.get('website_url')
                if url: item.append(f"Link do Empreendimento: {url}")
                
                photos = l.get('photos', [])
                if photos: item.append(f"Fotos: {photos}")
                
                units = l.get('launch_units', [])
                if units:
                    item.append("UNIDADES/PLANTAS DISPONÍVEIS:")
                    for u in units:
                        u_info = f"- {u.get('name', 'Planta')}: {u.get('area_sqm', '')}m², {u.get('bedrooms', 0)} dorms, R$ {u.get('price', 'Sob consulta')}"
                        if u.get('minha_casa_minha_vida'): u_info += " (MCMV)"
                        item.append(u_info)

                portfolio_parts.append("\n".join(item) + "\n\n")
        return "".join(portfolio_parts) if portfolio_parts else "Nenhum lançamento cadastrado no portfólio."

    def get_broker_schedule(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Busca o expediente configurado pelo corretor
        """
        response = self.supabase.table("work_schedules")\
            .select("day_of_week, start_time, end_time, is_active")\
            .eq("user_id", user_id)\
            .execute()
        return response.data if response.data else []
