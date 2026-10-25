from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    slug: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    make: Mapped[str] = mapped_column(String, index=True, nullable=False)
    model: Mapped[str] = mapped_column(String, index=True, nullable=False)
    trim: Mapped[str | None] = mapped_column(String, nullable=True)
    year: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    status: Mapped[str] = mapped_column(String, index=True, default="Available", nullable=False)
    stock_number: Mapped[str | None] = mapped_column(String, unique=True, index=True, nullable=True)
    vin: Mapped[str | None] = mapped_column(String, unique=True, index=True, nullable=True)
    price: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    mileage: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    body_type: Mapped[str] = mapped_column(String, index=True, nullable=False)
    transmission: Mapped[str | None] = mapped_column(String, index=True, nullable=True)
    drivetrain: Mapped[str | None] = mapped_column(String, index=True, nullable=True)
    engine: Mapped[str | None] = mapped_column(String, nullable=True)
    exterior_color: Mapped[str | None] = mapped_column(String, index=True, nullable=True)
    interior_color: Mapped[str | None] = mapped_column(String, nullable=True)
    location: Mapped[str] = mapped_column(String, nullable=False)
    short_description: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    images: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    features: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    specs: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    details: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    featured: Mapped[bool] = mapped_column(Boolean, default=False, index=True, nullable=False)
    financing_available: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    warranty_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    delivery_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
