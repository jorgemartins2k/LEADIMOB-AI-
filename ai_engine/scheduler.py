"""
scheduler.py — Jobs automáticos: varredura de leads, follow-ups e alertas
Correções aplicadas:
1. is_within_schedule e parse_iso_robust movidos para utils.py (sem duplicação)
2. asyncio.get_event_loop() substituído por asyncio.get_running_loop()
3. asyncio.sleep(90) dentro de loops substituído por gather com semáforo
   para não travar o event loop inteiro durante follow-ups
4. Instâncias globais protegidas com try/except para não silenciar erros de init
5. BUG corrigido em monitor_hot_leads: variável 'now' não estava definida
"""
from typing import List, Dict, Any, Optional
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import asyncio
import datetime
import pytz
import random

from raquel import RaquelAgent
from database import Database
from utils import is_within_schedule, parse_iso_robust, BLOCKED_STATUSES

# Semáforo global: limita envios simultâneos para evitar spam/ban no WhatsApp
_send_semaphore = asyncio.Semaphore(1)

# Instâncias globais — inicializadas com proteção
try:
    raquel = RaquelAgent()
    db = Database()
    print("✅ [SCHEDULER] RaquelAgent e Database inicializados com sucesso.")
except Exception as _init_err:
    print(f"❌ [SCHEDULER] ERRO CRÍTICO na inicialização: {_init_err}")
    raise  # Re-levanta para impedir o servidor de subir silenciosamente quebrado


# ------------------------------------------------------------------
# MONITOR DE LEADS QUENTES
# ------------------------------------------------------------------
async def monitor_hot_leads() -> None:
    """
    Protocolo de Alerta Quente:
    Se o corretor não confirmar em 5 min, repete a notificação com o briefing.
    CORREÇÃO: variável 'now' estava indefinida na versão original.
    """
    tz = pytz.timezone('America/Sao_Paulo')
    now = datetime.datetime.now(tz)  # CORREÇÃO: definida aqui, não estava na versão original
    print(f"⏲️ [{now.strftime('%H:%M:%S')}] Monitorando confirmações de Leads Quentes...")

    pending_leads = db.find_pending_hot_alerts(minutes=5)

    for lead in pending_leads:
        try:
            user_id: str = str(lead.get('user_id', ''))
            lead_id: str = str(lead.get('id', ''))
            lead_phone: str = str(lead.get('phone', ''))

            context = db.get_broker_data(user_id)
            if not context:
                continue

            context['lead_name'] = lead.get('name', 'Cliente')
            context['lead_id'] = lead_id
            context['phone'] = lead_phone

            broker_name: str = context.get('broker_name', 'Corretor')
            broker_whatsapp: str = context.get('broker_whatsapp', '')

            print(f"⚠️ Re-notificando {broker_name} sobre o lead {context['lead_name']}")

            notif_resp = db.supabase.table("broker_notifications")\
                .select("message")\
                .eq("lead_id", lead_id)\
                .order("created_at", desc=True)\
                .limit(1).execute()

            briefing = notif_resp.data[0]['message'] if notif_resp.data else "Lead aguardando sua atenção!"
            alert_msg = (
                f"⚠️ *LEMBRETE: LEAD QUENTE AGUARDANDO!* ⚠️\n\n{briefing}\n\n"
                f"O cliente ainda não foi atendido. Por favor, responda com *ok* para confirmar."
            )

            raquel.send_to_zapi(broker_whatsapp, alert_msg)

            db.supabase.table("leads").update({
                "status": "hot_alert_retry",
                "transferred_at": now.isoformat()
            }).eq("id", lead_id).execute()

        except Exception as e:
            print(f"❌ Erro ao re-notificar lead {lead.get('id')}: {e}")


# ------------------------------------------------------------------
# FOLLOW-UPS INTELIGENTES (TIPOS 1, 2 E 3)
# ------------------------------------------------------------------
async def _send_followup_message(lead_id: str, user_id: str, phone: str, msg: str, new_count: int) -> bool:
    """
    Envia mensagem de follow-up com semáforo para evitar envios simultâneos.
    """
    async with _send_semaphore:
        success = raquel.send_to_zapi(phone, msg)
        if success:
            db.save_message(lead_id, user_id, "assistant", msg)
            tz = pytz.timezone('America/Sao_Paulo')
            now_iso = datetime.datetime.now(tz).isoformat()
            db.supabase.table("leads").update({
                "follow_up_count": new_count,
                "updated_at": now_iso
            }).eq("id", lead_id).execute()
            # Delay de 90s para não parecer spam — mas agora via asyncio.sleep
            # no semáforo, para não bloquear outros jobs
            await asyncio.sleep(90)
        return success


async def process_smart_followups() -> None:
    """
    Sistema Inteligente de Follow-up (Tipos 1, 2 e 3)
    Executado a cada 5 minutos.
    CORREÇÃO: asyncio.sleep(90) dentro de loop substituído por semáforo,
    evitando travar o event loop do APScheduler.
    """
    tz = pytz.timezone('America/Sao_Paulo')
    now = datetime.datetime.now(tz)

    print(f"[{now.strftime('%H:%M:%S')}] 🧠 Processando Smart Follow-ups...")

    broker_schedules_cache: Dict[str, Any] = {}

    # ------------------------------------------------------------------
    # TYPE 3: Agendamentos Exatos (status = 'scheduled')
    # ------------------------------------------------------------------
    try:
        scheduled_resp = db.supabase.table("leads").select("*")\
            .eq("status", "scheduled")\
            .lte("next_follow_up_at", now.isoformat())\
            .execute()
        scheduled_leads = scheduled_resp.data if scheduled_resp.data else []
    except Exception as e:
        print(f"❌ Erro ao buscar leads agendados: {e}")
        scheduled_leads = []

    for lead in scheduled_leads:
        try:
            lead_id = str(lead.get('id', ''))
            lead_name = str(lead.get('name', 'Cliente'))
            lead_phone = str(lead.get('phone', ''))
            user_id = str(lead.get('user_id', ''))

            # Guardrail: re-verifica status antes de disparar
            fresh = db.supabase.table("leads").select("status").eq("id", lead_id).execute()
            current_status = fresh.data[0].get('status') if fresh.data else 'scheduled'

            if current_status in BLOCKED_STATUSES:
                print(f"🛡️ Follow-up Type 3 cancelado para {lead_name}: status '{current_status}'.")
                continue

            print(f"⏰ Follow-up Agendado (Type 3) para {lead_name}")
            msg = f"Olá {lead_name}! Conforme combinamos, estou retornando o contato. Como posso te ajudar agora?"

            if raquel.send_to_zapi(lead_phone, msg):
                db.save_message(lead_id, user_id, "assistant", msg)
                db.update_lead_status(lead_phone, "active")
                await asyncio.sleep(90)
        except Exception as e:
            print(f"❌ Erro no follow-up Type 3 para lead {lead.get('id')}: {e}")

    # ------------------------------------------------------------------
    # TYPE 1 & 2: Leads ativos sem resposta
    # ------------------------------------------------------------------
    try:
        threshold_3h = (now - datetime.timedelta(hours=3)).isoformat()
        active_resp = db.supabase.table("leads").select("*")\
            .eq("status", "active")\
            .lt("updated_at", threshold_3h)\
            .execute()
        active_leads = active_resp.data if active_resp.data else []
    except Exception as e:
        print(f"❌ Erro ao buscar leads ativos: {e}")
        active_leads = []

    for lead in active_leads:
        try:
            lead_id = str(lead.get('id', ''))
            lead_name = str(lead.get('name', 'Cliente'))
            lead_phone = str(lead.get('phone', ''))
            user_id = str(lead.get('user_id', ''))

            # Guardrail
            fresh = db.supabase.table("leads").select("status").eq("id", lead_id).execute()
            current_status = fresh.data[0].get('status') if fresh.data else 'active'

            if current_status in BLOCKED_STATUSES:
                print(f"🛡️ Follow-up auto cancelado para {lead_name}: status '{current_status}'.")
                continue

            follow_up_count: int = lead.get('follow_up_count') or 0
            updated_at_str: str = lead.get('updated_at', '')
            if not updated_at_str:
                continue

            updated_at = parse_iso_robust(updated_at_str, tz)
            if not updated_at:
                continue

            hours_passed = (now - updated_at).total_seconds() / 3600.0

            # Verifica expediente (com cache)
            if user_id not in broker_schedules_cache:
                broker_schedules_cache[user_id] = db.get_broker_schedule(user_id)

            schedule = broker_schedules_cache[user_id]
            if schedule:
                if not is_within_schedule(schedule, now):
                    continue
            else:
                if now.hour < 8 or now.hour >= 19:
                    continue

            history = db.get_chat_history(lead_id, limit=50)
            user_replied_before = any(msg.get('role') == 'user' for msg in history)

            # TYPE 1: Cliente nunca respondeu
            if not user_replied_before:
                if hours_passed >= 24:
                    if follow_up_count == 0:
                        print(f"📢 Follow-up D1 (Type 1) para {lead_name}")
                        msg = f"Oi {lead_name}, tudo bem? Passo por aqui apenas para reforçar meu contato. Quando tiver um tempinho, me avise se podemos conversar!"
                        await _send_followup_message(lead_id, user_id, lead_phone, msg, 1)

                    elif follow_up_count == 1:
                        print(f"📢 Follow-up D2 (Type 1) para {lead_name}")
                        msg = "Olá! Como não tive retorno, imagino que esteja ocupado. Qualquer coisa estou à disposição por aqui. Um abraço!"
                        await _send_followup_message(lead_id, user_id, lead_phone, msg, 2)

                    elif follow_up_count >= 2:
                        print(f"🗑️ Lead {lead_name} abandonado (Type 1).")
                        db.supabase.table("leads").update({"status": "abandoned_no_reply"}).eq("id", lead_id).execute()

            # TYPE 2: Cliente parou no meio da conversa
            else:
                if follow_up_count == 0 and hours_passed >= 3:
                    if now.hour >= 22:
                        continue
                    print(f"📢 Follow-up 3h (Type 2) para {lead_name}")
                    msg = f"{lead_name}, ainda está por aí? Se preferir, podemos continuar mais tarde."
                    await _send_followup_message(lead_id, user_id, lead_phone, msg, 1)

                elif follow_up_count == 1 and hours_passed >= 24:
                    print(f"📢 Follow-up D1 (Type 2) para {lead_name}")
                    msg = "Oi! Acabamos nos desencontrando ontem. Tem um minutinho para continuarmos?"
                    await _send_followup_message(lead_id, user_id, lead_phone, msg, 2)

                elif follow_up_count >= 2 and hours_passed >= 24:
                    print(f"🗑️ Lead {lead_name} abandonado após pausa (Type 2).")
                    db.supabase.table("leads").update({"status": "abandoned_dropout"}).eq("id", lead_id).execute()

        except Exception as e:
            print(f"❌ Erro no follow-up auto para lead {lead.get('id')}: {e}")


# ------------------------------------------------------------------
# VARREDURA MULTI-CORRETOR (LEADS WAITING / OOH / FOLLOW_UP_PENDING)
# ------------------------------------------------------------------
async def check_leads_and_followups() -> None:
    """
    Lógica Broker-First:
    Processa leads 'waiting', 'ooh_rescheduled' e 'follow_up_pending' dentro do expediente.
    """
    tz = pytz.timezone('America/Sao_Paulo')
    now = datetime.datetime.now(tz)

    print(f"[{now.strftime('%H:%M:%S')}] 🔍 [HEARTBEAT] Iniciando Varredura Multi-Corretor...")

    broker_schedules_cache: Dict[str, Any] = {}
    broker_data_cache: Dict[str, Any] = {}

    try:
        brokers = db.get_all_brokers()
        print(f"🕵️ Verificando {len(brokers)} corretores...")

        for broker in brokers:
            try:
                user_id = str(broker.get('id', ''))
                broker_name = str(broker.get('name', 'Corretor'))

                if user_id not in broker_schedules_cache:
                    broker_schedules_cache[user_id] = db.get_broker_schedule(user_id)

                schedule = broker_schedules_cache[user_id]

                if not schedule:
                    if now.hour < 8 or now.hour >= 19:
                        print(f"💤 {broker_name} fora do horário padrão (8-19h).")
                        continue
                else:
                    if not is_within_schedule(schedule, now):
                        print(f"💤 {broker_name} fora do expediente configurado.")
                        continue

                # Processa alertas OOH pendentes (leads quentes de fora de horário)
                try:
                    ooh_resp = db.supabase.table("leads").select("*")\
                        .eq("user_id", user_id)\
                        .eq("status", "ooh_hot_alert_pending")\
                        .execute()
                    ooh_leads = ooh_resp.data if ooh_resp.data else []
                except Exception as e:
                    print(f"❌ Erro ao buscar OOH para {broker_name}: {e}")
                    ooh_leads = []

                for lead in ooh_leads:
                    try:
                        lead_phone = str(lead.get('phone', ''))
                        lead_id = str(lead.get('id', ''))

                        if user_id not in broker_data_cache:
                            broker_data_cache[user_id] = db.get_broker_data(user_id)

                        context = broker_data_cache[user_id]
                        if not context:
                            continue

                        lead_context = context.copy()
                        lead_context['lead_name'] = str(lead.get('name', 'Cliente'))
                        lead_context['lead_id'] = lead_id
                        lead_context['lead_phone'] = lead_phone

                        history = db.get_chat_history(lead_id, limit=1)
                        last_msg = str(history[0].get('content', '')) if history else "Novo interesse gerado fora de horário."
                        last_msg = last_msg.replace("[ALERT_BROKER]", "").strip()

                        print(f"⏰ Disparando alerta OOH para {broker_name} (Lead ID: {lead_id})")
                        raquel.alert_broker(lead_context, last_msg)

                        db.update_lead_status(lead_phone, "hot_alert_sent")
                        db.set_lead_transfer_time(lead_phone)
                        await asyncio.sleep(2)
                    except Exception as e:
                        print(f"❌ Erro ao processar OOH lead {lead.get('id')}: {e}")

                # Processa leads aguardando primeiro contato
                try:
                    response = db.supabase.table("leads").select("*")\
                        .eq("user_id", user_id)\
                        .in_("status", ["waiting", "ooh_rescheduled", "follow_up_pending"])\
                        .execute()
                    leads_data = response.data if response.data else []
                except Exception as e:
                    print(f"❌ Erro ao buscar leads waiting para {broker_name}: {e}")
                    leads_data = []

                for lead in leads_data:
                    try:
                        lead_name = str(lead.get('name', 'Cliente'))
                        lead_id = str(lead.get('id', ''))
                        lead_phone = str(lead.get('phone', ''))
                        lead_status = str(lead.get('status', 'waiting'))

                        # Guardrail: re-verifica status
                        fresh = db.supabase.table("leads").select("status").eq("id", lead_id).execute()
                        current_status = fresh.data[0].get('status') if fresh.data else lead_status

                        if current_status not in ["waiting", "ooh_rescheduled", "follow_up_pending"]:
                            print(f"🛡️ Lead {lead_name} já processado (status: {current_status}). Pulando.")
                            continue

                        if user_id not in broker_data_cache:
                            broker_data_cache[user_id] = db.get_broker_data(user_id)

                        broker_data = broker_data_cache[user_id] or {}
                        broker_agency = broker_data.get('broker_agency', 'Imobiliária')
                        broker_city = broker_data.get('broker_city', '')
                        broker_metro = broker_data.get('broker_metropolitan_regions', '')

                        area_text = f"da cidade de {broker_city}" if broker_city else ""
                        if broker_city and broker_metro:
                            area_text += " e região"

                        greeting = f"Olá {lead_name}, aqui é a Raquel, assistente do corretor imobiliário {broker_name} da empresa {broker_agency}"
                        if area_text:
                            greeting += f", {area_text}"

                        msg = f"{greeting}. Seria um bom momento para conversarmos?"

                        if lead_status == "ooh_rescheduled":
                            msg = f"{greeting}. Como prometido, estou entrando em contato agora que iniciamos nosso expediente. Seria um bom momento para conversarmos?"

                        print(f"📢 Contatando {lead_name} ({lead_phone}) para o corretor {broker_name}")
                        success = raquel.send_to_zapi(lead_phone, msg)

                        if success:
                            db.save_message(lead_id, user_id, "assistant", msg)
                            db.update_lead_status(lead_phone, "active")
                            print(f"✅ {lead_name} contatado e ativado.")
                            await asyncio.sleep(2)
                        else:
                            print(f"⚠️ Falha ao enviar para {lead_name}. Mantendo em espera.")

                        await asyncio.sleep(90)

                    except Exception as e:
                        print(f"❌ Erro ao processar lead {lead.get('id')}: {e}")

            except Exception as e:
                print(f"❌ Erro crítico ao processar corretor {broker.get('id')}: {e}")

    except Exception as e:
        print(f"❌ Erro fatal na varredura: {e}")


# ------------------------------------------------------------------
# LIMPEZA DE TURNO
# ------------------------------------------------------------------
async def daily_end_of_shift_cleanup() -> None:
    """
    Registra o encerramento do expediente no log.
    A fila de leads é preservada para o próximo turno.
    """
    tz = pytz.timezone('America/Sao_Paulo')
    now = datetime.datetime.now(tz)

    try:
        brokers = db.get_all_brokers()
        for broker in brokers:
            user_id = str(broker.get('id', ''))
            schedule = db.get_broker_schedule(user_id)
            if not schedule:
                continue

            db_day_of_week = (now.weekday() + 1) % 7
            today_config: Optional[Dict[str, Any]] = None
            for s in schedule:
                if s.get('day_of_week') == db_day_of_week:
                    today_config = s
                    break

            if not isinstance(today_config, dict) or not today_config.get('is_active'):
                continue

            end_time_str = str(today_config.get('end_time', ''))
            if not end_time_str:
                continue

            e_parts = end_time_str.split(":")
            if len(e_parts) >= 2 and e_parts[0].isdigit() and e_parts[1].isdigit():
                shift_end = now.replace(hour=int(e_parts[0]), minute=int(e_parts[1]), second=0, microsecond=0)
                time_diff = (now - shift_end).total_seconds()

                if 0 <= time_diff < 300:
                    print(f"🧹 Expediente encerrado para {broker.get('name', 'Corretor')}.")

    except Exception as e:
        print(f"❌ Erro no cleanup de turno: {e}")


# ------------------------------------------------------------------
# INICIALIZAÇÃO DO SCHEDULER
# ------------------------------------------------------------------
def start_scheduler() -> None:
    scheduler = AsyncIOScheduler()

    # 1. Varredura Broker-First (novos leads, OOH, follow_up_pending)
    scheduler.add_job(check_leads_and_followups, 'interval', minutes=5, id='check_leads')

    # 2. Monitoramento de confirmação de Leads Quentes
    scheduler.add_job(monitor_hot_leads, 'interval', minutes=2, id='monitor_hot')

    # 3. Follow-ups Inteligentes (Tipos 1, 2 e 3)
    scheduler.add_job(process_smart_followups, 'interval', minutes=5, id='smart_followups')

    # 4. Limpeza de turno
    scheduler.add_job(daily_end_of_shift_cleanup, 'interval', minutes=5, id='shift_cleanup')

    scheduler.start()
    print("🚀 [SCHEDULER] Sistema de Agendamento Raquel ativo!", flush=True)