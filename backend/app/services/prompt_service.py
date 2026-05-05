import logging
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions import NotFoundException
from app.integrations.openai_client import OpenAIClient
from app.repositories.project_repo import ProjectRepository
from app.repositories.scene_repo import SceneRepository
from app.schemas.scene import SceneResponse


logger = logging.getLogger(__name__)


_DEFAULT_SYSTEM_PROMPT = """Tu es un expert en génération d'images par IA (Stable Diffusion, Flux).

On te donne une scène de motion design corporate (style explainer institutionnel). Tu produis UN prompt d'image : une ou deux phrases denses + quelques qualificatifs de style si utile, sans redonder avec tout le contexte.

Règles :
- S'appuyer surtout sur la description visuelle ; plan, personnages, objets et décor ne servent qu'à compléter ce qui manque.
- Style illustratif vectoriel / flat, poses simples, lisibles pour découpe animation.
- Pas de texte ni typo dans l'image ; fond clair et contrasté si le brief le permet.
- Réponse : uniquement le prompt, sans guillemets ni explication."""

_DEFAULT_NEGATIVE_PROMPT = (
    "realistic, photorealistic, photographic, 3d render, texture, noise, grain, rough, "
    "text, typography, writing, label, watermark, signature, blurry, low resolution, "
    "distorted, complex background, busy scene, messy, dark, gritty, monochrome, "
    "multiple views, collage, border, frame"
)

_system_prompt = _DEFAULT_SYSTEM_PROMPT
_negative_prompt = _DEFAULT_NEGATIVE_PROMPT


#################################################
#            PromptService                      #
#################################################


class PromptService:
    """Genere des prompts d'image optimises pour chaque scene."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.project_repo = ProjectRepository(session)
        self.scene_repo = SceneRepository(session)
        self.llm = OpenAIClient()

    # Genere un prompt d'image pour une scene donnee
    async def generate_prompt_for_scene(
        self, scene_id: uuid.UUID
    ) -> SceneResponse:
        scene = await self.scene_repo.get_by_id(scene_id)
        if not scene:
            raise NotFoundException("Scene", str(scene_id))

        project = await self.project_repo.get_by_id(scene.project_id)
        art_style = ""
        if project and project.art_direction:
            art_style = f"\nDirection artistique : {project.art_direction}"

        user_prompt = (
            "Consigne : un seul prompt d'image, fluide et relativement court. "
            "La « description visuelle » est la source principale ; "
            "n'en fais pas une copie exhaustive si les listes répètent déjà son contenu.\n\n"
            f"Description visuelle : {scene.visual_description}\n"
            f"Type de plan : {scene.shot_type}\n"
            f"Personnages : {', '.join(scene.characters or [])}\n"
            f"Objets : {', '.join(scene.objects or [])}\n"
            f"Décor : {scene.background}"
            f"{art_style}"
        )

        prompt = await self.llm.chat(
            system_prompt=_system_prompt,
            user_prompt=user_prompt,
            temperature=0.6,
            max_tokens=380,
        )

        prompt = prompt.strip().strip('"').strip("'")

        scene = await self.scene_repo.update(
            scene, {"prompt_generated": prompt}
        )

        logger.info("Prompt generated for scene %s", scene_id)
        return SceneResponse.model_validate(scene)

    # Renvoie le negative prompt courant
    @staticmethod
    def get_negative_prompt() -> str:
        return _negative_prompt

    # Renvoie le prompt systeme courant
    @staticmethod
    def get_system_prompt() -> str:
        return _system_prompt

    # Modifie le prompt systeme en memoire (vide = retour au defaut)
    @staticmethod
    def set_system_prompt(value: str) -> None:
        global _system_prompt
        _system_prompt = value.strip() if value.strip() else _DEFAULT_SYSTEM_PROMPT

    # Modifie le negative prompt en memoire (vide = retour au defaut)
    @staticmethod
    def set_negative_prompt(value: str) -> None:
        global _negative_prompt
        _negative_prompt = value.strip() if value.strip() else _DEFAULT_NEGATIVE_PROMPT
