import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.sam3 import Sam3SegmentRequest, Sam3SegmentResponse
from app.services.sam3_segmentation_service import Sam3SegmentationService


router = APIRouter(tags=["SAM3"])


# Renvoie le service SAM3 injecte
def get_sam3_service(db: AsyncSession = Depends(get_db)) -> Sam3SegmentationService:
    return Sam3SegmentationService(db)


# Lance la segmentation SAM3 (Replicate) sur l'image generee d'une scene
@router.post(
    "/scenes/{scene_id}/sam3-segment",
    response_model=Sam3SegmentResponse,
)
async def sam3_segment_scene(
    scene_id: uuid.UUID,
    body: Sam3SegmentRequest,
    service: Sam3SegmentationService = Depends(get_sam3_service),
) -> Sam3SegmentResponse:
    return await service.run_sam3_for_scene(scene_id, body)
