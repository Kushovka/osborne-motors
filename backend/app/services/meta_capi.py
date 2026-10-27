import hashlib
import json
import logging
from datetime import datetime, timezone
from urllib import request
from urllib.error import HTTPError, URLError

from app.core.config import settings
from app.models.lead import Lead
from app.models.vehicle import Vehicle
from app.schemas.event import ContactActionCreate

logger = logging.getLogger("uvicorn.error")


def _normalize(value: str | None) -> str | None:
    if not value:
        return None

    return value.strip().lower()


def _hash(value: str | None) -> str | None:
    normalized = _normalize(value)
    if not normalized:
        return None

    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def _split_name(name: str) -> tuple[str | None, str | None]:
    parts = [part for part in name.strip().split(" ") if part]
    if not parts:
        return None, None

    first = parts[0]
    last = parts[-1] if len(parts) > 1 else None
    return first, last


def _clean(data: dict) -> dict:
    return {key: value for key, value in data.items() if value not in (None, "", [])}


def _hash_phone(value: str | None) -> str | None:
    if not value:
        return None
    digits = "".join(character for character in value if character.isdigit())
    if len(digits) == 10:
        digits = f"1{digits}"
    return hashlib.sha256(digits.encode("utf-8")).hexdigest() if digits else None


def _post_to_meta(events: list[dict], test_event_code: str | None = None) -> tuple[bytes, int, str]:
    if not settings.META_PIXEL_ID or not settings.META_ACCESS_TOKEN:
        return json.dumps({"error": "Meta CAPI is not configured"}).encode("utf-8"), 503, "application/json"
    payload: dict = {"data": events, "access_token": settings.META_ACCESS_TOKEN}
    if test_event_code:
        payload["test_event_code"] = test_event_code
    api_request = request.Request(
        f"https://graph.facebook.com/{settings.META_GRAPH_API_VERSION}/{settings.META_PIXEL_ID}/events",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "Accept": "application/json"}, method="POST",
    )
    try:
        with request.urlopen(api_request, timeout=5) as response:
            return response.read(), response.status, response.headers.get_content_type()
    except HTTPError as error:
        return error.read(), error.code, error.headers.get_content_type() if error.headers else "application/json"
    except (URLError, TimeoutError, OSError):
        logger.exception("Meta CAPI request failed before a response was received")
        return json.dumps({"error": "Could not reach Meta Conversions API"}).encode("utf-8"), 502, "application/json"


def send_lead_event(
    lead: Lead,
    vehicle: Vehicle | None,
    *,
    event_id: str,
    event_source_url: str,
    fbp: str | None,
    fbc: str | None,
    client_ip_address: str | None,
    client_user_agent: str | None,
    test_event_code: str | None,
) -> tuple[bytes, int, str]:
    first_name, last_name = _split_name(lead.customer_name)
    user_data = _clean({
        "ph": [_hash_phone(lead.phone)] if lead.phone else None,
        "em": [_hash(lead.email)] if lead.email else None,
        "fn": [_hash(first_name)] if first_name else None,
        "ln": [_hash(last_name)] if last_name else None,
        "zp": [_hash(lead.zip_code)] if lead.zip_code else None,
        "external_id": [_hash(lead.id)],
        "fbp": fbp,
        "fbc": fbc,
        "client_user_agent": client_user_agent,
        "client_ip_address": client_ip_address,
    })
    custom_data = {
        "content_ids": [vehicle.stock_number or vehicle.id] if vehicle else [f"osborne-motors-{lead.lead_type}"],
        "content_type": "product" if vehicle else "service",
        "currency": "USD",
        "value": vehicle.price if vehicle else 0,
    }
    event = _clean({
        "event_name": "Lead",
        "event_time": int(datetime.now(timezone.utc).timestamp()),
        "event_source_url": event_source_url,
        "action_source": "website",
        "event_id": event_id,
        "user_data": user_data,
        "custom_data": custom_data,
    })
    return _post_to_meta([event], test_event_code)


def send_contact_action_event(payload: ContactActionCreate) -> tuple[bytes, int, str]:
    if not settings.META_PIXEL_ID or not settings.META_ACCESS_TOKEN:
        logger.warning("Meta CAPI contact event skipped: META_PIXEL_ID or META_ACCESS_TOKEN is missing")
        return json.dumps({"error": "Meta CAPI is not configured"}).encode("utf-8"), 503, "application/json"

    user_data = _clean({
        "fbp": payload.fbp,
        "fbc": payload.fbc,
        "client_user_agent": payload.user_agent,
        "client_ip_address": payload.client_ip_address,
    })

    custom_data = _clean({
        "content_ids": [payload.content_name or payload.action_type],
        "content_type": "service",
        "action_type": payload.action_type,
        "content_name": payload.content_name,
        "source_page": payload.source_page,
        "lead_type": "phone_call" if payload.action_type == "phone_click" else None,
    })

    event = _clean({
        "event_name": "Lead" if payload.action_type == "phone_click" else "Contact",
        "event_time": int(datetime.now(timezone.utc).timestamp()),
        "event_source_url": payload.event_source_url,
        "action_source": "website",
        "event_id": payload.meta_event_id,
        "user_data": user_data,
        "custom_data": custom_data,
    })

    return _post_to_meta([event])
