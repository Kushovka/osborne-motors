from pydantic import BaseModel, Field


class ContactActionCreate(BaseModel):
    action_type: str
    content_name: str | None = None
    source_page: str | None = None
    meta_event_id: str | None = None
    fbp: str | None = None
    fbc: str | None = None
    user_agent: str | None = None
    client_ip_address: str | None = None
    event_source_url: str | None = None


class CapiLeadEventCreate(BaseModel):
    lead_id: str = Field(min_length=1, max_length=64)
    meta_event_id: str = Field(min_length=1, max_length=128, pattern=r"^[A-Za-z0-9._:-]+$")
    capi_ticket: str = Field(min_length=1, max_length=512)
    email: str | None = Field(default=None, max_length=320)
    phone: str | None = Field(default=None, max_length=64)
    first_name: str | None = Field(default=None, max_length=100)
    last_name: str | None = Field(default=None, max_length=100)
    content_id: str | None = Field(default=None, max_length=128)
    content_type: str | None = Field(default=None, max_length=32)
    currency: str | None = Field(default=None, max_length=3)
    price: int | float | None = None
    zip: str | None = Field(default=None, max_length=32)
    fbp: str | None = Field(default=None, max_length=256)
    fbc: str | None = Field(default=None, max_length=2048)
    event_source_url: str | None = Field(default=None, max_length=2048)
    test_event_code: str | None = Field(default=None, max_length=64, pattern=r"^[A-Za-z0-9_-]+$")
