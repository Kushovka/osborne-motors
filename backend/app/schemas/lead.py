from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class LeadCreate(BaseModel):
    vehicle_id: str | None = None
    lead_type: str = "quote"
    content_ids: list[str] | None = None
    content_name: str | None = None
    content_type: str | None = None
    currency: str | None = None
    value: int | float | None = None
    customer_name: str
    phone: str
    email: EmailStr | None = None
    subject: str | None = None
    preferred_contact: str | None = None
    zip_code: str | None = None
    message: str | None = None
    trade_make: str | None = None
    trade_model: str | None = None
    trade_year: str | None = None
    trade_mileage: str | None = None
    trade_vin: str | None = None
    trade_condition: str | None = None
    source_page: str | None = None
    consent_to_contact: bool = True
    meta_event_id: str | None = None
    fbp: str | None = None
    fbc: str | None = None
    user_agent: str | None = None
    client_ip_address: str | None = None
    event_source_url: str | None = None
    form_started_at: int | None = None
    website: str | None = None


class LeadRead(BaseModel):
    id: str
    vehicle_id: str | None
    lead_type: str
    customer_name: str
    phone: str
    email: EmailStr | None
    subject: str | None
    preferred_contact: str | None
    zip_code: str | None
    message: str | None
    source_page: str | None
    consent_to_contact: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
