from pathlib import Path

from PIL import Image, ImageOps


MEDIA_ROOT = Path(__file__).resolve().parents[1] / "app" / "static" / "media" / "vehicles"
CARD_MAX_SIZE = (480, 480)
GALLERY_MAX_SIZE = (1280, 1280)


def main() -> None:
    generated = 0
    skipped = 0
    gallery_generated = 0
    gallery_skipped = 0
    for source in MEDIA_ROOT.glob("*/*.webp"):
        thumbnail = source.parent / "thumbs" / source.name
        gallery_image = source.parent / "gallery" / source.name
        if thumbnail.exists() and thumbnail.stat().st_mtime >= source.stat().st_mtime:
            skipped += 1
        else:
            thumbnail.parent.mkdir(parents=True, exist_ok=True)
            with Image.open(source) as image:
                image = ImageOps.exif_transpose(image)
                image.thumbnail(CARD_MAX_SIZE, Image.Resampling.LANCZOS)
                if image.mode not in ("RGB", "RGBA"):
                    image = image.convert("RGB")
                image.save(thumbnail, "WEBP", quality=76, method=4)
            generated += 1

        if gallery_image.exists() and gallery_image.stat().st_mtime >= source.stat().st_mtime:
            gallery_skipped += 1
        else:
            gallery_image.parent.mkdir(parents=True, exist_ok=True)
            with Image.open(source) as image:
                image = ImageOps.exif_transpose(image)
                image.thumbnail(GALLERY_MAX_SIZE, Image.Resampling.LANCZOS)
                if image.mode not in ("RGB", "RGBA"):
                    image = image.convert("RGB")
                image.save(gallery_image, "WEBP", quality=72, method=4)
            gallery_generated += 1

    print(
        f"Card thumbnails: generated {generated}, already current {skipped}; "
        f"gallery images: generated {gallery_generated}, already current {gallery_skipped}"
    )


if __name__ == "__main__":
    main()
