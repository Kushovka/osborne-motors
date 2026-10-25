from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.schemas.vehicle import (
    VehicleDetail,
    VehicleFilters,
    VehicleImagesResponse,
    VehicleListResponse,
)
from app.services.vehicle_service import (
    get_vehicle_by_slug,
    get_vehicle_filters,
    list_vehicles,
)

router = APIRouter(prefix="/vehicles", tags=["vehicles"])
MEDIA_ROOT = Path("app/static/media").resolve()
PLACEHOLDER_IMAGES = ["/images/vehicle-photo-coming-soon-card.webp"] * 5


def resolved_media_path(path: str) -> str | None:
    """Return the public media path, including a WebP replacement for legacy DB paths."""
    if path.startswith("http://") or path.startswith("https://"):
        return path
    if not path.startswith("/media/"):
        return path

    relative_parts = path.removeprefix("/media/").split("/")
    file_path = (MEDIA_ROOT.joinpath(*relative_parts)).resolve()

    try:
        file_path.relative_to(MEDIA_ROOT)
    except ValueError:
        return None

    if file_path.is_file():
        return path

    webp_path = file_path.with_suffix(".webp")
    if webp_path.is_file():
        return f"{path.rsplit('.', 1)[0]}.webp"

    return None


def existing_images(images: list[str] | None) -> list[str]:
    return [resolved for image in images or [] if (resolved := resolved_media_path(image))]


def media_variant_url(image: str, variant: str) -> str:
    if not image.startswith("/media/"):
        return image

    relative_path = image.removeprefix("/media/")
    source_path = (MEDIA_ROOT / relative_path).resolve()
    try:
        source_path.relative_to(MEDIA_ROOT)
    except ValueError:
        return image

    variant_path = source_path.parent / variant / source_path.name
    if variant_path.is_file():
        return f"{image.rsplit('/', 1)[0]}/{variant}/{source_path.name}"
    return image


def card_thumbnail_url(image: str) -> str:
    return media_variant_url(image, "thumbs")


def gallery_image_url(image: str) -> str:
    return media_variant_url(image, "gallery")


def public_vehicle_details(details: dict | None) -> dict:
    if not details:
        return {}

    public_details = dict(details)
    public_details["info"] = [
        item
        for item in details.get("info", [])
        if str(item.get("label", "")).strip().lower() != "vin"
    ]
    return public_details


def serialize_vehicle(
    vehicle,
    image_limit: int | None = None,
    card_thumbnails: bool = False,
    gallery_images: bool = False,
) -> dict:
    all_images = existing_images(vehicle.images)
    if not all_images:
        all_images = PLACEHOLDER_IMAGES
    images = all_images[:image_limit] if image_limit is not None else all_images
    if card_thumbnails:
        images = [card_thumbnail_url(image) for image in images]
    elif gallery_images:
        images = [gallery_image_url(image) for image in images]

    return {
        "id": vehicle.id,
        "slug": vehicle.slug,
        "title": vehicle.title,
        "make": vehicle.make,
        "model": vehicle.model,
        "trim": vehicle.trim,
        "year": vehicle.year,
        "status": vehicle.status,
        "stock_number": vehicle.stock_number,
        "vin": None,
        "price": vehicle.price,
        "mileage": vehicle.mileage,
        "body_type": vehicle.body_type,
        "transmission": vehicle.transmission,
        "drivetrain": vehicle.drivetrain,
        "engine": vehicle.engine,
        "exterior_color": vehicle.exterior_color,
        "interior_color": vehicle.interior_color,
        "location": vehicle.location,
        "short_description": vehicle.short_description,
        "images": images,
        "images_total": len(all_images),
        "features": vehicle.features or [],
        "specs": vehicle.specs or {},
        "details": public_vehicle_details(vehicle.details),
        "featured": vehicle.featured,
        "warranty_available": vehicle.warranty_available,
        "delivery_available": vehicle.delivery_available,
    }


@router.get("", response_model=VehicleListResponse)
def get_vehicle_list(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    make: str | None = None,
    model: str | None = None,
    year_from: int | None = Query(None, ge=1900),
    year_to: int | None = Query(None, ge=1900),
    body_type: str | None = None,
    transmission: str | None = None,
    drivetrain: str | None = None,
    color: str | None = None,
    status: str | None = None,
    featured: bool | None = None,
    q: str | None = Query(None, min_length=2),
    price_min: int | None = Query(None, ge=0),
    price_max: int | None = Query(None, ge=0),
    mileage_min: int | None = Query(None, ge=0),
    mileage_max: int | None = Query(None, ge=0),
    sort: str = Query("year_desc", pattern="^(year_desc|price_asc|price_desc|mileage_asc)$"),
    db: Session = Depends(get_db),
):
    items, total = list_vehicles(
        db=db,
        page=page,
        page_size=page_size,
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

    return {
        # Cards only display one image at a time, but include a small set of
        # thumbnail URLs so carousel arrows never need a second API request.
        "items": [serialize_vehicle(item, image_limit=7, card_thumbnails=True) for item in items],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/filters", response_model=VehicleFilters)
def get_filters(make: str | None = None, db: Session = Depends(get_db)):
    return get_vehicle_filters(db, make=make)


@router.get("/{slug}/images", response_model=VehicleImagesResponse)
def get_vehicle_images(
    slug: str,
    offset: int = Query(0, ge=0),
    limit: int = Query(12, ge=1, le=48),
    db: Session = Depends(get_db),
):
    vehicle = get_vehicle_by_slug(db, slug)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    images = existing_images(vehicle.images)
    if not images:
        images = PLACEHOLDER_IMAGES
    items = [gallery_image_url(image) for image in images[offset : offset + limit]]
    next_offset = offset + len(items)
    return {
        "items": items,
        "total": len(images),
        "offset": offset,
        "limit": limit,
        "has_more": next_offset < len(images),
    }


@router.get("/{slug}", response_model=VehicleDetail)
def get_vehicle_detail(
    slug: str,
    image_limit: int = Query(12, ge=1, le=250),
    db: Session = Depends(get_db),
):
    vehicle = get_vehicle_by_slug(db, slug)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    payload = serialize_vehicle(vehicle, image_limit=image_limit, gallery_images=True)
    payload["description"] = vehicle.description
    payload["created_at"] = vehicle.created_at
    return payload
