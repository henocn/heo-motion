import uuid

from sqlalchemy import Boolean, Float, ForeignKey, JSON, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


#################################################
#                  Asset                        #
#################################################


class Asset(Base):
    """Element visuel isole (tete, bras, corps...) extrait d'une scene par segmentation."""

    __tablename__ = "assets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    scene_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("scenes.id", ondelete="CASCADE"),
        nullable=False,
    )
    asset_type: Mapped[str] = mapped_column(String(30), nullable=False)
    subtype: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Geometrie et masque
    bounding_box: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    mask_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    original_png_url: Mapped[str | None] = mapped_column(
        String(512), nullable=True
    )
    svg_url: Mapped[str | None] = mapped_column(String(512), nullable=True)

    # Metadonnees pour After Effects
    layer_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    transform_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    confidence_score: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )

    # Validation utilisateur
    user_approved: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false", nullable=False
    )

    # Relations
    scene: Mapped["Scene"] = relationship("Scene", back_populates="assets")

    def __repr__(self) -> str:
        return f"<Asset {self.asset_type} [{self.layer_name}]>"
