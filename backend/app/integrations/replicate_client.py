import logging

import httpx
import replicate

from app.config import settings


logger = logging.getLogger(__name__)


#################################################
#           ReplicateClient                     #
#################################################


class ReplicateClient:
    """Wrapper autour de l'API Replicate pour la generation d'images."""

    def __init__(self) -> None:
        self.client = replicate.Client(api_token=settings.REPLICATE_API_TOKEN)
        self.model = settings.REPLICATE_MODEL

    # Lance une generation d'image et renvoie l'URL du resultat
    async def generate_image(
        self,
        prompt: str,
        negative_prompt: str = "",
        width: int = 1024,
        height: int = 1024,
        num_inference_steps: int = 30,
        guidance_scale: float = 7.5,
        seed: int | None = None,
    ) -> str:
        logger.info("Replicate request: model=%s", self.model)

        input_params = {
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "width": width,
            "height": height,
            "num_inference_steps": num_inference_steps,
            "guidance_scale": guidance_scale,
        }
        if seed is not None:
            input_params["seed"] = seed

        output = self.client.run(self.model, input=input_params)

        if isinstance(output, list) and len(output) > 0:
            image_url = str(output[0])
        elif hasattr(output, "__iter__"):
            image_url = str(next(iter(output)))
        else:
            image_url = str(output)

        logger.info("Replicate result: %s", image_url[:100])
        return image_url

    # Telecharge une image depuis une URL et renvoie les bytes
    async def download_image(self, url: str) -> bytes:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.content
