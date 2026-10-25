from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.lead import Lead
from app.models.vehicle import Vehicle
from app.schemas.lead import LeadCreate
from app.services.basin_service import send_lead_to_basin
from app.services.meta_capi import send_lead_event


TRACKING_FIELDS = {
    "meta_event_id",
    "fbp",
    "fbc",
    "user_agent",
    "client_ip_address",
    "event_source_url",
    "content_ids",
    "content_name",
    "content_type",
    "currency",
    "value",
    "trade_make",
    "trade_model",
    "trade_year",
    "trade_mileage",
    "trade_vin",
    "trade_condition",
    "form_started_at",
    "website",
}


def create_lead(db: Session, payload: LeadCreate) -> Lead:
    if payload.vehicle_id:
        vehicle = db.scalar(select(Vehicle.id).where(Vehicle.id == payload.vehicle_id))
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")

    lead = Lead(**payload.model_dump(exclude=TRACKING_FIELDS))
    db.add(lead)
    db.commit()
    db.refresh(lead)
    send_lead_event(payload)
    send_lead_to_basin(payload)
    return lead
