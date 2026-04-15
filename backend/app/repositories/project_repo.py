from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project
from app.repositories.base import BaseRepository


#################################################
#           ProjectRepository                   #
#################################################


class ProjectRepository(BaseRepository[Project]):
    """Repository specialise pour les projets."""

    def __init__(self, session: AsyncSession):
        super().__init__(Project, session)

    # Liste les projets tries par date de creation decroissante
    async def get_all_ordered(
        self, page: int = 1, page_size: int = 20
    ) -> tuple[list[Project], int]:
        return await self.get_all(
            page=page,
            page_size=page_size,
            order_by=Project.created_at.desc(),
        )
