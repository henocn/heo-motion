from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


#################################################
#              Settings                         #
#################################################


class Settings(BaseSettings):
    """Configuration centrale de l'application, alimentee par le fichier .env."""

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parent.parent / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- Database ---
    DATABASE_URL: str

    # --- Redis ---
    REDIS_URL: str = "redis://localhost:6379/0"

    # --- Image generation ---
    IMAGE_PROVIDER: str = "gemini"
    GOOGLE_AI_STUDIO_API_KEY: str = ""
    GEMINI_IMAGE_MODEL: str = "gemini-2.5-flash-image"
    REPLICATE_API_TOKEN: str = ""
    REPLICATE_MODEL: str = "google/imagen-4"

    # --- OpenAI / LLM + Image ---
    OPENAI_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o-mini"
    OPENAI_IMAGE_MODEL: str = "dall-e-3"
    OPENAI_IMAGE_QUALITY: str = "standard"

    # --- Storage ---
    MEDIA_ROOT: str = "./media"
    STORAGE_BACKEND: str = "local"

    # --- App ---
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    SECRET_KEY: str = "changeme-in-production"
    CORS_ORIGINS: str = "http://localhost:5173"

    # Renvoie la liste des origines CORS sous forme de liste
    def get_cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    # Renvoie le chemin absolu du dossier media
    def get_media_path(self) -> Path:
        media = Path(self.MEDIA_ROOT)
        if not media.is_absolute():
            media = Path(__file__).resolve().parent.parent / media
        media.mkdir(parents=True, exist_ok=True)
        return media


# Singleton utilise dans toute l'app via Depends()
settings = Settings()
