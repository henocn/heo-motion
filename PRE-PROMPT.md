PROJET INITIAL
L’objectif est de créer un logiciel qui automatise une grande partie du processus de création de vidéos en motion design, afin de gagner en rapidité et en efficacité de production.

Je te détaille ci-dessous le contexte, le besoin et les fonctionnalités attendues.

⸻

1. 🎯 CONTEXTE

Nous produisons régulièrement des vidéos en motion design (animations 2D sans tournage caméra).

Le processus actuel est le suivant :
	1.	Rédaction d’un script (voix off)
	2.	Enregistrement de la voix
	3.	Création d’un storyboard (découpage en scènes)
	4.	Génération ou conception des visuels
	5.	Redessin des éléments par un designer (Illustrator)
	6.	Découpage des éléments (tête, bras, yeux, etc.)
	7.	Animation dans After Effects

👉 Le point le plus lent aujourd’hui est :
	•	la création des visuels
	•	et surtout le redessin + découpage manuel pour l’animation

⸻

2. 🎯 OBJECTIF DU LOGICIEL

Créer un outil qui automatise ce pipeline pour :
	•	accélérer la production
	•	réduire le travail manuel des designers
	•	standardiser la qualité des livrables
	•	permettre une montée en volume (scalabilité)

⸻

3. ⚙️ FONCTIONNEMENT ATTENDU (PIPELINE)

Le logiciel doit fonctionner en plusieurs étapes :

⸻

🧩 ÉTAPE 1 — INPUT

L’utilisateur fournit :
	•	un script texte
	•	(optionnel) une voix off audio

⸻

🧠 ÉTAPE 2 — DÉCOUPAGE AUTOMATIQUE

Le système doit :
	•	analyser le script
	•	proposer un découpage en scènes
	•	générer un storyboard structuré

Chaque scène doit contenir :
	•	description visuelle
	•	intention
	•	type de plan
	•	éléments présents

⸻

🎨 ÉTAPE 3 — GÉNÉRATION DE PROMPTS

Pour chaque scène, le système génère :
	•	un prompt détaillé pour génération d’image
	•	cohérent avec une direction artistique définie (flat design, institutionnel, etc.)

⸻

🖼️ ÉTAPE 4 — GÉNÉRATION D’IMAGES
	•	L’utilisateur peut générer une image par scène
	•	possibilité de valider / régénérer
	•	stockage des images validées

⸻

✂️ ÉTAPE 5 — DÉCOMPOSITION AUTOMATIQUE (POINT CLÉ)

À partir des images générées, le système doit :
	•	détecter les éléments principaux :
	•	tête
	•	yeux
	•	bouche
	•	bras
	•	jambes
	•	corps
	•	objets
	•	isoler ces éléments
	•	les exporter séparément

👉 Objectif :
préparer les assets pour l’animation

⸻

📦 ÉTAPE 6 — EXPORT

Le système doit permettre d’exporter :
	•	soit en PNG (éléments séparés)
	•	soit en SVG / format vectoriel si possible
	•	idéalement structuré en calques compatibles avec Illustrator

Nom des calques attendu :
	•	head
	•	eyes
	•	mouth
	•	left_arm
	•	right_arm
	•	body
	•	etc.

⸻

4. ⚠️ CONTRAINTES IMPORTANTES
	•	Le style visuel doit être cohérent (flat design propre)
	•	Les personnages doivent être exploitables pour animation (éviter poses complexes)
	•	Le découpage doit être propre (pas juste un détourage approximatif)
	•	Le système doit être rapide et fluide

⸻

5. 🧪 APPROCHE RECOMMANDÉE (MVP)

Pour une première version (MVP), nous pouvons :

Phase 1 :
	•	Script → découpage → prompts → images

Phase 2 :
	•	segmentation simple des éléments (corps, tête, bras)

Phase 3 :
	•	amélioration du découpage + export structuré

⸻

6. 🛠️ PISTES TECHNIQUES (À EXPLORER)
	•	IA texte pour découpage (type GPT)
	•	Génération d’images (Stable Diffusion ou autre)
	•	Segmentation d’image (type SAM – Segment Anything)
	•	Détection de pose (MediaPipe ou équivalent)
	•	Vectorisation (SVG / outils type potrace)
	•	Export structuré compatible Illustrator

⸻

7. 🚀 VISION À LONG TERME

À terme, nous voulons un outil capable de :
	•	générer directement des assets prêts à animer
	•	réduire drastiquement le travail manuel
	•	devenir un véritable pipeline automatisé de motion design

⸻

8. 🎯 ATTENTE DE TA PART

Dans un premier temps, j’aimerais que tu :
	1.	analyses la faisabilité technique
	2.	proposes une architecture du système
	3.	identifies les briques technologiques à utiliser
	4.	proposes une roadmap de développement (MVP → V2 → V3)

⸻


Maintenant je veux bien utiliser le web, python, celery..., react, fastAPI

Stable diffusion avec une API replicate simple, SAM que je vais installer

j'ai deja un projet react simple dans mon dossier frontend que j'ai généré avec npm create vite

Dans le dossier backend j'ai le dossier env



backend

frontend

documentation

PROMPT.md

README.md

alors propose moi un prompt que je peux faire utiliser dans cursor avec le model claude haiku, optimise tellement ce prompt pr faire les choses comme un dev pro avec des exigeances de qualité de code structuration scalabilité, puis un autre fichier pr ARCHITECTURE.bat (ou dirrectement les créer ) afin de generer les dossier et fichiers dans le backend et frontend qui ne sont pas là ou ne sont pas par defaut dans le projet de base là je parle particulièrement de react qui viens deja avec des dossiers et fichier pense a ne pas dupliquer



Voici ce que deepseek m'a deja proposé mais je trouve que toi tu as une reflexion beaucoup plus avancée et totale pr faire un truc assez simple
# ============================================================
# MODÈLES PRINCIPAUX (entités métier)
# ============================================================

Project:
  id: string (UUID)
  name: string
  description: string (optional)
  status: enum [draft, storyboard_ready, images_ready, assets_ready, exported, archived]
  art_direction: object   # ex: { style: "flat_design", palette: ["#2A9D8F", "#E9C46A"] }
  script_raw_text: text
  voiceover_audio_url: string (optional)
  created_at: datetime
  updated_at: datetime
  created_by: string (user_id)
  settings: object        # paramètres globaux : llm_model, image_size, fps, etc.

Scene:
  id: string (UUID)
  project_id: string (FK -> Project)
  order_index: integer
  start_timecode: float (optional)
  end_timecode: float (optional)
  script_excerpt: text
  visual_description: text
  intention: string
  shot_type: string       # ex: "medium shot", "close-up"
  characters: list[string]   # noms des personnages
  objects: list[string]      # objets présents
  background: string
  # Étape de génération d’image
  prompt_generated: text
  image_generation_params: object   # seed, cfg_scale, steps, model (replicate)
  generated_image_url: string (optional)
  # Validation utilisateur
  user_validated_image_url: string (optional)   # l'utilisateur peut uploader sa propre image
  user_approved: boolean (default false)        # validation manuelle
  user_comment: string (optional)
  # Statuts
  image_status: enum [pending, generating, generated, user_edited, approved, rejected]
  segmentation_status: enum [not_started, processing, done, failed]
  vectorization_status: enum [pending, processing, done, failed]

Asset:
  id: string (UUID)
  scene_id: string (FK -> Scene)
  asset_type: enum [head, eyes, mouth, left_arm, right_arm, left_leg, right_leg, body, object, background_element]
  subtype: string (optional)   # ex: "laptop" pour asset_type=object
  bounding_box: object         # { x, y, width, height }
  mask_url: string             # PNG du masque (alpha)
  original_png_url: string     # élément isolé (fond transparent)
  svg_url: string (optional)   # après vectorisation
  svg_processing_params: object (optional)
  layer_name: string           # nom standard pour After Effects (ex: "head")
  transform_data: object       # { position: {x,y}, scale, pivot, rotation }
  confidence_score: float (0..1)
  # Validation utilisateur
  user_edited_png_url: string (optional)   # l'utilisateur peut uploader sa propre version découpée
  user_approved: boolean
  manual_correction_needed: boolean

# ============================================================
# MODÈLES DE TRAITEMENT (jobs asynchrones)
# ============================================================

SegmentationJob:
  id: string (UUID)
  scene_id: string (FK -> Scene)
  source_image_url: string            # l'image validée par l'utilisateur
  sam_model_version: string           # "sam2_hiera_large"
  mediapipe_pose_used: boolean
  status: enum [queued, running, completed, failed]
  started_at: datetime
  finished_at: datetime
  error_message: string (optional)
  result_asset_ids: list[string]      # liste des Asset créés

GenerationJob:
  id: string (UUID)
  scene_id: string (FK -> Scene)
  replicate_prediction_id: string     # ID retourné par Replicate
  prompt: text
  negative_prompt: text (optional)
  model: string                       # "stability-ai/sdxl" ou "black-forest-labs/flux"
  params: object                      # { width, height, num_inference_steps, seed, guidance_scale }
  status: enum [pending, processing, succeeded, failed]
  result_image_url: string (optional)
  cost_usd: float
  created_at: datetime

VectorizationJob:
  id: string (UUID)
  asset_id: string (FK -> Asset)
  tool: string                        # "vtracer", "potrace"
  params: object                      # { turd_size, corner_threshold, mode }
  status: enum [pending, processing, completed, failed]
  svg_result_url: string (optional)
  vector_quality_score: float (optional)

ExportBatch:
  id: string (UUID)
  project_id: string (FK -> Project)
  export_format: enum [png_zip, svg_zip, ae_project]
  include_vector: boolean
  include_masks: boolean
  layer_naming_convention: string     # "illustrator_standard"
  export_url: string (temporary signed URL)
  status: enum [building, ready, failed]
  created_at: datetime
  expires_at: datetime

# ============================================================
# MODÈLES POUR LES SERVICES API EXTERNES (requêtes/réponses)
# ============================================================

LLMStoryboardRequest:
  script_text: text
  art_direction: object (optional)
  num_scenes: integer (optional, hint)
  existing_project_context: string (optional)   # pour reprises

LLMStoryboardResponse:
  scenes: list[object] où chaque objet a:
    - script_excerpt
    - visual_description
    - intention
    - shot_type
    - characters
    - objects
    - background
  raw_llm_output: string (pour debug)
  token_usage: object

ReplicateImageRequest:
  version: string          # modèle spécifique
  input: object            # prompt, negative_prompt, width, height, num_outputs, etc.
  webhook: string (optional)

ReplicateImageResponse:
  id: string               # prediction ID
  status: string
  urls: object             # { get, cancel }
  created_at: datetime

SAM2LocalRequest:
  image_url: string
  points_or_boxes: object (optional)   # pour guider la segmentation
  output_mask_format: string           # "png"

SAM2LocalResponse:
  masks: list[string]      # URLs des masques
  confidence_scores: list[float]

# ============================================================
# MODÈLES POUR L’INTERACTION UTILISATEUR (validation / upload)
# ============================================================

UserValidationAction:
  user_id: string
  target_type: enum [scene, asset, project]
  target_id: string
  action: enum [approve, reject, edit, replace]
  new_value: object (optional)        # ex: { image_url: "..." } pour remplacer une image
  comment: string (optional)
  timestamp: datetime

UserUploadedAsset:
  user_id: string
  scene_id: string (optional)
  asset_type: string
  file_url: string                     # PNG ou SVG uploadé par l'utilisateur
  replaces_asset_id: string (optional)
  created_at: datetime

# ============================================================
# MODÈLES DE TRAÇABILITÉ (optionnels mais recommandés)
# ============================================================

SystemLog:
  id: string (UUID)
  timestamp: datetime
  level: enum [info, warning, error]
  component: string        # "llm", "replicate", "sam2", "vectorizer"
  message: text
  related_job_id: string (optional)
  metadata: object (optional)

UserActionLog:
  id: string (UUID)
  user_id: string
  project_id: string
  scene_id: string (optional)
  asset_id: string (optional)
  action_type: string      # "regenerate_image", "validate_scene", "manual_asset_correction"
  old_value: object (optional)
  new_value: object (optional)
  created_at: datetime