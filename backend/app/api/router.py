from fastapi import APIRouter

from app.api.health import router as health_router
from app.api.projects import router as projects_router
from app.api.scenes import router as scenes_router
from app.api.assets import router as assets_router
from app.api.generation import router as generation_router
from app.api.sam3 import router as sam3_router
from app.api.settings import router as settings_router


#################################################
#              API Router                       #
#################################################


# Routeur principal qui agrege tous les sous-routeurs
api_router = APIRouter(prefix="/api/v1")

api_router.include_router(health_router)
api_router.include_router(projects_router)
api_router.include_router(scenes_router)
api_router.include_router(assets_router)
api_router.include_router(generation_router)
api_router.include_router(sam3_router)
api_router.include_router(settings_router)
