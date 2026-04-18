import io
import uuid

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.asset import AssetResponse
from app.schemas.job import SegmentationJobResponse
from app.services.psd_export_service import PsdExportService
from app.services.segmentation_service import SegmentationService


router = APIRouter(tags=["Segmentation"])


# Renvoie une instance du service segmentation
def get_segmentation_service(
    db: AsyncSession = Depends(get_db),
) -> SegmentationService:
    return SegmentationService(db)


# Renvoie une instance du service export PSD
def get_psd_export_service(
    db: AsyncSession = Depends(get_db),
) -> PsdExportService:
    return PsdExportService(db)


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


# Supprime tous les assets d'une scene
@router.delete("/scenes/{scene_id}/assets", status_code=204, tags=["Assets"])
async def clear_scene_assets(
    scene_id: uuid.UUID,
    service: SegmentationService = Depends(get_segmentation_service),
) -> None:
    await service.clear_assets(scene_id)


# Telecharge un PSD unique : reference + calques assets positionnes
@router.get("/scenes/{scene_id}/export-psd", tags=["Assets"])
async def export_scene_psd(
    scene_id: uuid.UUID,
    service: PsdExportService = Depends(get_psd_export_service),
) -> StreamingResponse:
    data, filename = await service.export_scene_psd_bytes(scene_id)
    return StreamingResponse(
        io.BytesIO(data),
        media_type="image/vnd.adobe.photoshop",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )
