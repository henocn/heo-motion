import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, JSON, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.schemas.common import JobStatus


#################################################
#              GenerationJob                    #
#################################################


class GenerationJob(Base):
    """Job de generation d'image via Replicate (SDXL / Flux)."""

    __tablename__ = "generation_jobs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    scene_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("scenes.id", ondelete="CASCADE"), nullable=False
    )
    replicate_prediction_id: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    negative_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    model: Mapped[str | None] = mapped_column(String(255), nullable=True)
    params: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(
        String(30),
        default=JobStatus.QUEUED.value,
        server_default=JobStatus.QUEUED.value,
        nullable=False,
    )
    result_image_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    cost_usd: Mapped[float | None] = mapped_column(Float, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    finished_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )


#################################################
#            SegmentationJob                    #
#################################################


class SegmentationJob(Base):
    """Job de segmentation d'image (historique / futur pipeline)."""

    __tablename__ = "segmentation_jobs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    scene_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("scenes.id", ondelete="CASCADE"), nullable=False
    )
    source_image_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    sam_model_version: Mapped[str | None] = mapped_column(
        String(100), nullable=True, default="replicate_sam3_image"
    )
    mediapipe_pose_used: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false", nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(30),
        default=JobStatus.QUEUED.value,
        server_default=JobStatus.QUEUED.value,
        nullable=False,
    )
    result_asset_ids: Mapped[list | None] = mapped_column(JSON, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    finished_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )


#################################################
#           VectorizationJob                    #
#################################################


class VectorizationJob(Base):
    """Job de vectorisation PNG vers SVG via vtracer / potrace."""

    __tablename__ = "vectorization_jobs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    asset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("assets.id", ondelete="CASCADE"), nullable=False
    )
    tool: Mapped[str | None] = mapped_column(
        String(50), nullable=True, default="vtracer"
    )
    params: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(
        String(30),
        default=JobStatus.QUEUED.value,
        server_default=JobStatus.QUEUED.value,
        nullable=False,
    )
    svg_result_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    vector_quality_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    finished_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )


#################################################
#              ExportBatch                      #
#################################################


class ExportBatch(Base):
    """Job d'export groupe d'un projet (ZIP avec assets structures)."""

    __tablename__ = "export_batches"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    export_format: Mapped[str] = mapped_column(String(30), nullable=False)
    include_vector: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false", nullable=False
    )
    include_masks: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false", nullable=False
    )
    layer_naming_convention: Mapped[str | None] = mapped_column(
        String(100), nullable=True, default="illustrator_standard"
    )
    export_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    status: Mapped[str] = mapped_column(
        String(30),
        default=JobStatus.QUEUED.value,
        server_default=JobStatus.QUEUED.value,
        nullable=False,
    )
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
