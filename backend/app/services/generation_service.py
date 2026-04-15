import logging
import random
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions import NotFoundException, ValidationException
from app.models.job import GenerationJob
from app.repositories.job_repo import GenerationJobRepository
from app.repositories.scene_repo import SceneRepository
from app.schemas.common import ImageStatus, JobStatus
from app.schemas.job import GenerationJobResponse
from app.services.prompt_service import PromptService


logger = logging.getLogger(__name__)


#################################################
#          GenerationService                    #
#################################################


class GenerationService:
    """Orchestre la generation d'images : cree le job et lance la tache Celery."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.scene_repo = SceneRepository(session)
        self.job_repo = GenerationJobRepository(session)
        self.prompt_service = PromptService(session)

    # Lance la generation d'image pour une scene (cree le job + dispatch Celery)
    async def start_generation(
        self, scene_id: uuid.UUID, regenerate: bool = False
    ) -> GenerationJobResponse:
        scene = await self.scene_repo.get_by_id(scene_id)
        if not scene:
            raise NotFoundException("Scene", str(scene_id))

        if not scene.prompt_generated:
            await self.prompt_service.generate_prompt_for_scene(scene_id)
            await self.session.refresh(scene)

        if not scene.prompt_generated:
            raise ValidationException("No prompt available for this scene")

        seed = random.randint(0, 2**32 - 1) if regenerate else None

        job = GenerationJob(
            scene_id=scene_id,
            prompt=scene.prompt_generated,
            negative_prompt=PromptService.get_negative_prompt(),
            model="stability-ai/sdxl",
            params={"width": 1024, "height": 1024, "seed": seed},
            status=JobStatus.QUEUED.value,
        )
        job = await self.job_repo.create(job)

        scene.image_status = ImageStatus.GENERATING.value
        await self.session.flush()
        await self.session.commit()

        from app.workers.generation_tasks import generate_image_task
        generate_image_task.delay(str(job.id), str(scene_id))

        logger.info("Generation job %s queued for scene %s", job.id, scene_id)
        return GenerationJobResponse.model_validate(job)

    # Recupere le statut du dernier job de generation d'une scene
    async def get_generation_status(
        self, scene_id: uuid.UUID
    ) -> GenerationJobResponse:
        scene = await self.scene_repo.get_by_id(scene_id)
        if not scene:
            raise NotFoundException("Scene", str(scene_id))

        job = await self.job_repo.get_latest_by_scene(scene_id)
        if not job:
            raise NotFoundException("GenerationJob", f"for scene {scene_id}")

        return GenerationJobResponse.model_validate(job)
