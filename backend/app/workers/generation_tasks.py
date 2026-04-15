import asyncio
import logging
import uuid
from datetime import datetime, timezone

from app.workers.celery_app import celery_app
from app.config import settings
from app.database import async_session_factory
from app.integrations.replicate_client import ReplicateClient
from app.models.job import GenerationJob
from app.models.scene import Scene
from app.schemas.common import ImageStatus, JobStatus
from app.services.storage_service import StorageService


logger = logging.getLogger(__name__)


# Tache Celery asynchrone qui genere une image via Replicate, la telecharge et la stocke
@celery_app.task(name="generate_image_task", bind=True, max_retries=2)
def generate_image_task(self, job_id: str, scene_id: str) -> dict:
    return asyncio.run(_generate_image(self, job_id, scene_id))


async def _generate_image(task, job_id: str, scene_id: str) -> dict:
    async with async_session_factory() as session:
        try:
            job = await session.get(GenerationJob, uuid.UUID(job_id))
            scene = await session.get(Scene, uuid.UUID(scene_id))

            if not job or not scene:
                logger.error("Job %s or Scene %s not found", job_id, scene_id)
                return {"error": "Job or Scene not found"}

            job.status = JobStatus.RUNNING.value
            scene.image_status = ImageStatus.GENERATING.value
            await session.commit()

            replicate_client = ReplicateClient()
            storage = StorageService()

            image_url = await replicate_client.generate_image(
                prompt=job.prompt or "",
                negative_prompt=job.negative_prompt or "",
                width=job.params.get("width", 1024) if job.params else 1024,
                height=job.params.get("height", 1024) if job.params else 1024,
                seed=job.params.get("seed") if job.params else None,
            )

            image_bytes = await replicate_client.download_image(image_url)
            local_path = await storage.save_file(image_bytes, "images", "png")

            job.status = JobStatus.COMPLETED.value
            job.result_image_url = local_path
            job.finished_at = datetime.now(timezone.utc)

            scene.generated_image_url = local_path
            scene.image_status = ImageStatus.GENERATED.value

            await session.commit()
            logger.info("Image generated for scene %s -> %s", scene_id, local_path)

            return {"status": "completed", "image_url": local_path}

        except Exception as e:
            logger.exception("Image generation failed for scene %s", scene_id)

            job = await session.get(GenerationJob, uuid.UUID(job_id))
            if job:
                job.status = JobStatus.FAILED.value
                job.error_message = str(e)[:500]
                job.finished_at = datetime.now(timezone.utc)

            scene = await session.get(Scene, uuid.UUID(scene_id))
            if scene:
                scene.image_status = ImageStatus.PENDING.value

            await session.commit()
            return {"status": "failed", "error": str(e)}
