import json
import logging
import uuid as _uuid
from datetime import datetime, timezone

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

from app.workers.celery_app import celery_app
from app.config import settings


logger = logging.getLogger(__name__)

SYNC_DB_URL = settings.DATABASE_URL.replace("+asyncpg", "")
_sync_engine = create_engine(SYNC_DB_URL, pool_pre_ping=True, pool_size=3)


# Tache Celery 100% synchrone pour segmenter une image en assets
@celery_app.task(name="segment_image_task", bind=True, max_retries=1)
def segment_image_task(self, job_id: str, scene_id: str) -> dict:
    with Session(_sync_engine) as session:
        try:
            session.execute(text(
                "UPDATE segmentation_jobs SET status = 'running', started_at = :now WHERE id = :jid"
            ), {"jid": job_id, "now": datetime.now(timezone.utc)})
            session.execute(text(
                "UPDATE scenes SET segmentation_status = 'running' WHERE id = :sid"
            ), {"sid": scene_id})
            session.commit()

            row = session.execute(text(
                "SELECT source_image_url FROM segmentation_jobs WHERE id = :jid"
            ), {"jid": job_id}).mappings().one()
            image_path = row["source_image_url"]

            from app.integrations.sam2_client import SAM2Client
            client = SAM2Client()
            result = client.segment_image(image_path)

            asset_ids = []
            for asset_data in result.assets:
                asset_id = str(_uuid.uuid4())
                session.execute(text("""
                    INSERT INTO assets (id, scene_id, asset_type, subtype, layer_name,
                                        original_png_url, mask_url, bounding_box,
                                        confidence_score, user_approved)
                    VALUES (:id, :sid, :atype, :sub, :layer, :png, :mask, :bbox, :conf, false)
                """), {
                    "id": asset_id,
                    "sid": scene_id,
                    "atype": asset_data["asset_type"],
                    "sub": asset_data.get("subtype"),
                    "layer": asset_data.get("layer_name"),
                    "png": asset_data.get("original_png_url"),
                    "mask": asset_data.get("mask_url"),
                    "bbox": json.dumps(asset_data.get("bounding_box")),
                    "conf": asset_data.get("confidence_score"),
                })
                asset_ids.append(asset_id)

            session.execute(text("""
                UPDATE segmentation_jobs
                SET status = 'completed', result_asset_ids = :aids, finished_at = :now
                WHERE id = :jid
            """), {
                "aids": json.dumps(asset_ids),
                "now": datetime.now(timezone.utc),
                "jid": job_id,
            })
            session.execute(text(
                "UPDATE scenes SET segmentation_status = 'completed' WHERE id = :sid"
            ), {"sid": scene_id})
            session.commit()

            logger.info("Segmentation done for scene %s: %d assets", scene_id, len(asset_ids))
            return {"status": "completed", "asset_count": len(asset_ids)}

        except Exception as e:
            session.rollback()
            logger.exception("Segmentation failed for scene %s", scene_id)

            try:
                session.execute(text("""
                    UPDATE segmentation_jobs
                    SET status = 'failed', error_message = :err, finished_at = :now
                    WHERE id = :jid
                """), {"err": str(e)[:500], "now": datetime.now(timezone.utc), "jid": job_id})
                session.execute(text(
                    "UPDATE scenes SET segmentation_status = 'failed' WHERE id = :sid"
                ), {"sid": scene_id})
                session.commit()
            except Exception:
                session.rollback()

            return {"status": "failed", "error": str(e)}
