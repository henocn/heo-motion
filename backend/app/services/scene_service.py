import logging
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions import NotFoundException
from app.models.scene import Scene
from app.repositories.project_repo import ProjectRepository
from app.repositories.scene_repo import SceneRepository
from app.schemas.scene import SceneCreate, SceneResponse, SceneUpdate


logger = logging.getLogger(__name__)


#################################################
#             SceneService                      #
#################################################


class SceneService:
    """Logique metier pour la gestion des scenes."""

    def __init__(self, session: AsyncSession):
        self.repo = SceneRepository(session)
        self.project_repo = ProjectRepository(session)

    # Cree une nouvelle scene rattachee a un projet
    async def create_scene(
        self, project_id: uuid.UUID, data: SceneCreate
    ) -> SceneResponse:
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise NotFoundException("Project", str(project_id))

        scene = Scene(
            project_id=project_id,
            order_index=data.order_index,
            script_excerpt=data.script_excerpt,
            visual_description=data.visual_description,
            intention=data.intention,
            shot_type=data.shot_type,
            characters=data.characters,
            objects=data.objects,
            background=data.background,
        )
        scene = await self.repo.create(scene)
        logger.info("Scene created: %s (project %s)", scene.id, project_id)
        return SceneResponse.model_validate(scene)

    # Recupere une scene par son id
    async def get_scene(self, scene_id: uuid.UUID) -> SceneResponse:
        scene = await self.repo.get_by_id(scene_id)
        if not scene:
            raise NotFoundException("Scene", str(scene_id))
        return SceneResponse.model_validate(scene)

    # Liste toutes les scenes d'un projet
    async def list_scenes(self, project_id: uuid.UUID) -> list[SceneResponse]:
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise NotFoundException("Project", str(project_id))

        scenes = await self.repo.get_by_project(project_id)
        return [SceneResponse.model_validate(s) for s in scenes]

    # Met a jour une scene existante
    async def update_scene(
        self, scene_id: uuid.UUID, data: SceneUpdate
    ) -> SceneResponse:
        scene = await self.repo.get_by_id(scene_id)
        if not scene:
            raise NotFoundException("Scene", str(scene_id))

        update_data = data.model_dump(exclude_unset=True)
        scene = await self.repo.update(scene, update_data)
        logger.info("Scene updated: %s", scene_id)
        return SceneResponse.model_validate(scene)

    # Supprime une scene par son id
    async def delete_scene(self, scene_id: uuid.UUID) -> None:
        scene = await self.repo.get_by_id(scene_id)
        if not scene:
            raise NotFoundException("Scene", str(scene_id))

        await self.repo.delete(scene)
        logger.info("Scene deleted: %s", scene_id)

    # Assigne une image importee manuellement a une scene
    async def set_image(self, scene_id: uuid.UUID, image_path: str) -> SceneResponse:
        scene = await self.repo.get_by_id(scene_id)
        if not scene:
            raise NotFoundException("Scene", str(scene_id))

        scene = await self.repo.update(scene, {
            "generated_image_url": image_path,
            "image_status": "generated",
        })
        logger.info("Image imported for scene: %s -> %s", scene_id, image_path)
        return SceneResponse.model_validate(scene)

    # Approuve l'image d'une scene
    async def approve_scene(self, scene_id: uuid.UUID) -> SceneResponse:
        scene = await self.repo.get_by_id(scene_id)
        if not scene:
            raise NotFoundException("Scene", str(scene_id))

        scene = await self.repo.update(scene, {"user_approved": True})
        logger.info("Scene approved: %s", scene_id)
        return SceneResponse.model_validate(scene)
