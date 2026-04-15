import uuid
from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import ExportFormat, JobStatus


#################################################
#          GenerationJob Schemas                #
#################################################


class GenerationJobResponse(BaseModel):
    id: uuid.UUID
    scene_id: uuid.UUID
    replicate_prediction_id: str | None
    prompt: str | None
    negative_prompt: str | None
    model: str | None
    params: dict | None
    status: JobStatus
    result_image_url: str | None
    cost_usd: float | None
    error_message: str | None
    created_at: datetime
    finished_at: datetime | None

    model_config = {"from_attributes": True}


#################################################
#        SegmentationJob Schemas                #
#################################################


class SegmentationJobResponse(BaseModel):
    id: uuid.UUID
    scene_id: uuid.UUID
    source_image_url: str | None
    sam_model_version: str | None
    mediapipe_pose_used: bool
    status: JobStatus
    result_asset_ids: list | None
    error_message: str | None
    started_at: datetime | None
    finished_at: datetime | None

    model_config = {"from_attributes": True}


#################################################
#       VectorizationJob Schemas                #
#################################################


class VectorizationJobResponse(BaseModel):
    id: uuid.UUID
    asset_id: uuid.UUID
    tool: str | None
    params: dict | None
    status: JobStatus
    svg_result_url: str | None
    vector_quality_score: float | None
    error_message: str | None
    started_at: datetime | None
    finished_at: datetime | None

    model_config = {"from_attributes": True}


#################################################
#          ExportBatch Schemas                  #
#################################################


# Payload pour lancer un export
class ExportCreate(BaseModel):
    export_format: ExportFormat
    include_vector: bool = False
    include_masks: bool = False
    layer_naming_convention: str = "illustrator_standard"


class ExportBatchResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    export_format: ExportFormat
    include_vector: bool
    include_masks: bool
    layer_naming_convention: str | None
    export_url: str | None
    status: JobStatus
    error_message: str | None
    created_at: datetime
    expires_at: datetime | None

    model_config = {"from_attributes": True}
