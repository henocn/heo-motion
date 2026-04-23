import asyncio
import logging
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.exceptions import NotFoundException, ValidationException
from app.integrations.sam3_client import (
    Sam3Client,
    join_prompts_for_replicate,
    parse_prompts_csv,
)
from app.repositories.scene_repo import SceneRepository
from app.schemas.sam3 import Sam3SegmentRequest, Sam3SegmentResponse
from app.services.storage_service import StorageService


logger = logging.getLogger(__name__)


#################################################
#        Sam3SegmentationService                #
#################################################


class Sam3SegmentationService:
    """Orchestre un appel SAM3 (Replicate) pour une scene : image generee + prompts CSV."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.scene_repo = SceneRepository(session)

    # Execute SAM3 sur l'image de la scene et enregistre le ZIP retourne
    async def run_sam3_for_scene(
        self,
        scene_id: uuid.UUID,
        body: Sam3SegmentRequest,
    ) -> Sam3SegmentResponse:
        if not settings.REPLICATE_API_TOKEN:
            raise ValidationException(
                "REPLICATE_API_TOKEN manquant : configurez la cle Replicate dans .env"
            )

        scene = await self.scene_repo.get_by_id(scene_id)
        if not scene:
            raise NotFoundException("Scene", str(scene_id))
        if not scene.generated_image_url:
            raise ValidationException(
                "Aucune image generee pour cette scene : generez d'abord une image."
            )

        parts = parse_prompts_csv(body.prompts_csv)
        if not parts:
            raise ValidationException(
                "Indiquez au moins un prompt (ex: clothes, person) separe par des virgules."
            )
        prompt_used = join_prompts_for_replicate(parts)

        media_root = settings.get_media_path()
        image_abs = media_root / scene.generated_image_url
        if not image_abs.is_file():
            raise ValidationException(f"Fichier image introuvable : {scene.generated_image_url}")

        client = Sam3Client()

        def _call_sync() -> bytes:
            out = client.run(
                image_abs,
                prompt_used,
                mask_only=body.mask_only,
                threshold=body.threshold,
                mask_color=body.mask_color,
                return_zip=body.return_zip,
                mask_opacity=body.mask_opacity,
                save_overlay=body.save_overlay,
            )
            return out.read_bytes()

        zip_bytes = await asyncio.to_thread(_call_sync)

        storage = StorageService()
        zip_path = await storage.save_file(zip_bytes, "sam3", extension="zip")

        logger.info(
            "SAM3 Replicate OK scene=%s zip=%s prompts=%s",
            scene_id,
            zip_path,
            parts,
        )
        return Sam3SegmentResponse(
            zip_path=zip_path,
            prompt_parts=parts,
            prompt_used=prompt_used,
        )
