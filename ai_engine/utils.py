"""
utils.py — Utilitários compartilhados entre raquel.py e scheduler.py
Centraliza funções que antes estavam duplicadas nos dois arquivos.
"""
import datetime
import pytz
from typing import List, Dict, Any, Optional


def is_within_schedule(schedule: List[Dict[str, Any]], now: datetime.datetime) -> bool:
    """
    Verifica se o horário atual está dentro do expediente do corretor.
    Mon=0 no Python weekday → convertemos para o formato do banco: Dom=0, Seg=1...
    """
    db_day_of_week: int = (now.weekday() + 1) % 7

    today_config: Optional[Dict[str, Any]] = None
    for s in schedule:
        if s.get('day_of_week') == db_day_of_week:
            today_config = s
            break

    if not isinstance(today_config, dict):
        return False

    if not today_config.get('is_active'):
        return False

    try:
        def parse_time(t_str: Optional[str]) -> Optional[datetime.time]:
            if not t_str:
                return None
            parts = str(t_str).split(":")
            if len(parts) < 2:
                return None
            return datetime.datetime.strptime(f"{parts[0]}:{parts[1]}", "%H:%M").time()

        start_time = parse_time(str(today_config.get('start_time', '')))
        end_time = parse_time(str(today_config.get('end_time', '')))
        current_time = now.time()

        if start_time is None or end_time is None:
            return False

        return start_time <= current_time <= end_time
    except Exception as e:
        print(f"⚠️ Erro ao validar horário: {e}")
        return False


def parse_iso_robust(date_str: str, tz: datetime.tzinfo) -> Optional[datetime.datetime]:
    """
    Converte string ISO 8601 para datetime com timezone, tratando variações
    de microssegundos que podem falhar no fromisoformat de algumas versões do Python.
    """
    if not date_str:
        return None

    date_str = date_str.replace("Z", "+00:00")

    try:
        return datetime.datetime.fromisoformat(date_str).astimezone(tz)
    except ValueError:
        try:
            if "." in date_str:
                if "+" in date_str:
                    base, offset = date_str.split("+", 1)
                    offset = "+" + offset
                elif "-" in date_str.split("T")[1]:
                    parts = date_str.rsplit("-", 1)
                    base, offset = parts[0], "-" + parts[1]
                else:
                    base, offset = date_str, ""

                if "." in base:
                    main, fraction = base.split(".", 1)
                    fraction = (fraction + "000000")[:6]
                    date_str = f"{main}.{fraction}{offset}"

            return datetime.datetime.fromisoformat(date_str).astimezone(tz)
        except Exception:
            try:
                clean = date_str.split(".")[0].replace("T", " ")[:19]
                return datetime.datetime.strptime(clean, "%Y-%m-%d %H:%M:%S").replace(tzinfo=pytz.UTC).astimezone(tz)
            except Exception:
                return None


# Status de leads que não devem receber nenhuma ação automática
BLOCKED_STATUSES = ["completed", "transferred", "opt_out", "finalizado", "sem_interesse", "abandoned_no_reply", "abandoned_dropout"]