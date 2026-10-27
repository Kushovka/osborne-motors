import base64
import hashlib
import hmac
import json
import time

from app.core.config import settings

TICKET_TTL_SECONDS = 15 * 60


def _signature(value: str) -> str:
    return hmac.new(settings.META_ACCESS_TOKEN.encode("utf-8"), value.encode("utf-8"), hashlib.sha256).hexdigest()


def create_capi_ticket(lead_id: str, event_id: str | None, test_event_code: str | None = None) -> str | None:
    if not settings.META_PIXEL_ID or not settings.META_ACCESS_TOKEN or not event_id:
        return None
    payload = json.dumps({
        "lead_id": lead_id,
        "event_id": event_id,
        "test_event_code": test_event_code,
        "expires_at": int(time.time()) + TICKET_TTL_SECONDS,
    }, separators=(",", ":")).encode("utf-8")
    encoded = base64.urlsafe_b64encode(payload).decode("ascii").rstrip("=")
    return f"{encoded}.{_signature(encoded)}"


def verify_capi_ticket(ticket: str, lead_id: str, event_id: str, test_event_code: str | None = None) -> bool:
    if not settings.META_ACCESS_TOKEN:
        return False
    try:
        encoded, supplied_signature = ticket.split(".", 1)
        if not hmac.compare_digest(supplied_signature, _signature(encoded)):
            return False
        payload_bytes = base64.urlsafe_b64decode(encoded + "=" * (-len(encoded) % 4))
        payload = json.loads(payload_bytes)
        now = int(time.time())
        return (
            payload.get("lead_id") == lead_id
            and payload.get("event_id") == event_id
            and payload.get("test_event_code") == test_event_code
            and now <= int(payload.get("expires_at", 0)) <= now + TICKET_TTL_SECONDS + 5
        )
    except (ValueError, TypeError, json.JSONDecodeError):
        return False
