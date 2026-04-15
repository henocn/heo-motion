# HEO-MOTION — PROMPT DE DÉVELOPPEMENT

> **Modèle cible** : Claude Haiku (ou tout LLM de code)
> **Projet** : Pipeline automatisé de production de motion design
> **Stack** : FastAPI · Celery · Redis · PostgreSQL · SQLAlchemy · React 19 · Vite 8 · Zustand · React Router · Tailwind CSS

---

## 0. RÔLE & CONTRAINTES GLOBALES

Tu es un développeur senior full-stack Python/React. Tu produis du code **production-ready** en respectant **strictement** ces règles :

### Qualité de code
- **PEP 8** strict pour Python, **ESLint + Prettier** pour JS/JSX
- Type hints systématiques en Python (Pydantic v2 pour les schémas, `typing` natif pour le reste)
- Nommage explicite : pas d'abréviations sauf conventions (`id`, `url`, `db`)
- Fonctions courtes (< 30 lignes), responsabilité unique
- Pas de code mort, pas de `print()` en production → utiliser `logging` (Python) et un logger configuré (JS)
- Gestion d'erreurs systématique : exceptions custom, HTTP errors codes appropriés, try/except ciblés
- Pas de secrets en dur → tout dans les variables d'environnement (`.env`)

### Architecture
- **Séparation stricte** : routes / services / repositories / schemas / models
- **Dependency injection** via FastAPI `Depends()`
- **Repository pattern** pour tout accès DB
- **Service layer** pour la logique métier (jamais dans les routes)
- Celery tasks dans un module dédié, découplées de la logique métier
- Frontend : composants atomiques, hooks custom pour la logique, stores Zustand par domaine

### Conventions de commentaires (Python uniquement)
```python
#################################################
#           Nom de la classe centré             #
#################################################
```
Laisser **4 lignes vides** entre chaque classe et après chaque bloc d'imports.
Avant chaque déclaration de fonction, un **commentaire** expliquant brièvement son rôle.

### Conventions de commentaires (JS/JSX)
Avant chaque déclaration de fonction, un **commentaire** expliquant brièvement son rôle.

---

## 1. CONTEXTE MÉTIER

On produit des **vidéos en motion design** (animations 2D). Le pipeline actuel est manuel :
1. Script → 2. Voix off → 3. Storyboard → 4. Visuels → 5. Redessin/découpage → 6. Animation After Effects

**Le logiciel automatise les étapes 3 à 5** : découpage du script en scènes, génération d'images, segmentation des éléments (tête, bras, yeux…) pour export prêt à animer.

---

## 2. ARCHITECTURE TECHNIQUE

```
heo-motion/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app factory + CORS + lifespan
│   │   ├── config.py                  # Settings Pydantic (BaseSettings, .env)
│   │   ├── database.py                # SQLAlchemy async engine + session
│   │   ├── exceptions.py              # Exceptions custom + handlers
│   │   │
│   │   ├── models/                    # SQLAlchemy ORM models
│   │   │   ├── __init__.py
│   │   │   ├── project.py
│   │   │   ├── scene.py
│   │   │   ├── asset.py
│   │   │   └── job.py                 # GenerationJob, SegmentationJob, VectorizationJob, ExportBatch
│   │   │
│   │   ├── schemas/                   # Pydantic v2 schemas (request/response)
│   │   │   ├── __init__.py
│   │   │   ├── project.py
│   │   │   ├── scene.py
│   │   │   ├── asset.py
│   │   │   ├── job.py
│   │   │   └── common.py              # Pagination, enums partagés, responses génériques
│   │   │
│   │   ├── api/                       # Routes FastAPI (routeurs)
│   │   │   ├── __init__.py
│   │   │   ├── router.py              # Agrège tous les sous-routeurs
│   │   │   ├── projects.py
│   │   │   ├── scenes.py
│   │   │   ├── assets.py
│   │   │   ├── generation.py          # endpoints image generation
│   │   │   ├── segmentation.py        # endpoints SAM2
│   │   │   ├── export.py
│   │   │   └── health.py
│   │   │
│   │   ├── services/                  # Logique métier pure
│   │   │   ├── __init__.py
│   │   │   ├── project_service.py
│   │   │   ├── scene_service.py
│   │   │   ├── storyboard_service.py  # Appel LLM pour découpage script → scènes
│   │   │   ├── prompt_service.py      # Génération de prompts image à partir des scènes
│   │   │   ├── generation_service.py  # Orchestration Replicate API
│   │   │   ├── segmentation_service.py# Orchestration SAM2 local
│   │   │   ├── vectorization_service.py
│   │   │   ├── export_service.py
│   │   │   └── storage_service.py     # Abstraction stockage fichiers (local/S3)
│   │   │
│   │   ├── repositories/              # Accès DB (CRUD)
│   │   │   ├── __init__.py
│   │   │   ├── base.py                # BaseRepository générique
│   │   │   ├── project_repo.py
│   │   │   ├── scene_repo.py
│   │   │   ├── asset_repo.py
│   │   │   └── job_repo.py
│   │   │
│   │   ├── workers/                   # Tâches Celery
│   │   │   ├── __init__.py
│   │   │   ├── celery_app.py          # Config Celery + broker Redis
│   │   │   ├── generation_tasks.py
│   │   │   ├── segmentation_tasks.py
│   │   │   ├── vectorization_tasks.py
│   │   │   └── export_tasks.py
│   │   │
│   │   ├── integrations/              # Clients API externes
│   │   │   ├── __init__.py
│   │   │   ├── replicate_client.py    # Wrapper Replicate (SDXL/Flux)
│   │   │   ├── openai_client.py       # Wrapper OpenAI/LLM pour storyboard
│   │   │   ├── sam2_client.py         # Interface SAM2 local
│   │   │   └── vectorizer_client.py   # vtracer / potrace wrapper
│   │   │
│   │   └── utils/                     # Utilitaires transverses
│   │       ├── __init__.py
│   │       ├── logging.py             # Config logging structuré
│   │       ├── file_utils.py          # Manipulation fichiers/images
│   │       └── validators.py          # Validateurs custom réutilisables
│   │
│   ├── alembic/                       # Migrations DB
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py                # Fixtures partagées (db, client, factories)
│   │   ├── test_projects.py
│   │   ├── test_scenes.py
│   │   ├── test_generation.py
│   │   └── test_segmentation.py
│   │
│   ├── media/                         # Stockage local des fichiers générés
│   │   ├── images/
│   │   ├── masks/
│   │   ├── assets/
│   │   ├── svg/
│   │   └── exports/
│   │
│   ├── alembic.ini
│   ├── requirements.txt
│   ├── .env.example
│   └── celery_worker.sh               # Script de lancement worker
│
├── frontend/                          # (Vite React existant — on ajoute ce qui manque)
│   ├── src/
│   │   ├── main.jsx                   # ✅ Existe déjà
│   │   ├── App.jsx                    # ⚠️ À réécrire (routing + layout)
│   │   ├── index.css                  # ⚠️ À remplacer par Tailwind directives
│   │   │
│   │   ├── api/                       # Clients HTTP (axios instances)
│   │   │   ├── client.js              # Axios instance configurée (baseURL, interceptors)
│   │   │   ├── projects.js
│   │   │   ├── scenes.js
│   │   │   ├── generation.js
│   │   │   ├── segmentation.js
│   │   │   └── export.js
│   │   │
│   │   ├── stores/                    # Zustand stores
│   │   │   ├── useProjectStore.js
│   │   │   ├── useSceneStore.js
│   │   │   ├── useGenerationStore.js
│   │   │   └── useUIStore.js          # Sidebar, modales, notifications
│   │   │
│   │   ├── hooks/                     # Custom hooks
│   │   │   ├── useProjects.js
│   │   │   ├── useScenes.js
│   │   │   ├── useGeneration.js
│   │   │   ├── useSegmentation.js
│   │   │   └── usePolling.js          # Hook polling générique pour jobs async
│   │   │
│   │   ├── pages/                     # Pages (vues principales)
│   │   │   ├── DashboardPage.jsx      # Liste projets
│   │   │   ├── ProjectPage.jsx        # Vue projet (tabs : script, storyboard, images, assets, export)
│   │   │   ├── StoryboardPage.jsx     # Vue storyboard avec scènes
│   │   │   ├── GenerationPage.jsx     # Génération/validation images
│   │   │   ├── SegmentationPage.jsx   # Segmentation + preview assets
│   │   │   ├── ExportPage.jsx         # Configuration et téléchargement exports
│   │   │   └── NotFoundPage.jsx
│   │   │
│   │   ├── components/                # Composants réutilisables
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.jsx      # Layout principal (sidebar + content)
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   └── PageContainer.jsx
│   │   │   │
│   │   │   ├── ui/                    # Composants UI atomiques
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Spinner.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   ├── ProgressBar.jsx
│   │   │   │   └── Toast.jsx
│   │   │   │
│   │   │   ├── project/
│   │   │   │   ├── ProjectCard.jsx
│   │   │   │   ├── ProjectForm.jsx
│   │   │   │   └── ProjectStatusBadge.jsx
│   │   │   │
│   │   │   ├── scene/
│   │   │   │   ├── SceneCard.jsx
│   │   │   │   ├── SceneEditor.jsx
│   │   │   │   └── SceneTimeline.jsx
│   │   │   │
│   │   │   ├── generation/
│   │   │   │   ├── ImagePreview.jsx
│   │   │   │   ├── PromptEditor.jsx
│   │   │   │   └── GenerationControls.jsx
│   │   │   │
│   │   │   ├── segmentation/
│   │   │   │   ├── AssetPreview.jsx
│   │   │   │   ├── LayerList.jsx
│   │   │   │   └── SegmentationControls.jsx
│   │   │   │
│   │   │   └── export/
│   │   │       ├── ExportConfig.jsx
│   │   │       └── ExportProgress.jsx
│   │   │
│   │   └── utils/
│   │       ├── constants.js           # Constantes app (status, asset types, etc.)
│   │       ├── formatters.js          # Formatage dates, tailles, statuts
│   │       └── helpers.js             # Fonctions utilitaires pures
│   │
│   ├── tailwind.config.js             # Config Tailwind + thème custom
│   └── postcss.config.js              # PostCSS pour Tailwind
│
├── documentation/
│   └── architecture.md                # Documentation technique auto-générée
│
├── .gitignore
├── README.md
├── PROMPT.md
└── PRE-PROMPT.md
```

---

## 3. MODÈLES DE DONNÉES (SQLAlchemy)

### 3.1 Enums partagés

```python
import enum

class ProjectStatus(str, enum.Enum):
    DRAFT = "draft"
    STORYBOARD_READY = "storyboard_ready"
    IMAGES_READY = "images_ready"
    ASSETS_READY = "assets_ready"
    EXPORTED = "exported"
    ARCHIVED = "archived"

class ImageStatus(str, enum.Enum):
    PENDING = "pending"
    GENERATING = "generating"
    GENERATED = "generated"
    USER_EDITED = "user_edited"
    APPROVED = "approved"
    REJECTED = "rejected"

class JobStatus(str, enum.Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class AssetType(str, enum.Enum):
    HEAD = "head"
    EYES = "eyes"
    MOUTH = "mouth"
    LEFT_ARM = "left_arm"
    RIGHT_ARM = "right_arm"
    LEFT_LEG = "left_leg"
    RIGHT_LEG = "right_leg"
    BODY = "body"
    OBJECT = "object"
    BACKGROUND = "background_element"

class ExportFormat(str, enum.Enum):
    PNG_ZIP = "png_zip"
    SVG_ZIP = "svg_zip"
    AE_PROJECT = "ae_project"
```

### 3.2 Modèle `Project`

| Champ | Type | Notes |
|-------|------|-------|
| `id` | UUID, PK | `default=uuid4` |
| `name` | String(255), not null | |
| `description` | Text, nullable | |
| `status` | Enum(ProjectStatus) | default=DRAFT |
| `art_direction` | JSON | `{"style": "flat_design", "palette": [...]}` |
| `script_raw_text` | Text, not null | |
| `voiceover_audio_url` | String(512), nullable | |
| `settings` | JSON | `{"llm_model": "...", "image_size": "1024x1024"}` |
| `created_at` | DateTime | server_default=now |
| `updated_at` | DateTime | onupdate=now |

Relation : `scenes` → list[Scene] (cascade delete)

### 3.3 Modèle `Scene`

| Champ | Type | Notes |
|-------|------|-------|
| `id` | UUID, PK | |
| `project_id` | UUID, FK(Project) | not null |
| `order_index` | Integer | not null |
| `script_excerpt` | Text | |
| `visual_description` | Text | |
| `intention` | String(255) | |
| `shot_type` | String(100) | "medium shot", "close-up"… |
| `characters` | JSON | list[str] |
| `objects` | JSON | list[str] |
| `background` | String(255) | |
| `prompt_generated` | Text | |
| `image_generation_params` | JSON | seed, cfg_scale, steps… |
| `generated_image_url` | String(512) | |
| `user_validated_image_url` | String(512) | |
| `user_approved` | Boolean | default=False |
| `image_status` | Enum(ImageStatus) | default=PENDING |
| `segmentation_status` | Enum(JobStatus) | |
| `vectorization_status` | Enum(JobStatus) | |

Relations : `project` → Project, `assets` → list[Asset]

### 3.4 Modèle `Asset`

| Champ | Type | Notes |
|-------|------|-------|
| `id` | UUID, PK | |
| `scene_id` | UUID, FK(Scene) | |
| `asset_type` | Enum(AssetType) | |
| `subtype` | String(100), nullable | pour objects custom |
| `bounding_box` | JSON | `{x, y, width, height}` |
| `mask_url` | String(512) | |
| `original_png_url` | String(512) | |
| `svg_url` | String(512), nullable | |
| `layer_name` | String(100) | nom calque After Effects |
| `transform_data` | JSON | position, scale, pivot, rotation |
| `confidence_score` | Float | 0.0 → 1.0 |
| `user_approved` | Boolean | default=False |

### 3.5 Modèles Jobs (dans `models/job.py`)

**GenerationJob**, **SegmentationJob**, **VectorizationJob**, **ExportBatch** — chacun suit le pattern :
- `id`, FK vers l'entité parente, `status` (JobStatus), `started_at`, `finished_at`, `error_message`
- Champs spécifiques au type de job (voir PRE-PROMPT.md section modèles)

---

## 4. API ENDPOINTS (FastAPI)

### Prefix : `/api/v1`

| Méthode | Route | Description | Service |
|---------|-------|-------------|---------|
| `GET` | `/health` | Health check | — |
| **Projects** | | | |
| `POST` | `/projects` | Créer un projet | ProjectService |
| `GET` | `/projects` | Lister les projets (pagination) | ProjectService |
| `GET` | `/projects/{id}` | Détail projet | ProjectService |
| `PUT` | `/projects/{id}` | Modifier projet | ProjectService |
| `DELETE` | `/projects/{id}` | Supprimer projet | ProjectService |
| **Storyboard** | | | |
| `POST` | `/projects/{id}/storyboard/generate` | Lancer découpage LLM | StoryboardService |
| **Scenes** | | | |
| `GET` | `/projects/{id}/scenes` | Lister les scènes | SceneService |
| `GET` | `/scenes/{id}` | Détail scène | SceneService |
| `PUT` | `/scenes/{id}` | Modifier scène | SceneService |
| `PATCH` | `/scenes/{id}/approve` | Valider image scène | SceneService |
| `PUT` | `/scenes/{id}/reorder` | Réordonner scènes | SceneService |
| **Image Generation** | | | |
| `POST` | `/scenes/{id}/generate-image` | Lancer génération image (Celery) | GenerationService |
| `GET` | `/scenes/{id}/generation-status` | Statut du job | GenerationService |
| `POST` | `/scenes/{id}/regenerate-image` | Régénérer avec nouveau seed | GenerationService |
| **Segmentation** | | | |
| `POST` | `/scenes/{id}/segment` | Lancer segmentation SAM2 (Celery) | SegmentationService |
| `GET` | `/scenes/{id}/segmentation-status` | Statut job segmentation | SegmentationService |
| **Assets** | | | |
| `GET` | `/scenes/{id}/assets` | Lister les assets d'une scène | AssetService |
| `PUT` | `/assets/{id}` | Modifier un asset | AssetService |
| `PATCH` | `/assets/{id}/approve` | Valider un asset | AssetService |
| **Export** | | | |
| `POST` | `/projects/{id}/export` | Lancer export (Celery) | ExportService |
| `GET` | `/exports/{id}/status` | Statut export | ExportService |
| `GET` | `/exports/{id}/download` | Télécharger zip/fichier | ExportService |

---

## 5. SERVICES & INTÉGRATIONS

### 5.1 StoryboardService
- Reçoit `script_raw_text` + `art_direction`
- Construit un **system prompt** optimisé pour le LLM
- Appelle OpenAI/LLM via `openai_client.py`
- Parse la réponse → crée les objets `Scene` en DB
- Retourne le storyboard structuré

### 5.2 PromptService
- Pour chaque scène, génère un **prompt d'image** cohérent
- Intègre : `visual_description`, `shot_type`, `art_direction.style`, `art_direction.palette`
- Ajoute des negative prompts standards (pas de texte, pas de watermark, flat design propre)

### 5.3 GenerationService
- Lance une tâche Celery `generate_image_task`
- La task appelle `replicate_client.py` → API Replicate (SDXL ou Flux)
- Polling du résultat → stocke l'image via `storage_service.py`
- Met à jour `scene.generated_image_url` et `scene.image_status`

### 5.4 SegmentationService
- Lance une tâche Celery `segment_image_task`
- La task appelle `sam2_client.py` → SAM2 installé localement
- Optionnel : détection de pose via MediaPipe pour guider les points
- Produit des masques → crée les objets `Asset` en DB

### 5.5 VectorizationService
- Lance `vectorize_asset_task` via Celery
- Utilise vtracer/potrace via `vectorizer_client.py`
- Produit SVG → stocke et met à jour `asset.svg_url`

### 5.6 ExportService
- Agrège les assets d'un projet
- Construit un ZIP structuré : `scene_01/head.png`, `scene_01/body.svg`…
- Nommage des calques compatible Illustrator/After Effects

### 5.7 StorageService
- Abstraction : `save_file(content, path)` → `media/{category}/{uuid}.{ext}`
- Pour le MVP : stockage local filesystem
- Prêt pour migration S3 (interface commune)

---

## 6. WORKERS CELERY

```python
# celery_app.py config essentielle
broker_url = "redis://localhost:6379/0"
result_backend = "redis://localhost:6379/1"
task_serializer = "json"
accept_content = ["json"]
task_track_started = True
task_acks_late = True
worker_prefetch_multiplier = 1
```

**Tâches** :
- `generate_image_task(scene_id)` — appel Replicate, polling, stockage
- `segment_image_task(scene_id)` — SAM2 local, création assets
- `vectorize_asset_task(asset_id)` — conversion PNG → SVG
- `build_export_task(project_id, config)` — construction ZIP export

Chaque tâche : gère son propre `try/except`, met à jour le `status` du job en DB, log les erreurs.

---

## 7. FRONTEND (React 19 + Vite 8)

### 7.1 Stack additionnelle à installer
```bash
npm install react-router-dom zustand axios tailwindcss @tailwindcss/vite
```

### 7.2 Routing (React Router v7)
```
/                          → DashboardPage (liste projets)
/projects/:projectId       → ProjectPage (tabs)
/projects/:projectId/storyboard → StoryboardPage
/projects/:projectId/generation → GenerationPage
/projects/:projectId/segmentation → SegmentationPage
/projects/:projectId/export → ExportPage
*                          → NotFoundPage
```

### 7.3 State management (Zustand)
Un store par domaine :
- `useProjectStore` : projets, projet courant, CRUD
- `useSceneStore` : scènes du projet courant, sélection, modification
- `useGenerationStore` : statut des jobs de génération, polling
- `useUIStore` : sidebar ouverte/fermée, modale active, notifications toast

### 7.4 API client (Axios)
```javascript
// api/client.js
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  timeout: 30000,
  headers: { "Content-Type": "application/json" }
});
```

### 7.5 UI / Design system
- **Tailwind CSS** pour le styling
- Palette : tons sombres (sidebar slate-900), accents bleu (blue-500), succès vert (emerald-500)
- Layout : sidebar fixe à gauche + zone de contenu scrollable
- Composants Card, Button, Modal, Badge, Spinner, Toast, ProgressBar réutilisables
- Responsive (sidebar collapsible sur mobile)

---

## 8. FICHIERS DE CONFIGURATION

### 8.1 Backend `.env.example`
```env
# Database
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/heo_motion

# Redis
REDIS_URL=redis://localhost:6379/0

# Replicate API
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxx
REPLICATE_MODEL=stability-ai/sdxl

# OpenAI / LLM
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
LLM_MODEL=gpt-4o-mini

# Storage
MEDIA_ROOT=./media
STORAGE_BACKEND=local

# App
APP_ENV=development
APP_DEBUG=true
APP_HOST=0.0.0.0
APP_PORT=8000
SECRET_KEY=changeme-in-production
CORS_ORIGINS=http://localhost:5173
```

### 8.2 Backend `requirements.txt`
```
fastapi
uvicorn[standard]
sqlalchemy[asyncio]
asyncpg
alembic
pydantic
pydantic-settings
celery[redis]
redis
httpx
replicate
python-multipart
python-dotenv
Pillow
numpy
opencv-python-headless
vtracer
aiofiles
pytest
pytest-asyncio
httpx
```

### 8.3 Frontend `vite.config.js` (mise à jour)
```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
```

---

## 9. INSTRUCTIONS DE DÉVELOPPEMENT

### Phase 1 — Fondations (faire en premier)
1. **Backend** : `config.py` → `database.py` → `models/` → `schemas/` → `exceptions.py`
2. **Backend** : `repositories/base.py` → repositories spécifiques
3. **Backend** : `services/` (stubs avec TODO pour les intégrations)
4. **Backend** : `api/` routes → `main.py` (app factory, CORS, router)
5. **Backend** : `alembic init` + première migration
6. **Frontend** : Installer deps → configurer Tailwind → `api/client.js`
7. **Frontend** : Layout (AppLayout, Sidebar, Header) → Routing
8. **Frontend** : Pages stubs avec navigation fonctionnelle

### Phase 2 — Pipeline Script → Images
1. `StoryboardService` + `openai_client.py` → endpoint + frontend page
2. `PromptService` → endpoint de génération prompts
3. `GenerationService` + `replicate_client.py` + Celery task → endpoint + frontend
4. Polling côté frontend avec `usePolling` hook

### Phase 3 — Segmentation & Export
1. `SegmentationService` + `sam2_client.py` + Celery task
2. `VectorizationService` + `vectorizer_client.py`
3. `ExportService` → ZIP structuré
4. Frontend : pages segmentation + export

---

## 10. RÈGLES DE PRODUCTION DE CODE

Quand tu écris du code pour ce projet :

1. **Un fichier à la fois**, complet et fonctionnel
2. **Importe toujours** depuis les modules du projet (pas de copier-coller entre fichiers)
3. **Teste mentalement** chaque endpoint : requête → validation → service → repo → réponse
4. **Pas de placeholder** `pass` ou `...` sauf si explicitement demandé en stub
5. **Gère les erreurs** : 404 quand ressource introuvable, 422 pour validation, 500 avec log
6. **Docstrings** sur les fonctions publiques des services
7. **Migrations Alembic** : une migration par changement structurel
8. **Commits atomiques** : un fichier ou une feature cohérente par commit

---

## 11. COMMANDE DE DÉMARRAGE

```bash
# Backend
cd backend
python -m venv env
env\Scripts\activate          # Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Celery worker (autre terminal)
celery -A app.workers.celery_app worker --loglevel=info

# Frontend
cd frontend
npm install
npm run dev
```

---

> **Note** : Ce prompt est conçu pour être donné tel quel à un LLM de code. Chaque section fournit assez de contexte pour générer du code sans ambiguïté. Les modèles DeepSeek proposés dans PRE-PROMPT.md sont intégrés et simplifiés ici.
