import logging
import math
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions import NotFoundException
from app.models.project import Project
from app.repositories.project_repo import ProjectRepository
from app.schemas.common import PaginatedResponse
from app.schemas.project import (
    ProjectCreate,
    ProjectListItem,
    ProjectResponse,
    ProjectUpdate,
)


logger = logging.getLogger(__name__)


#################################################
#            ProjectService                     #
#################################################


class ProjectService:
    """Logique metier pour la gestion des projets."""

    def __init__(self, session: AsyncSession):
        self.repo = ProjectRepository(session)

    # Cree un nouveau projet a partir des donnees validees
    async def create_project(self, data: ProjectCreate) -> ProjectResponse:
        project = Project(
            name=data.name,
            description=data.description,
            script_raw_text=data.script_raw_text,
            art_direction=data.art_direction,
            voiceover_audio_url=data.voiceover_audio_url,
            settings=data.settings,
        )
        project = await self.repo.create(project)
        logger.info("Project created: %s (%s)", project.name, project.id)
        return ProjectResponse.model_validate(project)

    # Recupere un projet par son id, leve NotFoundException si absent
    async def get_project(self, project_id: uuid.UUID) -> ProjectResponse:
        project = await self.repo.get_by_id(project_id)
        if not project:
            raise NotFoundException("Project", str(project_id))
        return ProjectResponse.model_validate(project)

    # Liste les projets avec pagination
    async def list_projects(
        self, page: int = 1, page_size: int = 20
    ) -> PaginatedResponse[ProjectListItem]:
        items, total = await self.repo.get_all_ordered(page=page, page_size=page_size)
        return PaginatedResponse(
            items=[ProjectListItem.model_validate(p) for p in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=max(1, math.ceil(total / page_size)),
        )

    # Met a jour un projet existant
    async def update_project(
        self, project_id: uuid.UUID, data: ProjectUpdate
    ) -> ProjectResponse:
        project = await self.repo.get_by_id(project_id)
        if not project:
            raise NotFoundException("Project", str(project_id))

        update_data = data.model_dump(exclude_unset=True)
        project = await self.repo.update(project, update_data)
        logger.info("Project updated: %s", project_id)
        return ProjectResponse.model_validate(project)

    # Supprime un projet et toutes ses scenes en cascade
    async def delete_project(self, project_id: uuid.UUID) -> None:
        project = await self.repo.get_by_id(project_id)
        if not project:
            raise NotFoundException("Project", str(project_id))

        await self.repo.delete(project)
        logger.info("Project deleted: %s", project_id)
