import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.job import (
    ExportBatch,
    GenerationJob,
    SegmentationJob,
    VectorizationJob,
)
from app.repositories.base import BaseRepository


#################################################
#        GenerationJobRepository                #
#################################################


class GenerationJobRepository(BaseRepository[GenerationJob]):
    """Repository pour les jobs de generation d'image."""

    def __init__(self, session: AsyncSession):
        super().__init__(GenerationJob, session)

    # Recupere le dernier job de generation d'une scene
    async def get_latest_by_scene(self, scene_id: uuid.UUID) -> GenerationJob | None:
        result = await self.session.execute(
            select(GenerationJob)
            .where(GenerationJob.scene_id == scene_id)
            .order_by(GenerationJob.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()


#################################################
#       SegmentationJobRepository               #
#################################################


class SegmentationJobRepository(BaseRepository[SegmentationJob]):
    """Repository pour les jobs de segmentation."""

    def __init__(self, session: AsyncSession):
        super().__init__(SegmentationJob, session)

    # Recupere le dernier job de segmentation d'une scene
    async def get_latest_by_scene(self, scene_id: uuid.UUID) -> SegmentationJob | None:
        result = await self.session.execute(
            select(SegmentationJob)
            .where(SegmentationJob.scene_id == scene_id)
            .order_by(SegmentationJob.started_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()


#################################################
#      VectorizationJobRepository               #
#################################################


class VectorizationJobRepository(BaseRepository[VectorizationJob]):
    """Repository pour les jobs de vectorisation."""

    def __init__(self, session: AsyncSession):
        super().__init__(VectorizationJob, session)

    # Recupere le dernier job de vectorisation d'un asset
    async def get_latest_by_asset(self, asset_id: uuid.UUID) -> VectorizationJob | None:
        result = await self.session.execute(
            select(VectorizationJob)
            .where(VectorizationJob.asset_id == asset_id)
            .order_by(VectorizationJob.started_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()


#################################################
#         ExportBatchRepository                 #
#################################################


class ExportBatchRepository(BaseRepository[ExportBatch]):
    """Repository pour les batches d'export."""

    def __init__(self, session: AsyncSession):
        super().__init__(ExportBatch, session)

    # Recupere tous les exports d'un projet
    async def get_by_project(self, project_id: uuid.UUID) -> list[ExportBatch]:
        result = await self.session.execute(
            select(ExportBatch)
            .where(ExportBatch.project_id == project_id)
            .order_by(ExportBatch.created_at.desc())
        )
        return list(result.scalars().all())
