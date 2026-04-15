import logging
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions import NotFoundException, ExternalServiceException
from app.integrations.openai_client import OpenAIClient
from app.models.scene import Scene
from app.repositories.project_repo import ProjectRepository
from app.repositories.scene_repo import SceneRepository
from app.schemas.common import ProjectStatus
from app.schemas.scene import SceneResponse


logger = logging.getLogger(__name__)


STORYBOARD_SYSTEM_PROMPT = """Tu es un directeur artistique spécialisé en motion design 2D (flat design, style institutionnel).

On te donne un script de voix off. Tu dois le découper en scènes visuelles pour une vidéo animée.

Pour chaque scène, tu dois fournir :
- script_excerpt : le morceau de texte correspondant
- visual_description : description détaillée de ce qu'on voit à l'écran
- intention : l'émotion ou le message de la scène
- shot_type : type de plan (wide shot, medium shot, close-up, etc.)
- characters : liste des personnages présents (noms génériques : "homme", "femme", "enfant"...)
- objects : liste des objets visibles
- background : description du fond/décor

IMPORTANT :
- Les personnages doivent être en position simple (debout, face caméra ou 3/4) pour faciliter l'animation
- Style flat design avec couleurs vives et formes géométriques simples
- Chaque scène doit durer environ 3 à 8 secondes de voix off
- Découpe de manière logique selon le sens du texte

Réponds UNIQUEMENT en JSON, un tableau d'objets. Pas de texte avant ou après.

Exemple de format :
[
  {
    "script_excerpt": "...",
    "visual_description": "...",
    "intention": "...",
    "shot_type": "medium shot",
    "characters": ["homme"],
    "objects": ["ordinateur"],
    "background": "bureau moderne"
  }
]"""


#################################################
#          StoryboardService                    #
#################################################


class StoryboardService:
    """Decoupe un script en scenes via le LLM et les enregistre en base."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.project_repo = ProjectRepository(session)
        self.scene_repo = SceneRepository(session)
        self.llm = OpenAIClient()

    # Lance le decoupage du script d'un projet en scenes
    async def generate_storyboard(self, project_id: uuid.UUID) -> list[SceneResponse]:
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise NotFoundException("Project", str(project_id))

        logger.info("Generating storyboard for project %s", project_id)

        try:
            scenes_data = await self.llm.chat_json(
                system_prompt=STORYBOARD_SYSTEM_PROMPT,
                user_prompt=project.script_raw_text,
                temperature=0.5,
            )
        except ValueError as e:
            raise ExternalServiceException("OpenAI", str(e))
        except Exception as e:
            logger.exception("OpenAI call failed for project %s", project_id)
            raise ExternalServiceException("OpenAI", str(e))

        if not isinstance(scenes_data, list):
            raise ExternalServiceException("OpenAI", "LLM response is not a list of scenes")

        await self.scene_repo.delete_by_project(project_id)

        created_scenes: list[Scene] = []
        for index, scene_data in enumerate(scenes_data):
            scene = Scene(
                project_id=project_id,
                order_index=index,
                script_excerpt=scene_data.get("script_excerpt", ""),
                visual_description=scene_data.get("visual_description", ""),
                intention=scene_data.get("intention", ""),
                shot_type=scene_data.get("shot_type", "medium shot"),
                characters=scene_data.get("characters", []),
                objects=scene_data.get("objects", []),
                background=scene_data.get("background", ""),
            )
            scene = await self.scene_repo.create(scene)
            created_scenes.append(scene)

        await self.project_repo.update(
            project, {"status": ProjectStatus.STORYBOARD_READY.value}
        )

        logger.info(
            "Storyboard generated: %d scenes for project %s",
            len(created_scenes),
            project_id,
        )
        return [SceneResponse.model_validate(s) for s in created_scenes]
