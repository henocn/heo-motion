import uuid

from pydantic import BaseModel, Field

from app.schemas.common import ImageStatus, JobStatus


#################################################
#             Scene Schemas                     #
#################################################


# Payload pour creer une scene manuellement
class SceneCreate(BaseModel):
    order_index: int = Field(..., ge=0)
    script_excerpt: str | None = None
    visual_description: str | None = None
    intention: str | None = None
    shot_type: str | None = None
    characters: list[str] | None = None
    objects: list[str] | None = None
    background: str | None = None


# Payload pour modifier une scene
class SceneUpdate(BaseModel):
    order_index: int | None = Field(default=None, ge=0)
    script_excerpt: str | None = None
    visual_description: str | None = None
    intention: str | None = None
    shot_type: str | None = None
    characters: list[str] | None = None
    objects: list[str] | None = None
    background: str | None = None
    prompt_generated: str | None = None
    user_comment: str | None = None


# Reponse renvoyee par l'API pour une scene
class SceneResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    order_index: int
    script_excerpt: str | None
    visual_description: str | None
    intention: str | None
    shot_type: str | None
    characters: list[str] | None
    objects: list[str] | None
    background: str | None
    prompt_generated: str | None
    image_generation_params: dict | None
    generated_image_url: str | None
    user_validated_image_url: str | None
    user_approved: bool
    image_status: ImageStatus
    segmentation_status: JobStatus | None
    vectorization_status: JobStatus | None

    model_config = {"from_attributes": True}
