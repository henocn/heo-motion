import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.exceptions import NotFoundException
from app.repositories.asset_repo import AssetRepository
from app.repositories.scene_repo import SceneRepository
from app.schemas.asset import AssetResponse, AssetUpdate


router = APIRouter(tags=["Assets"])


# Renvoie les repositories necessaires injectes via la session DB
def get_repos(db: AsyncSession = Depends(get_db)) -> tuple[AssetRepository, SceneRepository]:
    return AssetRepository(db), SceneRepository(db)


# Liste les assets d'une scene
@router.get(
    "/scenes/{scene_id}/assets",
    response_model=list[AssetResponse],
)
async def list_assets(
    scene_id: uuid.UUID,
    repos: tuple = Depends(get_repos),
) -> list[AssetResponse]:
    asset_repo, scene_repo = repos
    scene = await scene_repo.get_by_id(scene_id)
    if not scene:
        raise NotFoundException("Scene", str(scene_id))
    assets = await asset_repo.get_by_scene(scene_id)
    return [AssetResponse.model_validate(a) for a in assets]


# Met a jour un asset existant
@router.put("/assets/{asset_id}", response_model=AssetResponse)
async def update_asset(
    asset_id: uuid.UUID,
    data: AssetUpdate,
    repos: tuple = Depends(get_repos),
) -> AssetResponse:
    asset_repo, _ = repos
    asset = await asset_repo.get_by_id(asset_id)
    if not asset:
        raise NotFoundException("Asset", str(asset_id))
    update_data = data.model_dump(exclude_unset=True)
    asset = await asset_repo.update(asset, update_data)
    return AssetResponse.model_validate(asset)


# Approuve un asset
@router.patch("/assets/{asset_id}/approve", response_model=AssetResponse)
async def approve_asset(
    asset_id: uuid.UUID,
    repos: tuple = Depends(get_repos),
) -> AssetResponse:
    asset_repo, _ = repos
    asset = await asset_repo.get_by_id(asset_id)
    if not asset:
        raise NotFoundException("Asset", str(asset_id))
    asset = await asset_repo.update(asset, {"user_approved": True})
    return AssetResponse.model_validate(asset)
