from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router
from app.config import settings
from app.exceptions import register_exception_handlers
from app.utils.logging import setup_logging


# Initialise et ferme les ressources au demarrage/arret du serveur
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    setup_logging("DEBUG" if settings.APP_DEBUG else "INFO")
    yield


# Cree et configure l'application FastAPI
def create_app() -> FastAPI:
    app = FastAPI(
        title="HEO-MOTION API",
        description="Pipeline automatise de production de motion design",
        version="0.1.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.get_cors_origins(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)
    app.include_router(api_router)

    media_path = settings.get_media_path()
    app.mount("/media", StaticFiles(directory=str(media_path)), name="media")

    return app


app = create_app()
