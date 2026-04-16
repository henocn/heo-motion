import logging

from google import genai
from google.genai import types

from app.config import settings


logger = logging.getLogger(__name__)


#################################################
#           GeminiImageClient                   #
#################################################


class GeminiImageClient:
    """Wrapper autour de l'API Gemini pour la generation d'images via Google AI Studio."""

    def __init__(self) -> None:
        self.client = genai.Client(api_key=settings.GOOGLE_AI_STUDIO_API_KEY)
        self.model = settings.GEMINI_IMAGE_MODEL

    # Genere une image a partir d'un prompt et renvoie les bytes PNG
    def generate_image(
        self,
        prompt: str,
        negative_prompt: str = "",
        width: int = 1024,
        height: int = 1024,
    ) -> bytes:
        full_prompt = prompt
        if negative_prompt:
            full_prompt += f"\n\nAvoid: {negative_prompt}"

        logger.info("Gemini image request: model=%s, prompt length=%d", self.model, len(full_prompt))

        response = self.client.models.generate_content(
            model=self.model,
            contents=full_prompt,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE"],
            ),
        )

        if not response.candidates:
            raise RuntimeError("Gemini returned no candidates — the prompt may have been blocked by safety filters")

        candidate = response.candidates[0]
        for part in candidate.content.parts:
            if part.inline_data and part.inline_data.mime_type.startswith("image/"):
                logger.info("Gemini image generated: %d bytes", len(part.inline_data.data))
                return part.inline_data.data

        raise RuntimeError("Gemini response did not contain an image")
