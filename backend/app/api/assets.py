import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.exceptions import NotFoundException
from app.repositories.asset_repo import AssetRepository
from app.schemas.asset import AssetResponse, AssetUpdate


router = APIRouter(tags=["Assets"])


# Renvoie le repository asset injecte via la session DB
def get_asset_repo(db: AsyncSession = Depends(get_db)) -> AssetRepository:
    return AssetRepository(db)


# Met a jour un asset existant
@router.put("/assets/{asset_id}", response_model=AssetResponse)
async def update_asset(
    asset_id: uuid.UUID,
    data: AssetUpdate,
    repo: AssetRepository = Depends(get_asset_repo),
) -> AssetResponse:
    asset = await repo.get_by_id(asset_id)
    if not asset:
        raise NotFoundException("Asset", str(asset_id))
    update_data = data.model_dump(exclude_unset=True)
    asset = await repo.update(asset, update_data)
    return AssetResponse.model_validate(asset)


# Approuve un asset
@router.patch("/assets/{asset_id}/approve", response_model=AssetResponse)
async def approve_asset(
    asset_id: uuid.UUID,
    repo: AssetRepository = Depends(get_asset_repo),
) -> AssetResponse:
    asset = await repo.get_by_id(asset_id)
    if not asset:
        raise NotFoundException("Asset", str(asset_id))
    asset = await repo.update(asset, {"user_approved": True})
    return AssetResponse.model_validate(asset)


# Supprime un asset
@router.delete("/assets/{asset_id}", status_code=204)
async def delete_asset(
    asset_id: uuid.UUID,
    repo: AssetRepository = Depends(get_asset_repo),
) -> None:
    asset = await repo.get_by_id(asset_id)
    if not asset:
        raise NotFoundException("Asset", str(asset_id))
    await repo.delete(asset)
