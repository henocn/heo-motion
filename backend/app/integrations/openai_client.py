import json
import logging

from openai import AsyncOpenAI

from app.config import settings


logger = logging.getLogger(__name__)


#################################################
#             OpenAIClient                      #
#################################################


class OpenAIClient:
    """Wrapper autour de l'API OpenAI pour les appels LLM (storyboard, prompts)."""

    def __init__(self) -> None:
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.LLM_MODEL

    # Envoie un prompt au LLM et renvoie la reponse texte brute
    async def chat(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 4000,
    ) -> str:
        logger.info("OpenAI request: model=%s, temp=%.1f", self.model, temperature)

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=temperature,
            max_tokens=max_tokens,
        )

        content = response.choices[0].message.content or ""
        logger.info(
            "OpenAI response: %d tokens used",
            response.usage.total_tokens if response.usage else 0,
        )
        return content

    # Envoie un prompt et parse la reponse comme du JSON
    async def chat_json(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.4,
        max_tokens: int = 4000,
    ) -> dict | list:
        raw = await self.chat(system_prompt, user_prompt, temperature, max_tokens)

        cleaned = raw.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]

        try:
            return json.loads(cleaned.strip())
        except json.JSONDecodeError as e:
            logger.error("Failed to parse LLM JSON: %s\nRaw: %s", e, raw[:500])
            raise ValueError(f"LLM returned invalid JSON: {e}") from e
