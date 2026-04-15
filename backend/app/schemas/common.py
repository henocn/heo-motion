import enum
from typing import Generic, TypeVar

from pydantic import BaseModel


# ================================================
# Enums metier partages entre models et schemas
# ================================================


class ProjectStatus(str, enum.Enum):
    DRAFT = "draft"
    STORYBOARD_READY = "storyboard_ready"
    IMAGES_READY = "images_ready"
    ASSETS_READY = "assets_ready"
    EXPORTED = "exported"
    ARCHIVED = "archived"


class ImageStatus(str, enum.Enum):
    PENDING = "pending"
    GENERATING = "generating"
    GENERATED = "generated"
    USER_EDITED = "user_edited"
    APPROVED = "approved"
    REJECTED = "rejected"


class JobStatus(str, enum.Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class AssetType(str, enum.Enum):
    HEAD = "head"
    EYES = "eyes"
    MOUTH = "mouth"
    LEFT_ARM = "left_arm"
    RIGHT_ARM = "right_arm"
    LEFT_LEG = "left_leg"
    RIGHT_LEG = "right_leg"
    BODY = "body"
    OBJECT = "object"
    BACKGROUND = "background_element"


class ExportFormat(str, enum.Enum):
    PNG_ZIP = "png_zip"
    SVG_ZIP = "svg_zip"
    AE_PROJECT = "ae_project"


# ================================================
# Schemas de reponse generiques
# ================================================


T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Reponse paginee generique reutilisable pour toutes les listes."""
    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int


class MessageResponse(BaseModel):
    """Reponse simple avec un message (delete, actions, etc.)."""
    message: str
    detail: str | None = None
