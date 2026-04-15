import logging
import time
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router
from app.config import settings
from app.exceptions import register_exception_handlers
from app.utils.logging import setup_logging


logger = logging.getLogger("heo_motion.requests")


# Initialise et ferme les ressources au demarrage/arret du serveur
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    setup_logging("DEBUG" if settings.APP_DEBUG else "INFO")
    logger.info("HEO-MOTION API started on %s:%s", settings.APP_HOST, settings.APP_PORT)
    yield
    logger.info("HEO-MOTION API shutting down")


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

    # Middleware qui log chaque requete HTTP (methode, path, status, duree)
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000

        if not request.url.path.startswith("/media"):
            logger.info(
                '%s %s %s (%.0fms)',
                request.method,
                request.url.path,
                response.status_code,
                duration_ms,
            )

        return response

    register_exception_handlers(app)
    app.include_router(api_router)

    media_path = settings.get_media_path()
    app.mount("/media", StaticFiles(directory=str(media_path)), name="media")

    return app


app = create_app()
