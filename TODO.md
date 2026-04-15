# HEO-MOTION — SUIVI DE DÉVELOPPEMENT

---

## PHASE 0 — Initialisation projet
- [ ] 0.1 Initialiser git + premier commit (structure)
- [ ] 0.2 Installer les dépendances Python (pip install -r requirements.txt)
- [ ] 0.3 Installer les dépendances Frontend (npm install + react-router-dom, zustand, axios, tailwindcss, @tailwindcss/vite)
- [ ] 0.4 Configurer le .env backend (copier .env.example → .env)

---

## PHASE 1 — Fondations Backend
- [ ] 1.1 `app/config.py` — Configuration Pydantic BaseSettings
- [ ] 1.2 `app/database.py` — SQLAlchemy async engine + session
- [ ] 1.3 `app/schemas/common.py` — Enums partagés + réponses génériques
- [ ] 1.4 `app/models/project.py` — Modèle SQLAlchemy Project
- [ ] 1.5 `app/models/scene.py` — Modèle SQLAlchemy Scene
- [ ] 1.6 `app/models/asset.py` — Modèle SQLAlchemy Asset
- [ ] 1.7 `app/models/job.py` — Modèles Jobs (Generation, Segmentation, Vectorization, ExportBatch)
- [ ] 1.8 `app/models/__init__.py` — Export centralisé de tous les modèles
- [ ] 1.9 `app/schemas/project.py` — Schemas Pydantic Project (Create, Update, Response)
- [ ] 1.10 `app/schemas/scene.py` — Schemas Pydantic Scene
- [ ] 1.11 `app/schemas/asset.py` — Schemas Pydantic Asset
- [ ] 1.12 `app/schemas/job.py` — Schemas Pydantic Jobs
- [ ] 1.13 `app/exceptions.py` — Exceptions custom + handlers FastAPI
- [ ] 1.14 `app/utils/logging.py` — Configuration logging structuré
- [ ] 1.15 `app/repositories/base.py` — BaseRepository générique (CRUD)
- [ ] 1.16 `app/repositories/project_repo.py` — Repository Project
- [ ] 1.17 `app/repositories/scene_repo.py` — Repository Scene
- [ ] 1.18 `app/repositories/asset_repo.py` — Repository Asset
- [ ] 1.19 `app/repositories/job_repo.py` — Repository Jobs
- [ ] 1.20 `app/services/storage_service.py` — Service stockage fichiers (local)
- [ ] 1.21 `app/services/project_service.py` — Service Project (CRUD)
- [ ] 1.22 `app/services/scene_service.py` — Service Scene (CRUD)
- [ ] 1.23 `app/api/health.py` — Route health check
- [ ] 1.24 `app/api/projects.py` — Routes CRUD Project
- [ ] 1.25 `app/api/scenes.py` — Routes CRUD Scene
- [ ] 1.26 `app/api/assets.py` — Routes Assets
- [ ] 1.27 `app/api/router.py` — Agrégation de tous les routeurs
- [ ] 1.28 `app/main.py` — App factory FastAPI (CORS, lifespan, router)
- [ ] 1.29 Configurer Alembic (alembic init + env.py + alembic.ini)
- [ ] 1.30 Première migration Alembic (créer les tables)
- [ ] 1.31 Tester : lancer le serveur FastAPI + vérifier /health et /docs

---

## PHASE 1B — Fondations Frontend
- [ ] 1B.1 Configurer Tailwind CSS + mettre à jour vite.config.js
- [ ] 1B.2 Remplacer index.css par les directives Tailwind
- [ ] 1B.3 `src/utils/constants.js` — Constantes (status, asset types, routes)
- [ ] 1B.4 `src/utils/formatters.js` — Formatage dates, tailles, statuts
- [ ] 1B.5 `src/utils/helpers.js` — Fonctions utilitaires pures
- [ ] 1B.6 `src/api/client.js` — Axios instance configurée
- [ ] 1B.7 `src/api/projects.js` — API client projets
- [ ] 1B.8 `src/api/scenes.js` — API client scènes
- [ ] 1B.9 `src/stores/useUIStore.js` — Store UI (sidebar, modales, toasts)
- [ ] 1B.10 `src/stores/useProjectStore.js` — Store projets
- [ ] 1B.11 `src/stores/useSceneStore.js` — Store scènes
- [ ] 1B.12 Composants UI atomiques (Button, Card, Modal, Spinner, Badge, etc.)
- [ ] 1B.13 Composants layout (AppLayout, Sidebar, Header, PageContainer)
- [ ] 1B.14 Pages stubs (Dashboard, Project, Storyboard, Generation, etc.)
- [ ] 1B.15 Réécrire App.jsx (React Router + AppLayout)
- [ ] 1B.16 Tester : navigation entre toutes les pages

---

## PHASE 2 — Pipeline Script → Images
- [ ] 2.1 `app/integrations/openai_client.py` — Wrapper LLM (OpenAI)
- [ ] 2.2 `app/services/storyboard_service.py` — Découpage script → scènes
- [ ] 2.3 `app/api/scenes.py` — Endpoint POST storyboard/generate
- [ ] 2.4 `app/services/prompt_service.py` — Génération prompts image
- [ ] 2.5 `app/integrations/replicate_client.py` — Wrapper Replicate API
- [ ] 2.6 `app/workers/celery_app.py` — Configuration Celery + Redis
- [ ] 2.7 `app/workers/generation_tasks.py` — Tâche génération image
- [ ] 2.8 `app/services/generation_service.py` — Service génération
- [ ] 2.9 `app/api/generation.py` — Routes génération image
- [ ] 2.10 Frontend : StoryboardPage complète
- [ ] 2.11 Frontend : GenerationPage + polling
- [ ] 2.12 `src/hooks/usePolling.js` — Hook polling générique
- [ ] 2.13 `src/stores/useGenerationStore.js` — Store génération
- [ ] 2.14 Tester : pipeline complet script → images

---

## PHASE 3 — Segmentation & Export
- [ ] 3.1 `app/integrations/sam2_client.py` — Interface SAM2 local
- [ ] 3.2 `app/workers/segmentation_tasks.py` — Tâche segmentation
- [ ] 3.3 `app/services/segmentation_service.py` — Service segmentation
- [ ] 3.4 `app/api/segmentation.py` — Routes segmentation
- [ ] 3.5 `app/integrations/vectorizer_client.py` — Wrapper vtracer/potrace
- [ ] 3.6 `app/workers/vectorization_tasks.py` — Tâche vectorisation
- [ ] 3.7 `app/services/vectorization_service.py` — Service vectorisation
- [ ] 3.8 `app/workers/export_tasks.py` — Tâche export ZIP
- [ ] 3.9 `app/services/export_service.py` — Service export
- [ ] 3.10 `app/api/export.py` — Routes export
- [ ] 3.11 Frontend : SegmentationPage complète
- [ ] 3.12 Frontend : ExportPage complète
- [ ] 3.13 Tester : pipeline complet script → export

---

## PHASE 4 — Tests & Polish
- [ ] 4.1 `tests/conftest.py` — Fixtures partagées
- [ ] 4.2 Tests unitaires API (projects, scenes, generation)
- [ ] 4.3 Gestion d'erreurs frontend (toasts, retry, empty states)
- [ ] 4.4 Responsive design (mobile sidebar)
- [ ] 4.5 Documentation architecture.md
