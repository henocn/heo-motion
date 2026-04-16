import logging
import uuid as _uuid

import numpy as np
from PIL import Image
from rembg import remove, new_session

from app.config import settings


logger = logging.getLogger(__name__)

_rembg_session = None


# Retourne (ou cree) la session rembg singleton pour eviter de recharger le modele
def _get_session():
    global _rembg_session
    if _rembg_session is None:
        logger.info("Loading rembg model (u2net)...")
        _rembg_session = new_session("u2net")
        logger.info("rembg model loaded")
    return _rembg_session


#################################################
#         SegmentationResult                    #
#################################################


class SegmentationResult:
    """Contient les resultats de segmentation d'une image."""

    def __init__(self):
        self.assets: list[dict] = []


#################################################
#            SAM2Client                         #
#################################################


class SAM2Client:
    """
    Client de segmentation utilisant rembg pour separer le sujet du fond.
    Produit : sujet PNG transparent, fond PNG, masque binaire.
    """

    def __init__(self):
        self.media_root = settings.get_media_path()

    # Segmente une image en sujet (sans fond) + fond + masque
    def segment_image(self, image_path: str) -> SegmentationResult:
        abs_path = self.media_root / image_path
        if not abs_path.exists():
            raise FileNotFoundError(f"Image not found: {abs_path}")

        logger.info("Segmenting image: %s", image_path)
        original = Image.open(abs_path).convert("RGBA")
        width, height = original.size

        session = _get_session()
        subject_rgba = remove(original, session=session, bgcolor=None)

        alpha = np.array(subject_rgba.split()[-1])
        mask_binary = (alpha > 128).astype(np.uint8) * 255
        mask_image = Image.fromarray(mask_binary, mode="L")

        bg_image = original.convert("RGB").copy()
        bg_array = np.array(bg_image)
        mask_3ch = np.stack([mask_binary] * 3, axis=-1)
        bg_array[mask_3ch > 128] = 0
        bg_image = Image.fromarray(bg_array)

        result = SegmentationResult()

        subject_path = self._save_png(subject_rgba, "segmentation")
        mask_path = self._save_png(mask_image, "masks")

        bbox = self._compute_bbox(alpha)

        result.assets.append({
            "asset_type": "body",
            "subtype": "subject_foreground",
            "layer_name": "Subject",
            "original_png_url": subject_path,
            "mask_url": mask_path,
            "bounding_box": bbox,
            "confidence_score": 0.95,
        })

        bg_path = self._save_png(bg_image, "segmentation")
        result.assets.append({
            "asset_type": "background_element",
            "subtype": "background",
            "layer_name": "Background",
            "original_png_url": bg_path,
            "mask_url": None,
            "bounding_box": {"x": 0, "y": 0, "w": width, "h": height},
            "confidence_score": 0.90,
        })

        logger.info("Segmentation done: %d assets", len(result.assets))
        return result

    # Calcule la bounding box du masque (zone non-transparente)
    def _compute_bbox(self, alpha: np.ndarray) -> dict:
        rows = np.any(alpha > 128, axis=1)
        cols = np.any(alpha > 128, axis=0)
        if not rows.any():
            return {"x": 0, "y": 0, "w": 0, "h": 0}
        y_min, y_max = np.where(rows)[0][[0, -1]]
        x_min, x_max = np.where(cols)[0][[0, -1]]
        return {
            "x": int(x_min),
            "y": int(y_min),
            "w": int(x_max - x_min + 1),
            "h": int(y_max - y_min + 1),
        }

    # Sauvegarde une image PIL et retourne le chemin relatif
    def _save_png(self, image: Image.Image, category: str) -> str:
        out_dir = self.media_root / category
        out_dir.mkdir(parents=True, exist_ok=True)

        filename = f"{_uuid.uuid4()}.png"
        filepath = out_dir / filename

        image.save(filepath, format="PNG")
        relative = f"{category}/{filename}"
        logger.info("Saved: %s", relative)
        return relative
