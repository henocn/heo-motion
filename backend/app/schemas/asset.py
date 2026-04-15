import uuid

from pydantic import BaseModel, Field

from app.schemas.common import AssetType


#################################################
#             Asset Schemas                     #
#################################################


# Payload pour modifier un asset
class AssetUpdate(BaseModel):
    layer_name: str | None = Field(default=None, max_length=100)
    subtype: str | None = Field(default=None, max_length=100)
    transform_data: dict | None = None


# Reponse renvoyee par l'API pour un asset
class AssetResponse(BaseModel):
    id: uuid.UUID
    scene_id: uuid.UUID
    asset_type: AssetType
    subtype: str | None
    bounding_box: dict | None
    mask_url: str | None
    original_png_url: str | None
    svg_url: str | None
    layer_name: str | None
    transform_data: dict | None
    confidence_score: float | None
    user_approved: bool

    model_config = {"from_attributes": True}
