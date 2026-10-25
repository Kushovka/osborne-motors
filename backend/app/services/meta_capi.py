import hashlib
import json
import logging
from datetime import datetime, timezone
from urllib import request

from app.core.config import settings
from app.schemas.event import ContactActionCreate
from app.schemas.lead import LeadCreate

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


def send_lead_event(payload: LeadCreate) -> None:
    if not settings.META_PIXEL_ID or not settings.META_ACCESS_TOKEN:
        logger.warning("Meta CAPI lead event skipped: META_PIXEL_ID or META_ACCESS_TOKEN is missing")
        return

    first_name, last_name = _split_name(payload.customer_name)
    user_data = {
        "ph": [_hash(payload.phone)] if payload.phone else None,
        "em": [_hash(payload.email)] if payload.email else None,
        "fn": [_hash(first_name)] if first_name else None,
        "ln": [_hash(last_name)] if last_name else None,
        "zp": [_hash(payload.zip_code)] if payload.zip_code else None,
        "external_id": [_hash(payload.email or payload.phone)],
        "fbp": payload.fbp,
        "fbc": payload.fbc,
        "client_user_agent": payload.user_agent,
        "client_ip_address": payload.client_ip_address,
    }
    user_data = _clean(user_data)

    custom_data = _clean({
        "content_ids": payload.content_ids,
        "content_name": payload.content_name,
        "content_type": payload.content_type or "product",
        "currency": payload.currency or "USD",
        "value": payload.value,
        "lead_type": payload.lead_type,
        "vehicle_id": payload.vehicle_id,
        "source_page": payload.source_page,
    })

    event = {
        "event_name": "Lead",
        "event_time": int(datetime.now(timezone.utc).timestamp()),
        "event_source_url": payload.event_source_url,
        "action_source": "website",
        "event_id": payload.meta_event_id,
        "user_data": user_data,
        "custom_data": custom_data,
    }
    event = _clean(event)

    body = json.dumps({
        "data": [event],
        "access_token": settings.META_ACCESS_TOKEN,
    }).encode("utf-8")

    api_request = request.Request(
        f"https://graph.facebook.com/v20.0/{settings.META_PIXEL_ID}/events",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with request.urlopen(api_request, timeout=5) as response:
            response_body = response.read().decode("utf-8")
            logger.info("Meta CAPI lead event sent: %s", response_body)
    except Exception:
        logger.exception("Could not send Meta CAPI lead event")


def send_contact_action_event(payload: ContactActionCreate) -> None:
    if not settings.META_PIXEL_ID or not settings.META_ACCESS_TOKEN:
        logger.warning("Meta CAPI contact event skipped: META_PIXEL_ID or META_ACCESS_TOKEN is missing")
        return

    user_data = _clean({
        "fbp": payload.fbp,
        "fbc": payload.fbc,
        "client_user_agent": payload.user_agent,
        "client_ip_address": payload.client_ip_address,
    })

    custom_data = _clean({
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

    body = json.dumps({
        "data": [event],
        "access_token": settings.META_ACCESS_TOKEN,
    }).encode("utf-8")

    api_request = request.Request(
        f"https://graph.facebook.com/v20.0/{settings.META_PIXEL_ID}/events",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with request.urlopen(api_request, timeout=5) as response:
            response_body = response.read().decode("utf-8")
            logger.info("Meta CAPI contact event sent: %s", response_body)
    except Exception:
        logger.exception("Could not send Meta CAPI contact event")
