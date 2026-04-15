import uuid
from datetime import datetime

from sqlalchemy import DateTime, JSON, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.schemas.common import ProjectStatus


#################################################
#                 Project                       #
#################################################


class Project(Base):
    """Projet de motion design contenant un script, un storyboard et des scenes."""

    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(30),
        default=ProjectStatus.DRAFT.value,
        server_default=ProjectStatus.DRAFT.value,
        nullable=False,
    )
    art_direction: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    script_raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    voiceover_audio_url: Mapped[str | None] = mapped_column(
        String(512), nullable=True
    )
    settings: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    scenes: Mapped[list["Scene"]] = relationship(
        "Scene",
        back_populates="project",
        cascade="all, delete-orphan",
        order_by="Scene.order_index",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Project {self.name} [{self.status.value}]>"
