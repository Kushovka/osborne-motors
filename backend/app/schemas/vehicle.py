from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class VehicleBase(BaseModel):
    slug: str
    title: str
    make: str
    model: str
    trim: str | None = None
    year: int
    status: str = "Available"
    stock_number: str | None = None
    vin: str | None = None
    price: int
    mileage: int
    body_type: str
    transmission: str | None = None
    drivetrain: str | None = None
    engine: str | None = None
    exterior_color: str | None = None
    interior_color: str | None = None
    location: str
    short_description: str
    images: list[str] = Field(default_factory=list)
    images_total: int = 0
    features: list[str] = Field(default_factory=list)
    specs: dict = Field(default_factory=dict)
    details: dict = Field(default_factory=dict)
    featured: bool = False
    warranty_available: bool = True
    delivery_available: bool = True


class VehicleListItem(VehicleBase):
    id: str

    model_config = ConfigDict(from_attributes=True)


class VehicleDetail(VehicleBase):
    id: str
    description: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VehicleListResponse(BaseModel):
    items: list[VehicleListItem]
    total: int
    page: int
    page_size: int


class VehicleImagesResponse(BaseModel):
    items: list[str]
    total: int
    offset: int
    limit: int
    has_more: bool


class VehicleFilters(BaseModel):
    makes: list[str]
    models: list[str]
    years: list[int]
    body_types: list[str]
    transmissions: list[str]
    drivetrains: list[str]
    colors: list[str]
    statuses: list[str]
    prices: list[int]
    price_min: int | None = None
    price_max: int | None = None
    mileage_min: int | None = None
    mileage_max: int | None = None
