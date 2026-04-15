import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.project import (
    ProjectCreate,
    ProjectListItem,
    ProjectResponse,
    ProjectUpdate,
)
from app.services.project_service import ProjectService


router = APIRouter(prefix="/projects", tags=["Projects"])


# Renvoie une instance du service projet injectee via la session DB
def get_project_service(db: AsyncSession = Depends(get_db)) -> ProjectService:
    return ProjectService(db)


# Cree un nouveau projet
@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(
    data: ProjectCreate,
    service: ProjectService = Depends(get_project_service),
) -> ProjectResponse:
    return await service.create_project(data)


# Liste les projets avec pagination
@router.get("", response_model=PaginatedResponse[ProjectListItem])
async def list_projects(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    service: ProjectService = Depends(get_project_service),
) -> PaginatedResponse[ProjectListItem]:
    return await service.list_projects(page=page, page_size=page_size)


# Recupere un projet par son id
@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: uuid.UUID,
    service: ProjectService = Depends(get_project_service),
) -> ProjectResponse:
    return await service.get_project(project_id)


# Met a jour un projet existant
@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: uuid.UUID,
    data: ProjectUpdate,
    service: ProjectService = Depends(get_project_service),
) -> ProjectResponse:
    return await service.update_project(project_id, data)


# Supprime un projet
@router.delete("/{project_id}", response_model=MessageResponse)
async def delete_project(
    project_id: uuid.UUID,
    service: ProjectService = Depends(get_project_service),
) -> MessageResponse:
    await service.delete_project(project_id)
    return MessageResponse(message="Project deleted successfully")
