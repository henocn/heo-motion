import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


logger = logging.getLogger(__name__)


#################################################
#           Exceptions Custom                   #
#################################################


class AppException(Exception):
    """Exception de base pour toute l'application."""

    def __init__(self, message: str = "Internal server error", status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class NotFoundException(AppException):
    """Ressource introuvable (404)."""

    def __init__(self, resource: str = "Resource", resource_id: str = ""):
        detail = f"{resource} not found"
        if resource_id:
            detail = f"{resource} with id '{resource_id}' not found"
        super().__init__(message=detail, status_code=404)


class ValidationException(AppException):
    """Erreur de validation metier (422)."""

    def __init__(self, message: str = "Validation error"):
        super().__init__(message=message, status_code=422)


class ConflictException(AppException):
    """Conflit d'etat sur une ressource (409)."""

    def __init__(self, message: str = "Resource conflict"):
        super().__init__(message=message, status_code=409)


class ExternalServiceException(AppException):
    """Erreur lors de l'appel a un service externe (502)."""

    def __init__(self, service: str, message: str = ""):
        detail = f"External service '{service}' failed"
        if message:
            detail += f": {message}"
        super().__init__(message=detail, status_code=502)


# Enregistre les handlers d'exceptions sur l'app FastAPI
def register_exception_handlers(app: FastAPI) -> None:

    # Handler pour les exceptions metier de l'application
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        logger.warning("AppException [%d]: %s", exc.status_code, exc.message)
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.message},
        )

    # Handler generique pour les exceptions non gerees
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled exception: %s", str(exc))
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error"},
        )
