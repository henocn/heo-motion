import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.scene import Scene
from app.repositories.base import BaseRepository


#################################################
#           SceneRepository                     #
#################################################


class SceneRepository(BaseRepository[Scene]):
    """Repository specialise pour les scenes."""

    def __init__(self, session: AsyncSession):
        super().__init__(Scene, session)

    # Recupere toutes les scenes d'un projet, triees par order_index
    async def get_by_project(self, project_id: uuid.UUID) -> list[Scene]:
        result = await self.session.execute(
            select(Scene)
            .where(Scene.project_id == project_id)
            .order_by(Scene.order_index)
        )
        return list(result.scalars().all())

    # Supprime toutes les scenes d'un projet (utile avant regeneration du storyboard)
    async def delete_by_project(self, project_id: uuid.UUID) -> None:
        scenes = await self.get_by_project(project_id)
        for scene in scenes:
            await self.session.delete(scene)
        await self.session.flush()
