import uuid

from sqlalchemy import Boolean, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.schemas.common import ImageStatus, JobStatus


#################################################
#                  Scene                        #
#################################################


class Scene(Base):
    """Scene individuelle d'un projet, avec son image generee et ses metadonnees."""

    __tablename__ = "scenes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Contenu de la scene
    script_excerpt: Mapped[str | None] = mapped_column(Text, nullable=True)
    visual_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    intention: Mapped[str | None] = mapped_column(String(255), nullable=True)
    shot_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    characters: Mapped[list | None] = mapped_column(JSON, nullable=True)
    objects: Mapped[list | None] = mapped_column(JSON, nullable=True)
    background: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Generation d'image
    prompt_generated: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_generation_params: Mapped[dict | None] = mapped_column(
        JSON, nullable=True
    )
    generated_image_url: Mapped[str | None] = mapped_column(
        String(512), nullable=True
    )

    # Validation utilisateur
    user_validated_image_url: Mapped[str | None] = mapped_column(
        String(512), nullable=True
    )
    user_approved: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false", nullable=False
    )

    # Statuts (stockes en String pour eviter les problemes de migration d'enums PG)
    image_status: Mapped[str] = mapped_column(
        String(30),
        default=ImageStatus.PENDING.value,
        server_default=ImageStatus.PENDING.value,
        nullable=False,
    )
    segmentation_status: Mapped[str | None] = mapped_column(
        String(30), nullable=True
    )
    vectorization_status: Mapped[str | None] = mapped_column(
        String(30), nullable=True
    )

    # Relations
    project: Mapped["Project"] = relationship(
        "Project", back_populates="scenes"
    )
    assets: Mapped[list["Asset"]] = relationship(
        "Asset",
        back_populates="scene",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Scene #{self.order_index} [{self.image_status}]>"
