"""Replace the local Osborne inventory with explicitly labeled placeholder listings."""

import json
import os
from pathlib import Path

from sqlalchemy import create_engine, delete, update
from sqlalchemy.orm import Session

BACKEND_ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = BACKEND_ROOT / "data" / "placeholder_inventory.json"

def main() -> None:
    env_file = BACKEND_ROOT / ".env"
    if env_file.is_file():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip("\"'"))
    if os.environ.get("POSTGRES_FORWARD_PORT") and not os.environ.get("POSTGRES_PORT"):
        os.environ["POSTGRES_PORT"] = os.environ["POSTGRES_FORWARD_PORT"]

    from app.core.config import settings
    from app.models.lead import Lead
    from app.models.vehicle import Vehicle

    vehicles = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    if len(vehicles) != 10:
        raise ValueError("Placeholder inventory must contain exactly 10 listings")
    if any(vehicle.get("status") != "Placeholder" for vehicle in vehicles):
        raise ValueError("Every inventory record must be explicitly marked Placeholder")

    if settings.DB_HOST not in {"localhost", "127.0.0.1"} or settings.DB_NAME != "osborne_motors_db":
        raise RuntimeError("Refusing destructive inventory reset outside the local Osborne database")

    engine = create_engine(settings.DB_URL, pool_pre_ping=True)
    imported_fields = {
        "slug", "title", "make", "model", "trim", "year", "status", "stock_number", "vin",
        "price", "mileage", "body_type", "transmission", "drivetrain", "engine", "exterior_color",
        "interior_color", "location", "short_description", "description", "images", "features",
        "specs", "details", "featured", "financing_available", "warranty_available", "delivery_available",
    }

    with Session(engine) as session, session.begin():
        session.execute(update(Lead).where(Lead.vehicle_id.is_not(None)).values(vehicle_id=None))
        session.execute(delete(Vehicle))
        session.add_all(
            Vehicle(**{key: value for key, value in payload.items() if key in imported_fields})
            for payload in vehicles
        )

    print(f"Replaced public local inventory with {len(vehicles)} placeholder listings.")


if __name__ == "__main__":
    main()
