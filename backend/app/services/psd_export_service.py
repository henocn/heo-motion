import io
import logging
import uuid
from pathlib import Path

from PIL import Image
from psd_tools import PSDImage
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.exceptions import NotFoundException, ValidationException
from app.models.asset import Asset
from app.models.scene import Scene
from app.repositories.asset_repo import AssetRepository
from app.repositories.scene_repo import SceneRepository


logger = logging.getLogger(__name__)


#################################################
#            PsdExportService                   #
#################################################


class PsdExportService:
    """Construit un PSD multi-calques a partir des PNG segmentes et de leurs bbox."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.scene_repo = SceneRepository(session)
        self.asset_repo = AssetRepository(session)

    # Genere un PSD en memoire pour une scene (reference + calques positionnes)
    async def export_scene_psd_bytes(
        self, scene_id: uuid.UUID
    ) -> tuple[bytes, str]:
        scene = await self.scene_repo.get_by_id(scene_id)
        if not scene:
            raise NotFoundException("Scene", str(scene_id))
        if not scene.generated_image_url:
            raise ValidationException(
                "Aucune image source pour cette scene (generez d'abord une image)."
            )

        assets = await self.asset_repo.get_by_scene(scene_id)
        if not assets:
            raise ValidationException(
                "Aucun asset segmente : lancez la segmentation avant d'exporter."
            )

        media_root = settings.get_media_path()
        data = _build_psd_bytes(scene, assets, media_root)
        filename = f"scene-{str(scene_id)[:8]}-segmentation.psd"
        return data, filename




# Nettoie un nom de calque pour Photoshop (longueur et caracteres)
def _sanitize_layer_name(name: str | None, index: int) -> str:
    raw = (name or "").strip() or f"Calque {index}"
    safe = "".join(c for c in raw if 32 <= ord(c) < 0x10000 and c not in "<>:\"/\\|?*")
    return (safe[:120] if safe else f"Calque {index}")


# Trie les assets : fonds d'abord, puis objets du plus grand au plus petit (details au-dessus)
def _sorted_assets(assets: list[Asset]) -> list[Asset]:
    def sort_key(a: Asset) -> tuple[int, int]:
        bb = a.bounding_box or {}
        area = max(1, (bb.get("w") or 0) * (bb.get("h") or 0))
        group = 0 if a.asset_type == "background_element" else 1
        return (group, -area)

    return sorted(assets, key=sort_key)


# Assemble le PSD : calque reference plein cadre puis calques PNG aux positions bbox
def _build_psd_bytes(scene: Scene, assets: list[Asset], media_root: Path) -> bytes:
    ref_path = media_root / scene.generated_image_url
    if not ref_path.exists():
        raise ValidationException(f"Fichier image introuvable : {scene.generated_image_url}")

    ref_img = Image.open(ref_path).convert("RGB")
    width, height = ref_img.size

    psd = PSDImage.new(mode="RGB", size=(width, height), depth=8)
    psd.create_pixel_layer(
        ref_img,
        name="Reference (image source)",
        top=0,
        left=0,
        opacity=255,
    )

    ordered = _sorted_assets(assets)
    for idx, asset in enumerate(ordered, start=1):
        if not asset.original_png_url:
            logger.warning("Asset %s sans original_png_url, ignore", asset.id)
            continue
        png_path = media_root / asset.original_png_url
        if not png_path.exists():
            raise ValidationException(
                f"Fichier asset introuvable : {asset.original_png_url}"
            )

        layer_img = Image.open(png_path).convert("RGBA")
        bb = asset.bounding_box or {}
        top = int(bb.get("y", 0))
        left = int(bb.get("x", 0))
        name = _sanitize_layer_name(asset.layer_name, idx)

        psd.create_pixel_layer(
            layer_img,
            name=name,
            top=top,
            left=left,
            opacity=255,
        )

    buffer = io.BytesIO()
    psd.save(buffer)
    return buffer.getvalue()
