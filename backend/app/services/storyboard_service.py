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


STORYBOARD_SYSTEM_PROMPT = """Tu es directeur artistique pour une vidéo motion design corporate type « explainer » (institutionnel, lisible, personnages découpables).

On te donne un script de voix off. Tu le découpes en scènes VISUELLES dans l'ORDRE du montage : chaque scène enchaîne la précédente comme une suite logique (même univers, mêmes personnages réutilisés avec les MÊMES intitulés courts d'une scène à l'autre, objets récurrents si le texte le suppose).

Pour CHAQUE scène, renvoie exactement ces champs JSON :
- script_excerpt : le passage de voix off couvert par la scène
- visual_description : 2 à 4 phrases COURTES maximum (en français). Décris seulement ce que la caméra montre : qui fait quoi, où, avec quel objet clé. Ton sobre et professionnel, comme une ligne de storyboard pour motion designer — PAS une liste encyclopédique, PAS de répétition des champs characters/objects/background, PAS de catalogue de style (« vector », « flat design », « soft lighting », etc.) : le style sera géré ailleurs pour la génération d'images.
- intention : une seule phrase (émotion ou message)
- shot_type : un parmi wide shot | medium shot | close-up | over-the-shoulder (ou équivalent court en anglais si tu préfères)
- characters : 1 à 4 entrées MAX, mots-clés ou très courtes étiquettes réutilisables (« homme costume bleu », « pharmacien blouse »)
- objects : 1 à 5 entrées MAX, objets vraiment utiles à l'action ou à l'enchaînement
- background : une seule courte phrase (décor / lieu), sans détailler chaque meuble

Règles de cohérence :
- Varie les cadrages quand le sens du texte change, mais garde une continuité visuelle (palette et types de lieux cohérents sauf si le script impose un changement d'univers).
- Poses simples (debout, 3/4, assis lisible) pour faciliter l'animation.
- Durée indicative par scène : environ 3 à 8 secondes de voix off.

Réponds UNIQUEMENT avec un tableau JSON d'objets, sans markdown ni texte avant/après.

Exemple de niveau de concision pour visual_description :
« Plan accueil : l'homme en costume tend une carte verte au client dont on voit la main. Comptoir blanc, écran en arrière-plan. »
"""


STORYBOARD_USER_PREFIX = (
    "Les scènes ci-dessous sont dans l'ordre chronologique du film ; assure la continuité visuelle entre elles.\n\n"
)


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
                user_prompt=f"{STORYBOARD_USER_PREFIX}{project.script_raw_text}",
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
