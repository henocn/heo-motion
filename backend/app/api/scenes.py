import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.scene import SceneCreate, SceneResponse, SceneUpdate
from app.services.scene_service import SceneService
from app.services.storyboard_service import StoryboardService


router = APIRouter(tags=["Scenes"])


# Renvoie une instance du service scene injectee via la session DB
def get_scene_service(db: AsyncSession = Depends(get_db)) -> SceneService:
    return SceneService(db)


# Renvoie une instance du service storyboard
def get_storyboard_service(db: AsyncSession = Depends(get_db)) -> StoryboardService:
    return StoryboardService(db)


# Liste les scenes d'un projet
@router.get(
    "/projects/{project_id}/scenes",
    response_model=list[SceneResponse],
)
async def list_scenes(
    project_id: uuid.UUID,
    service: SceneService = Depends(get_scene_service),
) -> list[SceneResponse]:
    return await service.list_scenes(project_id)


# Cree une scene manuellement dans un projet
@router.post(
    "/projects/{project_id}/scenes",
    response_model=SceneResponse,
    status_code=201,
)
async def create_scene(
    project_id: uuid.UUID,
    data: SceneCreate,
    service: SceneService = Depends(get_scene_service),
) -> SceneResponse:
    return await service.create_scene(project_id, data)


# Recupere une scene par son id
@router.get("/scenes/{scene_id}", response_model=SceneResponse)
async def get_scene(
    scene_id: uuid.UUID,
    service: SceneService = Depends(get_scene_service),
) -> SceneResponse:
    return await service.get_scene(scene_id)


# Met a jour une scene existante
@router.put("/scenes/{scene_id}", response_model=SceneResponse)
async def update_scene(
    scene_id: uuid.UUID,
    data: SceneUpdate,
    service: SceneService = Depends(get_scene_service),
) -> SceneResponse:
    return await service.update_scene(scene_id, data)


# Lance la generation du storyboard par le LLM
@router.post(
    "/projects/{project_id}/storyboard/generate",
    response_model=list[SceneResponse],
)
async def generate_storyboard(
    project_id: uuid.UUID,
    service: StoryboardService = Depends(get_storyboard_service),
) -> list[SceneResponse]:
    return await service.generate_storyboard(project_id)


# Approuve l'image generee pour une scene
@router.patch("/scenes/{scene_id}/approve", response_model=SceneResponse)
async def approve_scene(
    scene_id: uuid.UUID,
    service: SceneService = Depends(get_scene_service),
) -> SceneResponse:
    return await service.approve_scene(scene_id)
