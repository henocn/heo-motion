import io
import logging
from pathlib import Path
from typing import Any

import httpx
import replicate

from app.config import settings


logger = logging.getLogger(__name__)


# Modele Replicate SAM3 : version figee (evite POST .../models/.../predictions -> 404 sans version).
# Derniere version listee sur https://replicate.com/mattsays/sam3-image/versions
SAM3_REPLICATE_MODEL = (
    "mattsays/sam3-image:"
    "d73db077226443ba4fafd34e233b3626b552eac2a433f90c7c32a9ac89bd9e72"
)


#################################################
#              Sam3Output                       #
#################################################


class Sam3Output:
    """Resultat brut de l'appel Replicate (URL ou flux a telecharger)."""

    def __init__(self, raw: Any) -> None:
        self.raw = raw

    # URL du fichier produit (zip ou image) si disponible
    def result_url(self) -> str | None:
        if self.raw is None:
            return None
        if hasattr(self.raw, "url"):
            u = self.raw.url
            return str(u() if callable(u) else u)
        if isinstance(self.raw, str) and self.raw.startswith("http"):
            return self.raw
        if isinstance(self.raw, list) and self.raw:
            first = self.raw[0]
            if hasattr(first, "url"):
                u = first.url
                return str(u() if callable(u) else u)
            return str(first)
        return None

    # Contenu binaire (zip PNG masques, ou image overlay / masque)
    def read_bytes(self) -> bytes:
        if self.raw is None:
            raise ValueError("SAM3: pas de sortie Replicate")

        if hasattr(self.raw, "read"):
            data = self.raw.read()
            if isinstance(data, bytes):
                return data

        url = self.result_url()
        if url:
            with httpx.Client(timeout=120.0) as client:
                r = client.get(url)
                r.raise_for_status()
                return r.content

        raise TypeError(f"SAM3: type de sortie non supporte: {type(self.raw)}")




#################################################
#         Prompts CSV (frontend virgules)       #
#################################################


# Decoupe une chaine saisie cote frontend (prompts separes par des virgules)
def parse_prompts_csv(text: str) -> list[str]:
    if not text or not str(text).strip():
        return []
    return [p.strip() for p in str(text).split(",") if p.strip()]


# Assemble les parties en un seul prompt envoye a Replicate (un appel API)
def join_prompts_for_replicate(parts: list[str]) -> str:
    if not parts:
        raise ValueError("Au moins un prompt est requis (separes par des virgules).")
    return ", ".join(parts)




#################################################
#              Sam3Client                       #
#################################################


class Sam3Client:
    """
    Integration Replicate mattsays/sam3-image (SAM 3).
    Input aligne sur la doc Replicate : image, prompt, mask_only, threshold,
    mask_color, return_zip, mask_opacity, save_overlay.
    """

    def __init__(self) -> None:
        self._client = replicate.Client(api_token=settings.REPLICATE_API_TOKEN)

    # Lance une segmentation sur une image (fichier local, bytes ou URL HTTPS)
    def run(
        self,
        image: str | Path | bytes,
        prompt: str,
        *,
        mask_only: bool = False,
        threshold: float = 0.5,
        mask_color: str = "green",
        return_zip: bool = True,
        mask_opacity: float = 0.5,
        save_overlay: bool = False,
    ) -> Sam3Output:
        payload = self._build_input(
            image,
            prompt,
            mask_only=mask_only,
            threshold=threshold,
            mask_color=mask_color,
            return_zip=return_zip,
            mask_opacity=mask_opacity,
            save_overlay=save_overlay,
        )
        logger.info("Replicate SAM3: model=%s prompt=%r", SAM3_REPLICATE_MODEL, prompt[:120])
        out = self._client.run(SAM3_REPLICATE_MODEL, input=payload)
        return Sam3Output(out)

    # Construit le dict input exactement comme l'API Replicate
    def _build_input(
        self,
        image: str | Path | bytes,
        prompt: str,
        *,
        mask_only: bool,
        threshold: float,
        mask_color: str,
        return_zip: bool,
        mask_opacity: float,
        save_overlay: bool,
    ) -> dict[str, Any]:
        if isinstance(image, str) and image.startswith(("http://", "https://")):
            image_field: Any = image
        elif isinstance(image, (str, Path)):
            p = Path(image)
            if not p.is_file():
                raise FileNotFoundError(f"Image introuvable: {p}")
            image_field = io.BytesIO(p.read_bytes())
        elif isinstance(image, bytes):
            image_field = io.BytesIO(image)
        else:
            raise TypeError(f"Type image non supporte: {type(image)}")

        return {
            "image": image_field,
            "prompt": prompt,
            "mask_only": mask_only,
            "threshold": float(threshold),
            "mask_color": mask_color,
            "return_zip": return_zip,
            "mask_opacity": float(mask_opacity),
            "save_overlay": save_overlay,
        }
