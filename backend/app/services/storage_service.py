import logging
import uuid
from pathlib import Path

import aiofiles

from app.config import settings


logger = logging.getLogger(__name__)


#################################################
#            StorageService                     #
#################################################


class StorageService:
    """Abstraction pour le stockage de fichiers (local filesystem pour le MVP)."""

    def __init__(self) -> None:
        self.media_root = settings.get_media_path()

    # Sauvegarde un fichier binaire et renvoie son chemin relatif
    async def save_file(
        self, content: bytes, category: str, extension: str = "png"
    ) -> str:
        category_dir = self.media_root / category
        category_dir.mkdir(parents=True, exist_ok=True)

        filename = f"{uuid.uuid4()}.{extension}"
        filepath = category_dir / filename

        async with aiofiles.open(filepath, "wb") as f:
            await f.write(content)

        relative_path = f"{category}/{filename}"
        logger.info("File saved: %s", relative_path)
        return relative_path

    # Lit un fichier depuis le stockage et renvoie son contenu binaire
    async def read_file(self, relative_path: str) -> bytes:
        filepath = self.media_root / relative_path
        if not filepath.exists():
            raise FileNotFoundError(f"File not found: {relative_path}")

        async with aiofiles.open(filepath, "rb") as f:
            return await f.read()

    # Supprime un fichier du stockage
    async def delete_file(self, relative_path: str) -> None:
        filepath = self.media_root / relative_path
        if filepath.exists():
            filepath.unlink()
            logger.info("File deleted: %s", relative_path)

    # Renvoie le chemin absolu d'un fichier
    def get_absolute_path(self, relative_path: str) -> Path:
        return self.media_root / relative_path
