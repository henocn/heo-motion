import logging
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions import NotFoundException, ValidationException
from app.models.job import SegmentationJob
from app.repositories.asset_repo import AssetRepository
from app.repositories.job_repo import SegmentationJobRepository
from app.repositories.scene_repo import SceneRepository
from app.schemas.asset import AssetResponse
from app.schemas.common import JobStatus
from app.schemas.job import SegmentationJobResponse


logger = logging.getLogger(__name__)


#################################################
#        SegmentationService                    #
#################################################


class SegmentationService:
    """Orchestre la segmentation : cree le job et lance la tache Celery."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.scene_repo = SceneRepository(session)
        self.job_repo = SegmentationJobRepository(session)
        self.asset_repo = AssetRepository(session)

    # Lance la segmentation pour une scene
    async def start_segmentation(self, scene_id: uuid.UUID) -> SegmentationJobResponse:
        scene = await self.scene_repo.get_by_id(scene_id)
        if not scene:
            raise NotFoundException("Scene", str(scene_id))

        if not scene.generated_image_url:
            raise ValidationException(
                "No generated image available for segmentation"
            )

        job = SegmentationJob(
            scene_id=scene_id,
            source_image_url=scene.generated_image_url,
            sam_model_version="rembg_u2net",
            status=JobStatus.QUEUED.value,
        )
        job = await self.job_repo.create(job)

        scene.segmentation_status = JobStatus.RUNNING.value
        await self.session.flush()
        await self.session.commit()

        from app.workers.segmentation_tasks import segment_image_task
        segment_image_task.delay(str(job.id), str(scene_id))

        logger.info("Segmentation job %s queued for scene %s", job.id, scene_id)
        return SegmentationJobResponse.model_validate(job)

    # Recupere le statut du dernier job de segmentation d'une scene
    async def get_segmentation_status(
        self, scene_id: uuid.UUID
    ) -> SegmentationJobResponse:
        scene = await self.scene_repo.get_by_id(scene_id)
        if not scene:
            raise NotFoundException("Scene", str(scene_id))

        job = await self.job_repo.get_latest_by_scene(scene_id)
        if not job:
            raise NotFoundException("SegmentationJob", f"for scene {scene_id}")

        return SegmentationJobResponse.model_validate(job)

    # Recupere les assets segmentes d'une scene
    async def get_assets(self, scene_id: uuid.UUID) -> list[AssetResponse]:
        scene = await self.scene_repo.get_by_id(scene_id)
        if not scene:
            raise NotFoundException("Scene", str(scene_id))

        assets = await self.asset_repo.get_by_scene(scene_id)
        return [AssetResponse.model_validate(a) for a in assets]
