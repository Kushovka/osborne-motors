import os
from urllib.parse import quote
from xml.sax.saxutils import escape

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.vehicle import Vehicle
from app.services.vehicle_service import HIDDEN_VEHICLE_STATUSES


router = APIRouter(tags=["seo"])
PUBLIC_SITE_URL = os.getenv("PUBLIC_SITE_URL", "").rstrip("/")
PUBLIC_PATHS = (
    "/",
    "/inventory",
    "/about",
    "/team",
    "/contact",
    "/warranty",
    "/delivery",
    "/privacy-policy",
    "/terms",
)


@router.get("/sitemap.xml", include_in_schema=False)
def get_sitemap(db: Session = Depends(get_db)) -> Response:
    slugs = db.scalars(
        select(Vehicle.slug)
        .where(Vehicle.status.not_in(HIDDEN_VEHICLE_STATUSES | {"Placeholder"}))
        .order_by(Vehicle.slug)
    ).all()
    paths = [*PUBLIC_PATHS, *(f"/inventory/{quote(slug, safe='-._~')}" for slug in slugs)]
    urls = "".join(f"  <url><loc>{escape(PUBLIC_SITE_URL + path)}</loc></url>\n" for path in paths) if PUBLIC_SITE_URL else ""
    xml = f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n'
    return Response(content=xml, media_type="application/xml")
