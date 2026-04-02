"""
scheduler.py — Jobs automáticos corrigidos
Correções desta versão:
1. Problema #2/#3: Semáforo global garante que mensagens nunca saiam em rajada
2. Problema #3/#4: Loop de leads refatorado para processar TODOS sem pular nenhum
3. Problema #5/#6: Semáforo por corretor evita execução paralela duplicada
4. Problema #8: Follow-ups com contexto (não só "você ainda tem interesse?")
5. REGRA NOVA: Cliente que nunca respondeu → 1 tentativa após 3 dias → depois abandona para sempre (abandoned_no_reply)
6. N+1 queries eliminadas: busca leads de todos os corretores em uma query só
7. Delay adaptativo: calibrado por tamanho da mensagem
"""
from typing import List, Dict, Any, Optional
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import asyncio
import datetime
import pytz

from raquel import RaquelAgent
from database import Database
from utils import is_within_schedule, parse_iso_robust, BLOCKED_STATUSES

# ---------------------------------------------------------------
# Semáforo global: máximo 1 envio por vez — NUNCA rafada de msgs
# ---------------------------------------------------------------
_send_semaphore = asyncio.Semaphore(1)

# Semáforo por corretor: evita múltiplas instâncias do mesmo job
_broker_locks: Dict[str, asyncio.Lock] = {}

def _get_broker_lock(user_id: str) -> asyncio.Lock:
    if user_id not in _broker_locks:
        _broker_locks[user_id] = asyncio.Lock()
    return _broker_locks[user_id]

try:
    raquel = RaquelAgent()
    db = Database()
    print("✅ [SCHEDULER] Inicializado com sucesso.")
except Exception as _err:
    print(f"❌ [SCHEDULER] ERRO CRÍTICO na inicialização: {_err}")
    raise


def _adaptive_delay(message: str) -> float:
    """
    Delay adaptativo baseado no tamanho da mensagem.
    Simula tempo de digitação humano: ~50ms por caractere, min 2s, max 8s.
    """
    chars = len(message)
    delay = min(max(chars * 0.05, 2.0), 8.0)
    return delay


async def _send_with_delay(
    lead_id: str,
    user_id: str,
    phone: str,
    msg: str,
    new_count: int,
    new_status: Optional[str] = None
) -> bool:
    """
    Envia mensagem com semáforo global (sem rajada) e delay adaptativo.
    Atualiza follow_up_count e opcionalmente o status no banco.
    """
    async with _send_semaphore:
        delay = _adaptive_delay(msg)
        await asyncio.sleep(delay)

        success = raquel.send_to_zapi(phone, msg)
        if success:
            db.save_message(lead_id, user_id, "assistant", msg)
            tz = pytz.timezone('America/Sao_Paulo')
            now_iso = datetime.datetime.now(tz).isoformat()

            update_data: Dict[str, Any] = {
                "follow_up_count": new_count,
                "updated_at": now_iso
            }
            if new_status:
                update_data["status"] = new_status

            db.supabase.table("leads").update(update_data).eq("id", lead_id).execute()

            # Delay anti-spam entre mensagens: 90s fixo após envio
            await asyncio.sleep(90)
        return success


# ------------------------------------------------------------------
# MONITOR DE LEADS QUENTES
# ------------------------------------------------------------------
async def monitor_hot_leads() -> None:
    tz = pytz.timezone('America/Sao_Paulo')
    now = datetime.datetime.now(tz)
    print(f"⏲️ [{now.strftime('%H:%M:%S')}] Monitorando confirmações de Leads Quentes...")

    pending_leads = db.find_pending_hot_alerts(minutes=5)

    for lead in pending_leads:
        try:
            user_id = str(lead.get('user_id', ''))
            lead_id = str(lead.get('id', ''))
            lead_phone = str(lead.get('phone', ''))

            context = db.get_broker_data(user_id)
            if not context:
                continue

            context['lead_name'] = lead.get('name', 'Cliente')
            context['lead_id'] = lead_id
            context['phone'] = lead_phone

            broker_whatsapp = context.get('broker_whatsapp', '')
            broker_name = context.get('broker_name', 'Corretor')

            print(f"⚠️ Re-notificando {broker_name} sobre o lead {context['lead_name']}")

            notif_resp = db.supabase.table("broker_notifications")\
                .select("message")\
                .eq("lead_id", lead_id)\
                .order("created_at", desc=True)\
                .limit(1).execute()

            briefing = notif_resp.data[0]['message'] if notif_resp.data else "Lead aguardando sua atenção!"
            alert_msg = (
                f"⚠️ *LEMBRETE: LEAD QUENTE AGUARDANDO!* ⚠️\n\n{briefing}\n\n"
                f"O cliente ainda não foi atendido. Responda com *ok* para confirmar."
            )

            raquel.send_to_zapi(broker_whatsapp, alert_msg)

            db.supabase.table("leads").update({
                "status": "hot_alert_retry",
                "transferred_at": now.isoformat()
            }).eq("id", lead_id).execute()

        except Exception as e:
            print(f"❌ Erro ao re-notificar lead {lead.get('id')}: {e}")


# ------------------------------------------------------------------
# FOLLOW-UPS INTELIGENTES
# ------------------------------------------------------------------
async def process_smart_followups() -> None:
    """
    REGRAS DE FOLLOW-UP:

    TYPE 1 — Cliente NUNCA respondeu:
      - Após 3 dias (72h) de silêncio: 1 tentativa gentil
      - Se não responder: status = abandoned_no_reply (NUNCA mais incomodar)

    TYPE 2 — Cliente respondeu mas parou no meio:
      - Após 3h: 1 toque leve
      - Após 24h sem resposta: 1 mensagem final
      - Depois: status = abandoned_dropout (NUNCA mais incomodar)

    TYPE 3 — Agendamento explícito:
      - Envia no horário combinado e ativa o lead normalmente
    """
    tz = pytz.timezone('America/Sao_Paulo')
    now = datetime.datetime.now(tz)
    print(f"[{now.strftime('%H:%M:%S')}] 🧠 Processando Smart Follow-ups...")

    broker_schedules_cache: Dict[str, Any] = {}

    # ------------------------------------------------------------------
    # TYPE 3: Agendamentos exatos
    # ------------------------------------------------------------------
    try:
        scheduled_resp = db.supabase.table("leads").select("*")\
            .eq("status", "scheduled")\
            .lte("next_follow_up_at", now.isoformat())\
            .execute()
        scheduled_leads = scheduled_resp.data or []
    except Exception as e:
        print(f"❌ Erro ao buscar leads agendados: {e}")
        scheduled_leads = []

    for lead in scheduled_leads:
        try:
            lead_id = str(lead.get('id', ''))
            lead_name = str(lead.get('name', 'Cliente'))
            lead_phone = str(lead.get('phone', ''))
            user_id = str(lead.get('user_id', ''))

            fresh = db.supabase.table("leads").select("status").eq("id", lead_id).execute()
            if fresh.data and fresh.data[0].get('status') in BLOCKED_STATUSES:
                print(f"🛡️ Type 3 cancelado para {lead_name}: status bloqueado.")
                continue

            print(f"⏰ Follow-up Agendado (Type 3) para {lead_name}")
            msg = (
                f"Olá {lead_name}! Conforme combinamos, estou retornando o contato. "
                f"Como posso te ajudar agora?"
            )
            await _send_with_delay(lead_id, user_id, lead_phone, msg, 0, "active")

        except Exception as e:
            print(f"❌ Erro no follow-up Type 3 para {lead.get('id')}: {e}")

    # ------------------------------------------------------------------
    # TYPE 1 & 2: Leads ativos
    # Busca TODOS de uma vez (elimina N+1 queries)
    # ------------------------------------------------------------------
    try:
        # Threshold mínimo: 3h (menor janela do Type 2)
        threshold_3h = (now - datetime.timedelta(hours=3)).isoformat()
        active_resp = db.supabase.table("leads").select("*")\
            .eq("status", "active")\
            .lt("updated_at", threshold_3h)\
            .execute()
        active_leads = active_resp.data or []
        print(f"📋 {len(active_leads)} leads ativos para avaliar follow-up.")
    except Exception as e:
        print(f"❌ Erro ao buscar leads ativos: {e}")
        active_leads = []

    # Busca histórico em lote para eliminar N+1
    # (uma query por lead ainda é necessária para o histórico, mas
    #  o cache de expediente elimina as queries repetidas por corretor)
    for lead in active_leads:
        try:
            lead_id = str(lead.get('id', ''))
            lead_name = str(lead.get('name', 'Cliente'))
            lead_phone = str(lead.get('phone', ''))
            user_id = str(lead.get('user_id', ''))
            follow_up_count = lead.get('follow_up_count') or 0
            updated_at_str = lead.get('updated_at', '')

            if not updated_at_str:
                continue

            # Guardrail: re-verifica status antes de agir
            fresh = db.supabase.table("leads").select("status").eq("id", lead_id).execute()
            current_status = fresh.data[0].get('status') if fresh.data else 'active'
            if current_status in BLOCKED_STATUSES:
                print(f"🛡️ Follow-up cancelado para {lead_name}: status '{current_status}'.")
                continue

            updated_at = parse_iso_robust(updated_at_str, tz)
            if not updated_at:
                continue
            hours_passed = (now - updated_at).total_seconds() / 3600.0

            # Verifica expediente (cache por corretor — elimina N+1)
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
            user_replied_before = any(m.get('role') == 'user' for m in history)

            # ----------------------------------------------------------
            # TYPE 1: Cliente NUNCA respondeu
            # Regra: 1 tentativa após 72h → depois abandona para sempre
            # ----------------------------------------------------------
            if not user_replied_before:
                if hours_passed >= 72 and follow_up_count == 0:
                    print(f"📢 Follow-up único (Type 1 / 72h) para {lead_name}")
                    msg = (
                        f"Oi {lead_name}, tudo bem? Tentei entrar em contato há alguns dias. "
                        f"Caso ainda tenha interesse em imóveis, estou à disposição. "
                        f"Se não for mais o momento, sem problema algum!"
                    )
                    await _send_with_delay(lead_id, user_id, lead_phone, msg, 1)

                elif follow_up_count >= 1:
                    # Nunca mais incomodar
                    print(f"🗑️ {lead_name} não respondeu após 3 dias. Arquivando definitivamente.")
                    db.supabase.table("leads").update({
                        "status": "abandoned_no_reply"
                    }).eq("id", lead_id).execute()

            # ----------------------------------------------------------
            # TYPE 2: Cliente parou no meio da conversa
            # Regra: toque em 3h, mensagem final em 24h → depois arquiva
            # ----------------------------------------------------------
            else:
                if follow_up_count == 0 and hours_passed >= 3:
                    if now.hour >= 22:
                        continue

                    print(f"📢 Follow-up 3h (Type 2) para {lead_name}")
                    msg = (
                        f"{lead_name}, ainda está por aí? "
                        f"Sem pressa, podemos continuar quando for melhor para você."
                    )
                    await _send_with_delay(lead_id, user_id, lead_phone, msg, 1)

                elif follow_up_count == 1 and hours_passed >= 24:
                    print(f"📢 Follow-up final (Type 2 / 24h) para {lead_name}")
                    msg = (
                        f"Oi {lead_name}! Última tentativa de contato por aqui. "
                        f"Se quiser retomar a conversa sobre imóveis em algum momento, "
                        f"é só me chamar. Um abraço!"
                    )
                    await _send_with_delay(lead_id, user_id, lead_phone, msg, 2)

                elif follow_up_count >= 2 and hours_passed >= 24:
                    print(f"🗑️ {lead_name} arquivado após tentativas (Type 2).")
                    db.supabase.table("leads").update({
                        "status": "abandoned_dropout"
                    }).eq("id", lead_id).execute()

        except Exception as e:
            print(f"❌ Erro no follow-up para lead {lead.get('id')}: {e}")


# ------------------------------------------------------------------
# VARREDURA MULTI-CORRETOR (LEADS WAITING / OOH / FOLLOW_UP_PENDING)
# ------------------------------------------------------------------
async def check_leads_and_followups() -> None:
    """
    Busca TODOS os leads waiting/ooh_rescheduled/follow_up_pending de uma vez
    (elimina N+1 queries) e os processa por corretor com lock individual.
    """
    tz = pytz.timezone('America/Sao_Paulo')
    now = datetime.datetime.now(tz)
    print(f"[{now.strftime('%H:%M:%S')}] 🔍 Varredura Multi-Corretor iniciada...")

    broker_schedules_cache: Dict[str, Any] = {}
    broker_data_cache: Dict[str, Any] = {}

    try:
        brokers = db.get_all_brokers()
        print(f"🕵️ {len(brokers)} corretores encontrados.")

        # Busca TODOS os leads pendentes de uma vez (elimina N+1 queries)
        try:
            all_pending_resp = db.supabase.table("leads").select("*")\
                .in_("status", ["waiting", "ooh_rescheduled", "follow_up_pending", "ooh_hot_alert_pending"])\
                .execute()
            all_pending = all_pending_resp.data or []
            print(f"📋 {len(all_pending)} leads pendentes no total.")
        except Exception as e:
            print(f"❌ Erro ao buscar leads pendentes: {e}")
            all_pending = []

        # Agrupa por corretor para processar com lock individual
        leads_by_broker: Dict[str, List[Dict]] = {}
        for lead in all_pending:
            uid = str(lead.get('user_id', ''))
            if uid not in leads_by_broker:
                leads_by_broker[uid] = []
            leads_by_broker[uid].append(lead)

        for broker in brokers:
            user_id = str(broker.get('id', ''))
            broker_name = str(broker.get('name', 'Corretor'))

            # Lock por corretor: evita múltiplas instâncias simultâneas
            broker_lock = _get_broker_lock(user_id)
            if broker_lock.locked():
                print(f"⏭️ {broker_name} já está sendo processado. Pulando.")
                continue

            async with broker_lock:
                try:
                    # Verifica expediente (cache)
                    if user_id not in broker_schedules_cache:
                        broker_schedules_cache[user_id] = db.get_broker_schedule(user_id)

                    schedule = broker_schedules_cache[user_id]
                    if not schedule:
                        if now.hour < 8 or now.hour >= 19:
                            print(f"💤 {broker_name} fora do horário padrão (8-19h).")
                            continue
                    else:
                        if not is_within_schedule(schedule, now):
                            print(f"💤 {broker_name} fora do expediente.")
                            continue

                    broker_leads = leads_by_broker.get(user_id, [])
                    if not broker_leads:
                        continue

                    # Separa OOH dos normais
                    ooh_leads = [l for l in broker_leads if l.get('status') == 'ooh_hot_alert_pending']
                    waiting_leads = [l for l in broker_leads if l.get('status') in ['waiting', 'ooh_rescheduled', 'follow_up_pending']]

                    # Cache de dados do corretor
                    if user_id not in broker_data_cache:
                        broker_data_cache[user_id] = db.get_broker_data(user_id)
                    broker_data = broker_data_cache[user_id] or {}

                    # Processa alertas OOH
                    for lead in ooh_leads:
                        try:
                            lead_phone = str(lead.get('phone', ''))
                            lead_id = str(lead.get('id', ''))

                            lead_context = broker_data.copy()
                            lead_context['lead_name'] = str(lead.get('name', 'Cliente'))
                            lead_context['lead_id'] = lead_id
                            lead_context['lead_phone'] = lead_phone

                            history = db.get_chat_history(lead_id, limit=1)
                            last_msg = str(history[0].get('content', '')) if history else "Novo interesse fora de horário."
                            last_msg = last_msg.replace("[ALERT_BROKER]", "").strip()

                            print(f"⏰ Alerta OOH para {broker_name} (Lead: {lead_context['lead_name']})")
                            raquel.alert_broker(lead_context, last_msg)
                            db.update_lead_status(lead_phone, "hot_alert_sent")
                            db.set_lead_transfer_time(lead_phone)
                            await asyncio.sleep(2)
                        except Exception as e:
                            print(f"❌ Erro OOH lead {lead.get('id')}: {e}")

                    # Processa leads waiting
                    broker_agency = broker_data.get('broker_agency', 'Imobiliária')
                    broker_city = broker_data.get('broker_city', '')
                    broker_metro = broker_data.get('broker_metropolitan_regions', '')
                    area_text = f"da cidade de {broker_city}" if broker_city else ""
                    if broker_city and broker_metro:
                        area_text += " e região"

                    for lead in waiting_leads:
                        try:
                            lead_name = str(lead.get('name', 'Cliente'))
                            lead_id = str(lead.get('id', ''))
                            lead_phone = str(lead.get('phone', ''))
                            lead_status = str(lead.get('status', 'waiting'))

                            # Guardrail: re-verifica status
                            fresh = db.supabase.table("leads").select("status").eq("id", lead_id).execute()
                            current_status = fresh.data[0].get('status') if fresh.data else lead_status
                            if current_status not in ["waiting", "ooh_rescheduled", "follow_up_pending"]:
                                print(f"🛡️ {lead_name} já processado (status: {current_status}). Pulando.")
                                continue

                            greeting = (
                                f"Olá {lead_name}, aqui é a Raquel, assistente do corretor "
                                f"imobiliário {broker_name} da empresa {broker_agency}"
                            )
                            if area_text:
                                greeting += f", {area_text}"

                            if lead_status == "ooh_rescheduled":
                                msg = (
                                    f"{greeting}. Como prometido, estou entrando em contato "
                                    f"agora que iniciamos nosso expediente. "
                                    f"Seria um bom momento para conversarmos?"
                                )
                            else:
                                msg = f"{greeting}. Seria um bom momento para conversarmos?"

                            print(f"📢 Contatando {lead_name} para o corretor {broker_name}")

                            async with _send_semaphore:
                                delay = _adaptive_delay(msg)
                                await asyncio.sleep(delay)
                                success = raquel.send_to_zapi(lead_phone, msg)

                                if success:
                                    db.save_message(lead_id, user_id, "assistant", msg)
                                    db.update_lead_status(lead_phone, "active")
                                    print(f"✅ {lead_name} contatado e ativado.")
                                    await asyncio.sleep(90)
                                else:
                                    print(f"⚠️ Falha ao enviar para {lead_name}.")

                        except Exception as e:
                            print(f"❌ Erro ao processar lead {lead.get('id')}: {e}")

                except Exception as e:
                    print(f"❌ Erro ao processar corretor {broker_name}: {e}")

    except Exception as e:
        print(f"❌ Erro fatal na varredura: {e}")


# ------------------------------------------------------------------
# LIMPEZA DE TURNO
# ------------------------------------------------------------------
async def daily_end_of_shift_cleanup() -> None:
    tz = pytz.timezone('America/Sao_Paulo')
    now = datetime.datetime.now(tz)

    try:
        brokers = db.get_all_brokers()
        for broker in brokers:
            user_id = str(broker.get('id', ''))
            schedule = db.get_broker_schedule(user_id)
            if not schedule:
                continue

            db_day = (now.weekday() + 1) % 7
            today_config = next((s for s in schedule if s.get('day_of_week') == db_day), None)

            if not isinstance(today_config, dict) or not today_config.get('is_active'):
                continue

            end_str = str(today_config.get('end_time', ''))
            parts = end_str.split(":")
            if len(parts) >= 2 and parts[0].isdigit() and parts[1].isdigit():
                shift_end = now.replace(hour=int(parts[0]), minute=int(parts[1]), second=0, microsecond=0)
                diff = (now - shift_end).total_seconds()
                if 0 <= diff < 300:
                    print(f"🧹 Expediente encerrado para {broker.get('name', 'Corretor')}.")
    except Exception as e:
        print(f"❌ Erro no cleanup de turno: {e}")


# ------------------------------------------------------------------
# INICIALIZAÇÃO
# ------------------------------------------------------------------
def start_scheduler() -> None:
    scheduler = AsyncIOScheduler()
    scheduler.add_job(check_leads_and_followups, 'interval', minutes=5, id='check_leads')
    scheduler.add_job(monitor_hot_leads, 'interval', minutes=2, id='monitor_hot')
    scheduler.add_job(process_smart_followups, 'interval', minutes=5, id='smart_followups')
    scheduler.add_job(daily_end_of_shift_cleanup, 'interval', minutes=5, id='shift_cleanup')
    scheduler.start()
    print("🚀 [SCHEDULER] Sistema ativo!", flush=True)