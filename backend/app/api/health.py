from fastapi import APIRouter


router = APIRouter(tags=["Health"])


# Verifie que l'API est en ligne
@router.get("/health")
async def health_check() -> dict:
    return {"status": "ok", "service": "heo-motion"}
