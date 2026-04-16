import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.asset import AssetResponse
from app.schemas.job import SegmentationJobResponse
from app.services.segmentation_service import SegmentationService


router = APIRouter(tags=["Segmentation"])


# Renvoie une instance du service segmentation
def get_segmentation_service(
    db: AsyncSession = Depends(get_db),
) -> SegmentationService:
    return SegmentationService(db)


# Lance la segmentation d'une scene (tache Celery)
@router.post(
    "/scenes/{scene_id}/segment",
    response_model=SegmentationJobResponse,
)
async def start_segmentation(
    scene_id: uuid.UUID,
    service: SegmentationService = Depends(get_segmentation_service),
) -> SegmentationJobResponse:
    return await service.start_segmentation(scene_id)


# Recupere le statut du dernier job de segmentation d'une scene
@router.get(
    "/scenes/{scene_id}/segmentation-status",
    response_model=SegmentationJobResponse,
)
async def segmentation_status(
    scene_id: uuid.UUID,
    service: SegmentationService = Depends(get_segmentation_service),
) -> SegmentationJobResponse:
    return await service.get_segmentation_status(scene_id)


# Recupere les assets segmentes d'une scene
@router.get(
    "/scenes/{scene_id}/assets",
    response_model=list[AssetResponse],
    tags=["Assets"],
)
async def list_scene_assets(
    scene_id: uuid.UUID,
    service: SegmentationService = Depends(get_segmentation_service),
) -> list[AssetResponse]:
    return await service.get_assets(scene_id)
