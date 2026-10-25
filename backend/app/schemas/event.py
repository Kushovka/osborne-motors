from pydantic import BaseModel


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
