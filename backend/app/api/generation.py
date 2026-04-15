import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.job import GenerationJobResponse
from app.schemas.scene import SceneResponse
from app.services.generation_service import GenerationService
from app.services.prompt_service import PromptService


router = APIRouter(tags=["Generation"])


# Renvoie une instance du service generation
def get_generation_service(db: AsyncSession = Depends(get_db)) -> GenerationService:
    return GenerationService(db)


# Renvoie une instance du service prompt
def get_prompt_service(db: AsyncSession = Depends(get_db)) -> PromptService:
    return PromptService(db)


# Genere le prompt d'image pour une scene
@router.post(
    "/scenes/{scene_id}/generate-prompt",
    response_model=SceneResponse,
)
async def generate_prompt(
    scene_id: uuid.UUID,
    service: PromptService = Depends(get_prompt_service),
) -> SceneResponse:
    return await service.generate_prompt_for_scene(scene_id)


# Lance la generation d'image pour une scene (tache Celery)
@router.post(
    "/scenes/{scene_id}/generate-image",
    response_model=GenerationJobResponse,
)
async def generate_image(
    scene_id: uuid.UUID,
    service: GenerationService = Depends(get_generation_service),
) -> GenerationJobResponse:
    return await service.start_generation(scene_id)


# Recupere le statut du dernier job de generation d'une scene
@router.get(
    "/scenes/{scene_id}/generation-status",
    response_model=GenerationJobResponse,
)
async def generation_status(
    scene_id: uuid.UUID,
    service: GenerationService = Depends(get_generation_service),
) -> GenerationJobResponse:
    return await service.get_generation_status(scene_id)


# Regenere une image avec un nouveau seed
@router.post(
    "/scenes/{scene_id}/regenerate-image",
    response_model=GenerationJobResponse,
)
async def regenerate_image(
    scene_id: uuid.UUID,
    service: GenerationService = Depends(get_generation_service),
) -> GenerationJobResponse:
    return await service.start_generation(scene_id, regenerate=True)
