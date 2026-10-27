from urllib.parse import urlsplit

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.deps import get_db
from app.models.lead import Lead
from app.models.vehicle import Vehicle
from app.schemas.event import CapiLeadEventCreate, ContactActionCreate
from app.services.capi_ticket import verify_capi_ticket
from app.services.meta_capi import send_contact_action_event, send_lead_event


router = APIRouter(prefix="/events", tags=["events"])


def _client_ip(request: Request) -> str | None:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    if request.client:
        return request.client.host

    return None


@router.post("/contact-action", status_code=status.HTTP_202_ACCEPTED)
def contact_action(payload: ContactActionCreate, request: Request):
    payload.client_ip_address = payload.client_ip_address or _client_ip(request)
    payload.user_agent = payload.user_agent or request.headers.get("user-agent")
    body, response_status, content_type = send_contact_action_event(payload)
    return Response(content=body, status_code=response_status, media_type=content_type)


@router.post("/capi", include_in_schema=False)
def lead_capi_event(payload: CapiLeadEventCreate, request: Request, db: Session = Depends(get_db)):
    if not verify_capi_ticket(payload.capi_ticket, payload.lead_id, payload.meta_event_id, payload.test_event_code):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired CAPI ticket")

    lead = db.get(Lead, payload.lead_id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    if not lead.consent_to_contact:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Lead permission is required")
    vehicle = db.get(Vehicle, lead.vehicle_id) if lead.vehicle_id else None
    request_source = request.headers.get("referer", "")
    public_host = (urlsplit(settings.PUBLIC_SITE_URL).hostname or "").lower()
    allowed_hosts = {public_host.removeprefix("www."), f"www.{public_host.removeprefix('www.')}"} if public_host else set()
    referer = urlsplit(request_source)
    source_url = (
        request_source
        if referer.scheme == "https" and referer.hostname and referer.hostname.lower() in allowed_hosts
        else settings.PUBLIC_SITE_URL
    )
    body, response_status, content_type = send_lead_event(
        lead, vehicle, event_id=payload.meta_event_id,
        event_source_url=source_url,
        fbp=payload.fbp, fbc=payload.fbc, client_ip_address=_client_ip(request),
        client_user_agent=request.headers.get("user-agent"), test_event_code=payload.test_event_code,
    )
    return Response(content=body, status_code=response_status, media_type=content_type)
