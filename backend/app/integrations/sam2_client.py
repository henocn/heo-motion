import logging
import uuid as _uuid

import numpy as np
from PIL import Image

from app.config import settings


logger = logging.getLogger(__name__)

_pipeline = None


# Charge le pipeline SAM2 mask-generation une seule fois (singleton)
def _get_pipeline():
    global _pipeline
    if _pipeline is None:
        from transformers import pipeline as hf_pipeline

        model_id = "facebook/sam2.1-hiera-small"
        logger.info("Loading SAM2 model: %s (CPU)...", model_id)
        _pipeline = hf_pipeline(
            "mask-generation",
            model=model_id,
            device=-1,
        )
        logger.info("SAM2 model loaded")
    return _pipeline


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
    Client de segmentation utilisant SAM2 (Segment Anything Model 2)
    via HuggingFace transformers. Decoupe automatiquement TOUS les
    elements de l'image en assets PNG transparents individuels.
    """

    def __init__(self):
        self.media_root = settings.get_media_path()

    # Segmente une image en multiples assets via SAM2 automatic mask generation
    def segment_image(
        self,
        image_path: str,
        min_mask_area_ratio: float = 0.005,
        max_masks: int = 20,
        pred_iou_thresh: float = 0.86,
        stability_score_thresh: float = 0.90,
    ) -> SegmentationResult:
        abs_path = self.media_root / image_path
        if not abs_path.exists():
            raise FileNotFoundError(f"Image not found: {abs_path}")

        logger.info("Segmenting image with SAM2: %s", image_path)
        original = Image.open(abs_path).convert("RGB")
        width, height = original.size
        total_pixels = width * height

        pipe = _get_pipeline()
        outputs = pipe(
            original,
            points_per_batch=64,
            pred_iou_thresh=pred_iou_thresh,
            stability_score_thresh=stability_score_thresh,
        )

        masks = outputs.get("masks", [])
        scores = outputs.get("scores", [None] * len(masks))

        logger.info("SAM2 returned %d raw masks", len(masks))

        original_rgba = original.copy().convert("RGBA")
        original_np = np.array(original_rgba)

        sorted_items = sorted(
            zip(masks, scores),
            key=lambda x: x[1] if x[1] is not None else 0,
            reverse=True,
        )

        result = SegmentationResult()
        asset_index = 0

        for mask, score in sorted_items:
            mask_np = np.array(mask).astype(bool)

            mask_area = mask_np.sum()
            area_ratio = mask_area / total_pixels

            if area_ratio < min_mask_area_ratio:
                continue
            if asset_index >= max_masks:
                break

            asset_index += 1

            is_background = area_ratio > 0.75
            asset_type = "background_element" if is_background else "object"
            layer_name = "Background" if is_background else f"Element {asset_index}"

            element_rgba = np.zeros_like(original_np)
            element_rgba[:, :, :3] = original_np[:, :, :3]
            element_rgba[:, :, 3] = (mask_np * 255).astype(np.uint8)
            element_img = Image.fromarray(element_rgba, "RGBA")

            bbox = self._compute_bbox(mask_np)

            if not is_background and bbox["w"] > 0 and bbox["h"] > 0:
                cropped = element_img.crop((
                    bbox["x"], bbox["y"],
                    bbox["x"] + bbox["w"], bbox["y"] + bbox["h"],
                ))
            else:
                cropped = element_img

            element_path = self._save_png(cropped, "segmentation")

            mask_img = Image.fromarray((mask_np * 255).astype(np.uint8), "L")
            mask_path = self._save_png(mask_img, "masks")

            conf = float(score) if score is not None else 0.0

            result.assets.append({
                "asset_type": asset_type,
                "subtype": "auto_sam2",
                "layer_name": layer_name,
                "original_png_url": element_path,
                "mask_url": mask_path,
                "bounding_box": bbox,
                "confidence_score": round(conf, 4),
            })

        logger.info(
            "Segmentation done: %d assets extracted from %d raw masks",
            len(result.assets), len(masks),
        )
        return result

    # Calcule la bounding box d'un masque booleen
    def _compute_bbox(self, mask: np.ndarray) -> dict:
        rows = np.any(mask, axis=1)
        cols = np.any(mask, axis=0)
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
