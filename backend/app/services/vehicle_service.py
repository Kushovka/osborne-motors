from sqlalchemy import Select, case, func, or_, select
from sqlalchemy.orm import Session

from app.models.vehicle import Vehicle


HIDDEN_VEHICLE_STATUSES = {"Hidden"}


def build_vehicle_query(
    make: str | None = None,
    model: str | None = None,
    year_from: int | None = None,
    year_to: int | None = None,
    body_type: str | None = None,
    transmission: str | None = None,
    drivetrain: str | None = None,
    color: str | None = None,
    status: str | None = None,
    featured: bool | None = None,
    q: str | None = None,
    price_min: int | None = None,
    price_max: int | None = None,
    mileage_min: int | None = None,
    mileage_max: int | None = None,
    sort: str = "year_desc",
) -> Select[tuple[Vehicle]]:
    query = select(Vehicle).where(Vehicle.status.not_in(HIDDEN_VEHICLE_STATUSES))

    if make:
        query = query.where(Vehicle.make == make)
    if model:
        query = query.where(Vehicle.model == model)
    if year_from is not None:
        query = query.where(Vehicle.year >= year_from)
    if year_to is not None:
        query = query.where(Vehicle.year <= year_to)
    if body_type:
        query = query.where(Vehicle.body_type == body_type)
    if transmission:
        query = query.where(Vehicle.transmission == transmission)
    if drivetrain:
        query = query.where(Vehicle.drivetrain == drivetrain)
    if color:
        query = query.where(Vehicle.exterior_color == color)
    if status:
        query = query.where(Vehicle.status == status)
    if featured is not None:
        query = query.where(Vehicle.featured == featured)
    if q:
        term = f"%{q.strip()}%"
        query = query.where(
            or_(
                Vehicle.title.ilike(term),
                Vehicle.make.ilike(term),
                Vehicle.model.ilike(term),
                Vehicle.trim.ilike(term),
                Vehicle.stock_number.ilike(term),
                Vehicle.vin.ilike(term),
            )
        )
    if price_min is not None or price_max is not None:
        # Zero is reserved for vehicles whose price has not been supplied.
        query = query.where(Vehicle.price > 0)
    if price_min is not None:
        query = query.where(Vehicle.price >= price_min)
    if price_max is not None:
        query = query.where(Vehicle.price <= price_max)
    if mileage_min is not None:
        query = query.where(Vehicle.mileage >= mileage_min)
    if mileage_max is not None:
        query = query.where(Vehicle.mileage <= mileage_max)

    if sort == "price_asc":
        return query.order_by(case((Vehicle.price <= 0, 1), else_=0), Vehicle.price.asc(), Vehicle.year.desc())
    if sort == "price_desc":
        return query.order_by(case((Vehicle.price <= 0, 1), else_=0), Vehicle.price.desc(), Vehicle.year.desc())
    if sort == "mileage_asc":
        return query.order_by(Vehicle.mileage.asc(), Vehicle.year.desc())
    return query.order_by(Vehicle.year.desc(), Vehicle.price.desc())


def list_vehicles(
    db: Session,
    page: int = 1,
    page_size: int = 12,
    make: str | None = None,
    model: str | None = None,
    year_from: int | None = None,
    year_to: int | None = None,
    body_type: str | None = None,
    transmission: str | None = None,
    drivetrain: str | None = None,
    color: str | None = None,
    status: str | None = None,
    featured: bool | None = None,
    q: str | None = None,
    price_min: int | None = None,
    price_max: int | None = None,
    mileage_min: int | None = None,
    mileage_max: int | None = None,
    sort: str = "year_desc",
) -> tuple[list[Vehicle], int]:
    page = max(page, 1)
    page_size = min(max(page_size, 1), 50)
    query = build_vehicle_query(
        make=make,
        model=model,
        year_from=year_from,
        year_to=year_to,
        body_type=body_type,
        transmission=transmission,
        drivetrain=drivetrain,
        color=color,
        status=status,
        featured=featured,
        q=q,
        price_min=price_min,
        price_max=price_max,
        mileage_min=mileage_min,
        mileage_max=mileage_max,
        sort=sort,
    )
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    items = db.scalars(query.offset((page - 1) * page_size).limit(page_size)).all()
    return list(items), total


def get_vehicle_by_slug(db: Session, slug: str) -> Vehicle | None:
    return db.scalar(
        select(Vehicle).where(
            Vehicle.slug == slug,
            Vehicle.status.not_in(HIDDEN_VEHICLE_STATUSES),
        )
    )


def get_vehicle_filters(db: Session, make: str | None = None) -> dict:
    visible_vehicles = Vehicle.status.not_in(HIDDEN_VEHICLE_STATUSES)
    model_query = select(Vehicle.model).where(visible_vehicles).distinct().order_by(Vehicle.model)
    price_query = select(Vehicle.price).where(visible_vehicles, Vehicle.price > 0).distinct().order_by(Vehicle.price)
    if make:
        model_query = model_query.where(Vehicle.make == make)
        price_query = price_query.where(Vehicle.make == make)

    return {
        "makes": list(db.scalars(select(Vehicle.make).where(visible_vehicles).distinct().order_by(Vehicle.make)).all()),
        "models": list(db.scalars(model_query).all()),
        "years": list(db.scalars(select(Vehicle.year).where(visible_vehicles).distinct().order_by(Vehicle.year.desc())).all()),
        "body_types": list(db.scalars(select(Vehicle.body_type).where(visible_vehicles).distinct().order_by(Vehicle.body_type)).all()),
        "transmissions": list(db.scalars(select(Vehicle.transmission).where(visible_vehicles, Vehicle.transmission.is_not(None)).distinct().order_by(Vehicle.transmission)).all()),
        "drivetrains": list(db.scalars(select(Vehicle.drivetrain).where(visible_vehicles, Vehicle.drivetrain.is_not(None)).distinct().order_by(Vehicle.drivetrain)).all()),
        "colors": list(db.scalars(select(Vehicle.exterior_color).where(visible_vehicles, Vehicle.exterior_color.is_not(None)).distinct().order_by(Vehicle.exterior_color)).all()),
        "statuses": list(db.scalars(select(Vehicle.status).where(visible_vehicles).distinct().order_by(Vehicle.status)).all()),
        "prices": list(db.scalars(price_query).all()),
        "price_min": db.scalar(select(func.min(Vehicle.price)).where(visible_vehicles, Vehicle.price > 0)),
        "price_max": db.scalar(select(func.max(Vehicle.price)).where(visible_vehicles, Vehicle.price > 0)),
        "mileage_min": db.scalar(select(func.min(Vehicle.mileage)).where(visible_vehicles)),
        "mileage_max": db.scalar(select(func.max(Vehicle.mileage)).where(visible_vehicles)),
    }
