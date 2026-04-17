import logging
import uuid as _uuid
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

from app.workers.celery_app import celery_app
from app.config import settings


logger = logging.getLogger(__name__)

SYNC_DB_URL = settings.DATABASE_URL.replace("+asyncpg", "")
_sync_engine = create_engine(SYNC_DB_URL, pool_pre_ping=True, pool_size=3)


# Tache Celery 100% synchrone (pas d'asyncio) pour eviter les conflits d'event loop
@celery_app.task(name="generate_image_task", bind=True, max_retries=2)
def generate_image_task(self, job_id: str, scene_id: str) -> dict:
    with Session(_sync_engine) as session:
        try:
            _set_status(session, job_id, scene_id, status="running", image_status="generating")

            job_row = _get_job(session, job_id)
            prompt = job_row["prompt"] or ""
            negative_prompt = job_row["negative_prompt"] or ""
            params = job_row["params"] or {}

            image_bytes = _generate_with_provider(
                prompt=prompt,
                negative_prompt=negative_prompt,
                width=params.get("width", 1024),
                height=params.get("height", 1024),
                seed=params.get("seed"),
            )

            local_path = _save_file(image_bytes)

            session.execute(text("""
                UPDATE generation_jobs
                SET status = 'completed', result_image_url = :path, finished_at = :now
                WHERE id = :jid
            """), {"path": local_path, "now": datetime.now(timezone.utc), "jid": job_id})

            session.execute(text("""
                UPDATE scenes
                SET generated_image_url = :path, image_status = 'generated'
                WHERE id = :sid
            """), {"path": local_path, "sid": scene_id})

            session.commit()
            logger.info("Image generated for scene %s -> %s (%s)", scene_id, local_path, settings.IMAGE_PROVIDER)
            return {"status": "completed", "image_url": local_path}

        except Exception as e:
            session.rollback()
            logger.exception("Image generation failed for scene %s", scene_id)

            try:
                session.execute(text("""
                    UPDATE generation_jobs
                    SET status = 'failed', error_message = :err, finished_at = :now
                    WHERE id = :jid
                """), {"err": str(e)[:500], "now": datetime.now(timezone.utc), "jid": job_id})

                session.execute(text("""
                    UPDATE scenes SET image_status = 'pending' WHERE id = :sid
                """), {"sid": scene_id})

                session.commit()
            except Exception:
                session.rollback()

            return {"status": "failed", "error": str(e)}


# Met a jour les statuts du job et de la scene
def _set_status(session: Session, job_id: str, scene_id: str, status: str, image_status: str) -> None:
    session.execute(text(
        "UPDATE generation_jobs SET status = :s WHERE id = :jid"
    ), {"s": status, "jid": job_id})
    session.execute(text(
        "UPDATE scenes SET image_status = :s WHERE id = :sid"
    ), {"s": image_status, "sid": scene_id})
    session.commit()


# Recupere les champs du job necessaires a la generation
def _get_job(session: Session, job_id: str) -> dict:
    row = session.execute(text(
        "SELECT prompt, negative_prompt, params FROM generation_jobs WHERE id = :jid"
    ), {"jid": job_id}).mappings().one()
    return dict(row)


# Genere une image via le provider configure et renvoie les bytes
def _generate_with_provider(prompt: str, negative_prompt: str, width: int, height: int, seed: int | None) -> bytes:
    provider = settings.IMAGE_PROVIDER.lower()

    if provider == "gemini":
        from app.integrations.gemini_client import GeminiImageClient
        client = GeminiImageClient()
        return client.generate_image(
            prompt=prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
        )

    elif provider == "openai":
        from openai import OpenAI
        import httpx

        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        size = _openai_size(width, height)
        logger.info("OpenAI image request: model=%s, size=%s, quality=%s",
                     settings.OPENAI_IMAGE_MODEL, size, settings.OPENAI_IMAGE_QUALITY)

        response = client.images.generate(
            model=settings.OPENAI_IMAGE_MODEL,
            prompt=prompt,
            n=1,
            size=size,
            quality=settings.OPENAI_IMAGE_QUALITY,
        )
        image_url = response.data[0].url
        with httpx.Client(timeout=60) as http:
            dl = http.get(image_url)
            dl.raise_for_status()
            return dl.content

    elif provider == "replicate":
        from app.integrations.replicate_client import ReplicateClient
        client = ReplicateClient()
        image_url = client.generate_image(
            prompt=prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
            seed=seed,
        )
        return client.download_image(image_url)

    else:
        raise ValueError(f"Unknown IMAGE_PROVIDER: {provider}")


# Convertit width/height en format OpenAI (1024x1024, 1024x1792, 1792x1024)
def _openai_size(width: int, height: int) -> str:
    if width > height:
        return "1792x1024"
    elif height > width:
        return "1024x1792"
    return "1024x1024"


# Sauvegarde les bytes d'une image sur le disque et renvoie le chemin relatif
def _save_file(content: bytes) -> str:
    media_root = settings.get_media_path()
    images_dir = media_root / "images"
    images_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{_uuid.uuid4()}.png"
    filepath = images_dir / filename
    filepath.write_bytes(content)

    relative_path = f"images/{filename}"
    logger.info("File saved: %s", relative_path)
    return relative_path
