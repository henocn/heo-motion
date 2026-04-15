import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ProjectStatus


#################################################
#            Project Schemas                    #
#################################################


# Payload pour creer un nouveau projet
class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    script_raw_text: str = Field(..., min_length=1)
    art_direction: dict | None = Field(
        default=None,
        examples=[{"style": "flat_design", "palette": ["#2A9D8F", "#E9C46A"]}],
    )
    voiceover_audio_url: str | None = None
    settings: dict | None = None


# Payload pour modifier un projet existant
class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    script_raw_text: str | None = None
    art_direction: dict | None = None
    voiceover_audio_url: str | None = None
    settings: dict | None = None
    status: ProjectStatus | None = None


# Reponse renvoyee par l'API pour un projet
class ProjectResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    status: ProjectStatus
    art_direction: dict | None
    script_raw_text: str
    voiceover_audio_url: str | None
    settings: dict | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# Reponse allegee pour les listes (sans le script complet)
class ProjectListItem(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    status: ProjectStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
