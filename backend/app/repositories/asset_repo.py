import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.asset import Asset
from app.repositories.base import BaseRepository


#################################################
#           AssetRepository                     #
#################################################


class AssetRepository(BaseRepository[Asset]):
    """Repository specialise pour les assets."""

    def __init__(self, session: AsyncSession):
        super().__init__(Asset, session)

    # Recupere tous les assets d'une scene
    async def get_by_scene(self, scene_id: uuid.UUID) -> list[Asset]:
        result = await self.session.execute(
            select(Asset)
            .where(Asset.scene_id == scene_id)
            .order_by(Asset.asset_type)
        )
        return list(result.scalars().all())
