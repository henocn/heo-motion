from pydantic import BaseModel, Field


#################################################
#            Schemas SAM3 (Replicate)           #
#################################################


class Sam3SegmentRequest(BaseModel):
    """Corps POST : prompts saisis separes par des virgules cote frontend."""

    prompts_csv: str = Field(
        ...,
        min_length=1,
        description="Ex: clothes, person, face — seront fusionnes pour un seul appel SAM3",
    )
    threshold: float = Field(default=0.5, ge=0.0, le=1.0)
    mask_only: bool = False
    mask_color: str = Field(default="green")
    return_zip: bool = True
    mask_opacity: float = Field(default=0.5, ge=0.0, le=1.0)
    save_overlay: bool = False


class Sam3SegmentResponse(BaseModel):
    """Chemin relatif du ZIP sauvegarde + detail des prompts utilises."""

    zip_path: str
    prompt_parts: list[str]
    prompt_used: str
