import logging
from urllib import parse, request
from urllib.parse import urlsplit

from app.core.config import settings
from app.schemas.lead import LeadCreate

logger = logging.getLogger("uvicorn.error")


def _value(value: object | None) -> str:
    return str(value).strip() if value not in (None, "") else ""


def send_lead_to_basin(payload: LeadCreate) -> None:
    """Forward a saved lead without exposing the Basin endpoint to browsers."""
    if not settings.BASIN_FORM_ACTION:
        logger.warning("UseBasin lead forwarding skipped: BASIN_FORM_ACTION is missing")
        return

    name_parts = payload.customer_name.split(maxsplit=1)
    fields = {
        "first_name": name_parts[0] if name_parts else "",
        "last_name": name_parts[1] if len(name_parts) > 1 else "",
        "name": payload.customer_name,
        "email": _value(payload.email),
        "phone": payload.phone,
        "subject": _value(payload.subject),
        "message": _value(payload.message),
        "preferred_contact": _value(payload.preferred_contact),
        "vehicle_id": _value(payload.vehicle_id),
        "lead_type": payload.lead_type,
        "source_page": _value(payload.source_page),
    }
    body = parse.urlencode(fields).encode("utf-8")
    source_url = urlsplit(payload.event_source_url or "")
    page_path = source_url.path or "/"
    page_path = page_path.replace("\r", "").replace("\n", "")
    basin_request = request.Request(
        settings.BASIN_FORM_ACTION,
        data=body,
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
            **({"Origin": f"{source_url.scheme}://{source_url.netloc}", "Referer": f"{source_url.scheme}://{source_url.netloc}{page_path}"} if source_url.scheme and source_url.netloc else {}),
            **({"User-Agent": payload.user_agent} if payload.user_agent else {}),
        },
        method="POST",
    )

    try:
        with request.urlopen(basin_request, timeout=10) as response:
            if response.status >= 400:
                raise RuntimeError(f"UseBasin returned HTTP {response.status}")
        logger.info("Lead forwarded to UseBasin")
    except Exception:
        # The dealership database remains the source of truth if the vendor is unavailable.
        logger.exception("Could not forward lead to UseBasin")
