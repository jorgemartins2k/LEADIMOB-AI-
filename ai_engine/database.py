"""
database.py — Camada de acesso ao Supabase
Correções aplicadas:
- Nenhuma alteração de lógica, apenas robustez e clareza
"""
import os
import datetime
import pytz
from typing import List, Dict, Any, Optional
from supabase import create_client, Client
from dotenv import load_dotenv
import requests
import re

load_dotenv()


class Database:
    def __init__(self) -> None:
        url: Optional[str] = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        key: Optional[str] = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

        if not url or not key:
            print(f"❌ ERRO CRÍTICO: Variáveis do Supabase ausentes! URL: {'OK' if url else 'FALTANDO'}, KEY: {'OK' if key else 'FALTANDO'}")
            self.supabase = None
        else:
            try:
                self.supabase: Client = create_client(url, key)
            except Exception as e:
                print(f"❌ ERRO AO CRIAR CLIENTE SUPABASE: {e}")
                self.supabase = None

    def _normalize_phone(self, phone: str) -> str:
        return re.sub(r'\D', '', str(phone))

    def _get_phone_variants(self, phone: str) -> List[str]:
        """
        Gera variações do número para lidar com o nono dígito brasileiro.
        """
        clean = self._normalize_phone(phone)
        variants = [clean]
        if clean.startswith("55") and len(clean) == 13:
            variants.append(clean[:4] + clean[5:])
        elif clean.startswith("55") and len(clean) == 12:
            variants.append(clean[:4] + "9" + clean[4:])
        return variants

    def get_all_brokers(self) -> List[Dict[str, Any]]:
        if not self.supabase:
            return []
        try:
            response = self.supabase.table("users").select("id, name").execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"❌ Erro ao buscar corretores: {e}")
            return []

    def get_broker_data(self, user_id: str) -> Optional[Dict[str, Any]]:
        if not self.supabase:
            return None
        try:
            response = self.supabase.table("users").select(
                "name, whatsapp, creci, real_estate_agency, city, metropolitan_regions, presentation, daily_focus, daily_focus_date"
            ).eq("id", user_id).limit(1).execute()

            if not response.data:
                return None

            broker: Dict[str, Any] = response.data[0]

            # Valida o Foco Diário: só é válido se for do dia atual E dentro do expediente
            valid_focus = None
            daily_focus = broker.get('daily_focus')
            focus_date = broker.get('daily_focus_date')

            if daily_focus and focus_date:
                try:
                    tz = pytz.timezone('America/Sao_Paulo')
                    now = datetime.datetime.now(tz)
                    today_str = now.strftime('%Y-%m-%d')

                    if focus_date == today_str:
                        js_day = (now.weekday() + 1) % 7
                        sched = self.supabase.table("work_schedules").select("end_time").eq("user_id", user_id).eq("day_of_week", js_day).limit(1).execute()
                        if sched.data:
                            end_time_str = sched.data[0]['end_time']
                            if now.strftime('%H:%M:%S') <= end_time_str:
                                valid_focus = daily_focus
                except Exception as e:
                    print(f"Erro ao validar daily focus: {e}")

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
        except Exception as e:
            print(f"❌ Erro ao buscar dados do corretor {user_id}: {e}")
            return None

    def get_lead_by_phone(self, phone: str) -> Optional[Dict[str, Any]]:
        if not self.supabase:
            return None
        try:
            variants = self._get_phone_variants(phone)
            response = self.supabase.table("leads").select("*").in_("phone", variants).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"❌ Erro ao buscar lead por telefone {phone}: {e}")
            return None

    def get_broker_by_lead_phone(self, phone: str) -> Optional[Dict[str, Any]]:
        lead = self.get_lead_by_phone(phone)
        if not lead:
            return None
        broker_data = self.get_broker_data(lead['user_id'])
        if not broker_data:
            return None

        broker_data["lead_id"] = lead.get('id')
        broker_data["lead_name"] = lead.get('name', 'Cliente')
        broker_data["lead_phone"] = lead.get('phone', '')
        broker_data["lead_notes"] = lead.get('notes', '')
        return broker_data

    def get_chat_history(self, lead_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        if not self.supabase:
            return []
        try:
            response = self.supabase.table("conversations")\
                .select("role, content")\
                .eq("lead_id", lead_id)\
                .order("sent_at", desc=True)\
                .limit(limit)\
                .execute()
            return response.data[::-1] if response.data else []
        except Exception as e:
            print(f"❌ Erro ao buscar histórico do lead {lead_id}: {e}")
            return []

    def update_lead_status(self, phone: str, status: str) -> None:
        if not self.supabase:
            return
        try:
            now_iso = datetime.datetime.now(pytz.UTC).isoformat()
            data: Dict[str, Any] = {"status": status, "updated_at": now_iso}
            if status == "active":
                data["follow_up_count"] = 0
                data["next_follow_up_at"] = None
            self.supabase.table("leads").update(data).eq("phone", phone).execute()
        except Exception as e:
            print(f"❌ Erro ao atualizar status do lead {phone}: {e}")

    def update_lead_temperature(self, phone: str, temperature: str) -> None:
        if not self.supabase:
            return
        try:
            now_iso = datetime.datetime.now(pytz.UTC).isoformat()
            self.supabase.table("leads").update({
                "temperature": temperature,
                "updated_at": now_iso
            }).eq("phone", phone).execute()
        except Exception as e:
            print(f"❌ Erro ao atualizar temperatura do lead {phone}: {e}")

    def schedule_follow_up(self, phone: str, schedule_str: str) -> None:
        if not self.supabase:
            return
        try:
            tz = pytz.timezone('America/Sao_Paulo')
            dt = datetime.datetime.strptime(schedule_str, "%Y-%m-%d %H:%M")
            dt = tz.localize(dt)
            self.supabase.table("leads").update({
                "status": "scheduled",
                "next_follow_up_at": dt.isoformat(),
                "follow_up_count": 0
            }).eq("phone", phone).execute()
        except Exception as e:
            print(f"❌ Erro ao agendar follow-up para {phone} ({schedule_str}): {e}")

    def set_lead_transfer_time(self, phone: str) -> None:
        if not self.supabase:
            return
        try:
            now_iso = datetime.datetime.now(pytz.UTC).isoformat()
            self.supabase.table("leads").update({"transferred_at": now_iso}).eq("phone", phone).execute()
        except Exception as e:
            print(f"❌ Erro ao marcar tempo de transferência para {phone}: {e}")

    def add_broker_notification(self, user_id: str, lead_id: str, message: str) -> None:
        if not self.supabase:
            return
        try:
            self.supabase.table("broker_notifications").insert({
                "user_id": user_id,
                "lead_id": lead_id,
                "message": message,
                "status": "unread"
            }).execute()
        except Exception as e:
            print(f"❌ Erro ao salvar notificação: {e}")

    def confirm_hot_lead(self, broker_phone: str) -> bool:
        if not self.supabase:
            return False
        try:
            variants = self._get_phone_variants(broker_phone)
            broker = self.supabase.table("users").select("id").in_("whatsapp", variants).execute()
            if not broker.data:
                return False
            user_id = broker.data[0]['id']

            pending = self.supabase.table("leads").select("id")\
                .eq("user_id", user_id)\
                .in_("status", ["hot_alert_sent", "hot_alert_retry", "hot_alert_final"])\
                .execute()

            if not pending.data:
                return False

            self.supabase.table("leads").update({"status": "transferred"})\
                .eq("user_id", user_id)\
                .in_("status", ["hot_alert_sent", "hot_alert_retry", "hot_alert_final"])\
                .execute()

            self.supabase.table("broker_notifications").update({"status": "read"})\
                .eq("user_id", user_id)\
                .eq("status", "unread")\
                .execute()

            return True
        except Exception as e:
            print(f"❌ Erro ao confirmar lead quente: {e}")
            return False

    def find_pending_hot_alerts(self, minutes: int = 5) -> List[Dict[str, Any]]:
        if not self.supabase:
            return []
        try:
            tz = pytz.timezone('America/Sao_Paulo')
            limit_time = (datetime.datetime.now(tz) - datetime.timedelta(minutes=minutes)).isoformat()
            response = self.supabase.table("leads")\
                .select("*")\
                .in_("status", ["hot_alert_sent", "hot_alert_retry"])\
                .lt("transferred_at", limit_time)\
                .execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"❌ Erro ao buscar alertas quentes pendentes: {e}")
            return []

    def find_leads_for_followup(self, hours: int = 24) -> List[Dict[str, Any]]:
        if not self.supabase:
            return []
        try:
            threshold = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=hours)
            response = self.supabase.table("leads")\
                .select("*")\
                .eq("status", "active")\
                .lt("updated_at", threshold.isoformat())\
                .execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"❌ Erro ao buscar leads para follow-up: {e}")
            return []

    def save_message(self, lead_id: str, user_id: str, role: str, content: str) -> None:
        if not self.supabase or not lead_id or not user_id:
            return
        try:
            self.supabase.table("conversations").insert({
                "lead_id": lead_id,
                "user_id": user_id,
                "role": role,
                "content": content
            }).execute()
            now_iso = datetime.datetime.now(pytz.UTC).isoformat()
            self.supabase.table("leads").update({"updated_at": now_iso}).eq("id", lead_id).execute()
        except Exception as e:
            print(f"❌ Erro ao salvar mensagem: {e}")

    def is_registered_broker(self, phone: str) -> bool:
        if not self.supabase:
            return False
        try:
            variants = self._get_phone_variants(phone)
            # Também testa sem e com o código 55
            clean = self._normalize_phone(phone)
            if clean.startswith("55"):
                variants.append(clean[2:])
            else:
                variants.append("55" + clean)
            # Remove duplicatas
            variants = list(set(variants))
            response = self.supabase.table("users").select("id").in_("whatsapp", variants).execute()
            return len(response.data) > 0 if response.data else False
        except Exception as e:
            print(f"❌ Erro ao verificar corretor: {e}")
            return False

    def add_to_ranking(self, user_id: str, lead_id: str, summary: str, highlights: str) -> None:
        if not self.supabase:
            return
        try:
            self.supabase.rpc("increment_lead_ranks", {"p_user_id": user_id}).execute()
            self.supabase.table("best_leads_ranking").insert({
                "user_id": user_id,
                "lead_id": lead_id,
                "rank": 1,
                "lead_summary": summary,
                "interaction_highlights": highlights
            }).execute()
            self.supabase.table("best_leads_ranking").delete().eq("user_id", user_id).gt("rank", 100).execute()
        except Exception as e:
            print(f"❌ Erro ao atualizar ranking: {e}")

    def get_top_ranking_cases(self, user_id: str, limit: int = 5) -> str:
        if not self.supabase:
            return "Ainda não há casos modelo salvos."
        try:
            response = self.supabase.table("best_leads_ranking")\
                .select("lead_summary, interaction_highlights")\
                .eq("user_id", user_id)\
                .order("rank", desc=False)\
                .limit(limit)\
                .execute()

            if response.data:
                cases = [f"EXEMPLO {i+1}:\nPerfil: {d['lead_summary']}\nDestaque: {d['interaction_highlights']}"
                         for i, d in enumerate(response.data)]
                return "\n\n".join(cases)
            return "Ainda não há casos modelo salvos para este corretor."
        except Exception as e:
            print(f"❌ Erro ao buscar ranking: {e}")
            return "Ainda não há casos modelo salvos."

    def add_mistake_log(self, user_id: str, lead_id: str, error_context: str, user_correction: str, lesson: str) -> None:
        if not self.supabase:
            return
        try:
            self.supabase.table("ai_mistakes_log").insert({
                "user_id": user_id,
                "lead_id": lead_id,
                "error_context": error_context,
                "user_correction": user_correction,
                "lesson_learned": lesson
            }).execute()
        except Exception as e:
            print(f"❌ Erro ao registrar erro da IA: {e}")

    def get_recent_lessons(self, user_id: str, limit: int = 5) -> str:
        if not self.supabase:
            return "Nenhum erro registrado ainda."
        try:
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
        except Exception as e:
            print(f"❌ Erro ao buscar lições: {e}")
            return "Nenhum erro registrado ainda."

    def get_portfolio(self, user_id: str) -> str:
        if not self.supabase:
            return "Portfólio indisponível no momento."
        try:
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
                    if url:
                        item.append(f"Link do Empreendimento: {url}")

                    photos = l.get('photos', [])
                    if photos:
                        item.append(f"Fotos: {photos}")

                    units = l.get('launch_units', [])
                    if units:
                        item.append("UNIDADES/PLANTAS DISPONÍVEIS:")
                        for u in units:
                            u_info = f"- {u.get('name', 'Planta')}: {u.get('area_sqm', '')}m², {u.get('bedrooms', 0)} dorms, R$ {u.get('price', 'Sob consulta')}"
                            if u.get('minha_casa_minha_vida'):
                                u_info += " (MCMV)"
                            item.append(u_info)

                    portfolio_parts.append("\n".join(item) + "\n\n")

            return "".join(portfolio_parts) if portfolio_parts else "Nenhum lançamento cadastrado no portfólio."
        except Exception as e:
            print(f"❌ Erro ao buscar portfólio do corretor {user_id}: {e}")
            return "Portfólio indisponível no momento."

    def get_broker_schedule(self, user_id: str) -> List[Dict[str, Any]]:
        if not self.supabase:
            return []
        try:
            response = self.supabase.table("work_schedules")\
                .select("day_of_week, start_time, end_time, is_active")\
                .eq("user_id", user_id)\
                .execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"❌ Erro ao buscar expediente do corretor {user_id}: {e}")
            return []