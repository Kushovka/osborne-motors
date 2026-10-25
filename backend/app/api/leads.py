from collections import defaultdict, deque
from time import time

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.schemas.lead import LeadCreate, LeadRead
from app.services.lead_service import create_lead

router = APIRouter(prefix="/leads", tags=["leads"])

RATE_LIMIT_MAX = 5
RATE_LIMIT_WINDOW_SECONDS = 15 * 60
MIN_FORM_SECONDS = 3
_lead_attempts: dict[str, deque[float]] = defaultdict(deque)


def _rate_limit_key(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    return (
        forwarded_for.split(",")[0].strip()
        if forwarded_for
        else request.client.host if request.client else "unknown"
    )


def _check_spam(payload: LeadCreate, request: Request) -> None:
    if payload.website:
        raise HTTPException(status_code=400, detail="Invalid request")

    now = time()
    if payload.form_started_at:
        elapsed_seconds = now - (payload.form_started_at / 1000)
        if elapsed_seconds < MIN_FORM_SECONDS:
            raise HTTPException(status_code=400, detail="Please try again.")

    key = _rate_limit_key(request)
    attempts = _lead_attempts[key]
    while attempts and now - attempts[0] > RATE_LIMIT_WINDOW_SECONDS:
        attempts.popleft()

    if len(attempts) >= RATE_LIMIT_MAX:
        raise HTTPException(status_code=429, detail="Too many requests. Please call us or try again later.")

    attempts.append(now)


@router.post("", response_model=LeadRead, status_code=201)
def create_customer_lead(payload: LeadCreate, request: Request, db: Session = Depends(get_db)):
    _check_spam(payload, request)
    forwarded_for = request.headers.get("x-forwarded-for")
    payload.client_ip_address = (
        forwarded_for.split(",")[0].strip()
        if forwarded_for
        else request.client.host if request.client else None
    )
    return create_lead(db, payload)
