from fastapi import APIRouter, Request, status

from app.schemas.event import ContactActionCreate
from app.services.meta_capi import send_contact_action_event


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
    send_contact_action_event(payload)
    return {"status": "ok"}
