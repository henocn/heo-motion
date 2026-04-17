from pydantic import BaseModel

from fastapi import APIRouter

from app.config import settings
from app.services.prompt_service import PromptService


router = APIRouter(tags=["Settings"])


# Schema de lecture des parametres
class AppSettingsResponse(BaseModel):
    image_provider: str
    openai_image_model: str
    openai_image_quality: str
    replicate_model: str
    gemini_image_model: str
    llm_model: str
    system_prompt: str
    negative_prompt: str


# Schema de modification des parametres
class AppSettingsUpdate(BaseModel):
    image_provider: str | None = None
    openai_image_model: str | None = None
    openai_image_quality: str | None = None
    replicate_model: str | None = None
    gemini_image_model: str | None = None
    llm_model: str | None = None
    system_prompt: str | None = None
    negative_prompt: str | None = None


ALLOWED_PROVIDERS = {"openai", "replicate", "gemini"}


# Renvoie la configuration courante
@router.get("/settings", response_model=AppSettingsResponse)
async def get_settings() -> AppSettingsResponse:
    return AppSettingsResponse(
        image_provider=settings.IMAGE_PROVIDER,
        openai_image_model=settings.OPENAI_IMAGE_MODEL,
        openai_image_quality=settings.OPENAI_IMAGE_QUALITY,
        replicate_model=settings.REPLICATE_MODEL,
        gemini_image_model=settings.GEMINI_IMAGE_MODEL,
        llm_model=settings.LLM_MODEL,
        system_prompt=PromptService.get_system_prompt(),
        negative_prompt=PromptService.get_negative_prompt(),
    )


# Met a jour la configuration en memoire (sans redemarrage)
@router.put("/settings", response_model=AppSettingsResponse)
async def update_settings(data: AppSettingsUpdate) -> AppSettingsResponse:
    if data.image_provider is not None:
        if data.image_provider.lower() not in ALLOWED_PROVIDERS:
            from fastapi import HTTPException
            raise HTTPException(
                status_code=422,
                detail=f"Provider invalide. Choix : {', '.join(ALLOWED_PROVIDERS)}"
            )
        settings.IMAGE_PROVIDER = data.image_provider.lower()

    if data.openai_image_model is not None:
        settings.OPENAI_IMAGE_MODEL = data.openai_image_model
    if data.openai_image_quality is not None:
        settings.OPENAI_IMAGE_QUALITY = data.openai_image_quality
    if data.replicate_model is not None:
        settings.REPLICATE_MODEL = data.replicate_model
    if data.gemini_image_model is not None:
        settings.GEMINI_IMAGE_MODEL = data.gemini_image_model
    if data.llm_model is not None:
        settings.LLM_MODEL = data.llm_model
    if data.system_prompt is not None:
        PromptService.set_system_prompt(data.system_prompt)
    if data.negative_prompt is not None:
        PromptService.set_negative_prompt(data.negative_prompt)

    return await get_settings()
