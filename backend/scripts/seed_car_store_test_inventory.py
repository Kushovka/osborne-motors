"""Load the copied Car Store inventory into the local Osborne test database."""

import json
from pathlib import Path

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.vehicle import Vehicle


BACKEND_ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = BACKEND_ROOT / "data" / "car_store_test_inventory.json"
MEDIA_ROOT = BACKEND_ROOT / "app" / "static" / "media"
SAMPLE_SLUG_PREFIX = "temporary-sample-vehicle-"


def main() -> None:
    vehicles = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    for vehicle in vehicles:
        if len(vehicle.get("images", [])) != 10:
            raise ValueError(f"{vehicle['slug']} must have exactly 10 gallery images")
        for image in vehicle["images"]:
            path = MEDIA_ROOT / image.removeprefix("/media/")
            if not path.is_file():
                raise FileNotFoundError(path)

    engine = create_engine(settings.DB_URL, pool_pre_ping=True)
    imported_fields = {
        "slug", "title", "make", "model", "trim", "year", "status", "stock_number", "vin",
        "price", "mileage", "body_type", "transmission", "drivetrain", "engine", "exterior_color",
        "interior_color", "location", "short_description", "description", "images", "features",
        "specs", "details", "featured", "financing_available", "warranty_available", "delivery_available",
    }

    with Session(engine) as session, session.begin():
        temporary_samples = session.scalars(
            select(Vehicle).where(Vehicle.slug.like(f"{SAMPLE_SLUG_PREFIX}%"))
        ).all()
        for sample in temporary_samples:
            sample.status = "Hidden"

        for payload in vehicles:
            values = {key: value for key, value in payload.items() if key in imported_fields}
            existing = session.scalar(select(Vehicle).where(Vehicle.slug == values["slug"]))
            if existing is None:
                session.add(Vehicle(**values))
            else:
                for key, value in values.items():
                    setattr(existing, key, value)

    print(f"Imported {len(vehicles)} vehicles with {sum(len(item['images']) for item in vehicles)} photos.")
    print(f"Hid {len(temporary_samples)} temporary sample vehicles.")


if __name__ == "__main__":
    main()
