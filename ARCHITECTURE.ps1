# ============================================================
# HEO-MOTION - Architecture Generator
# Genere les dossiers et fichiers du projet
# ============================================================

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "    HEO-MOTION - ARCHITECTURE GENERATOR                 " -ForegroundColor Cyan
Write-Host "    Generation des dossiers et fichiers du projet        " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""


# Helper: cree un dossier si absent
function Ensure-Dir($path) {
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
    }
}

# Helper: cree un fichier si absent
function Ensure-File($path, $content = "") {
    if (-not (Test-Path $path)) {
        New-Item -ItemType File -Path $path -Force | Out-Null
        if ($content) {
            Set-Content -Path $path -Value $content -Encoding UTF8
        }
    }
}


# ============================================================
# RACINE
# ============================================================

Ensure-Dir "documentation"


# ============================================================
# BACKEND - Dossiers
# ============================================================

Write-Host "[BACKEND] Creation de la structure..." -ForegroundColor Yellow

$backendDirs = @(
    "backend/app",
    "backend/app/models",
    "backend/app/schemas",
    "backend/app/api",
    "backend/app/services",
    "backend/app/repositories",
    "backend/app/workers",
    "backend/app/integrations",
    "backend/app/utils",
    "backend/alembic",
    "backend/alembic/versions",
    "backend/tests",
    "backend/media",
    "backend/media/images",
    "backend/media/masks",
    "backend/media/assets",
    "backend/media/svg",
    "backend/media/exports"
)

foreach ($dir in $backendDirs) {
    Ensure-Dir $dir
}

Write-Host "[BACKEND] Dossiers OK" -ForegroundColor Green


# ============================================================
# BACKEND - Fichiers __init__.py
# ============================================================

Write-Host "[BACKEND] Creation des __init__.py..." -ForegroundColor Yellow

$initDirs = @(
    "backend/app",
    "backend/app/models",
    "backend/app/schemas",
    "backend/app/api",
    "backend/app/services",
    "backend/app/repositories",
    "backend/app/workers",
    "backend/app/integrations",
    "backend/app/utils",
    "backend/tests"
)

foreach ($dir in $initDirs) {
    Ensure-File "$dir/__init__.py"
}

Write-Host "[BACKEND] __init__.py OK" -ForegroundColor Green


# ============================================================
# BACKEND - Fichiers Python
# ============================================================

Write-Host "[BACKEND] Creation des fichiers Python..." -ForegroundColor Yellow

# App core
Ensure-File "backend/app/main.py" "# HEO-MOTION - FastAPI Application Entry Point"
Ensure-File "backend/app/config.py" "# HEO-MOTION - Application Configuration (Pydantic BaseSettings)"
Ensure-File "backend/app/database.py" "# HEO-MOTION - SQLAlchemy Async Engine and Session"
Ensure-File "backend/app/exceptions.py" "# HEO-MOTION - Custom Exceptions and Handlers"

# Models
foreach ($f in @("project", "scene", "asset", "job")) {
    Ensure-File "backend/app/models/$f.py" "# HEO-MOTION - $f Model"
}

# Schemas
foreach ($f in @("project", "scene", "asset", "job", "common")) {
    Ensure-File "backend/app/schemas/$f.py" "# HEO-MOTION - $f Schema"
}

# API Routes
foreach ($f in @("router", "projects", "scenes", "assets", "generation", "segmentation", "export", "health")) {
    Ensure-File "backend/app/api/$f.py" "# HEO-MOTION - $f Routes"
}

# Services
foreach ($f in @("project_service", "scene_service", "storyboard_service", "prompt_service", "generation_service", "segmentation_service", "vectorization_service", "export_service", "storage_service")) {
    Ensure-File "backend/app/services/$f.py" "# HEO-MOTION - $f"
}

# Repositories
foreach ($f in @("base", "project_repo", "scene_repo", "asset_repo", "job_repo")) {
    Ensure-File "backend/app/repositories/$f.py" "# HEO-MOTION - $f"
}

# Workers
foreach ($f in @("celery_app", "generation_tasks", "segmentation_tasks", "vectorization_tasks", "export_tasks")) {
    Ensure-File "backend/app/workers/$f.py" "# HEO-MOTION - $f"
}

# Integrations
foreach ($f in @("replicate_client", "openai_client", "sam2_client", "vectorizer_client")) {
    Ensure-File "backend/app/integrations/$f.py" "# HEO-MOTION - $f"
}

# Utils
foreach ($f in @("logging", "file_utils", "validators")) {
    Ensure-File "backend/app/utils/$f.py" "# HEO-MOTION - $f"
}

# Alembic
Ensure-File "backend/alembic/env.py" "# Alembic environment configuration"
Ensure-File "backend/alembic/script.py.mako" "# Alembic migration template"

# Tests
foreach ($f in @("conftest", "test_projects", "test_scenes", "test_generation", "test_segmentation")) {
    Ensure-File "backend/tests/$f.py" "# HEO-MOTION - $f"
}

# Config
Ensure-File "backend/alembic.ini" "# Alembic configuration"

# requirements.txt
$requirements = @"
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
"@
Ensure-File "backend/requirements.txt" $requirements

# .env.example
$envExample = @"
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
"@
Ensure-File "backend/.env.example" $envExample

Write-Host "[BACKEND] Fichiers Python OK" -ForegroundColor Green


# ============================================================
# FRONTEND - Dossiers (Vite React existe deja)
# ============================================================

Write-Host "[FRONTEND] Creation des dossiers additionnels..." -ForegroundColor Yellow

$frontendDirs = @(
    "frontend/src/api",
    "frontend/src/stores",
    "frontend/src/hooks",
    "frontend/src/pages",
    "frontend/src/components/layout",
    "frontend/src/components/ui",
    "frontend/src/components/project",
    "frontend/src/components/scene",
    "frontend/src/components/generation",
    "frontend/src/components/segmentation",
    "frontend/src/components/export",
    "frontend/src/utils"
)

foreach ($dir in $frontendDirs) {
    Ensure-Dir $dir
}

Write-Host "[FRONTEND] Dossiers OK" -ForegroundColor Green


# ============================================================
# FRONTEND - Fichiers JSX/JS
# ============================================================

Write-Host "[FRONTEND] Creation des fichiers JSX/JS..." -ForegroundColor Yellow

# API
foreach ($f in @("client", "projects", "scenes", "generation", "segmentation", "export")) {
    Ensure-File "frontend/src/api/$f.js" "// HEO-MOTION - API $f module"
}

# Stores
foreach ($f in @("useProjectStore", "useSceneStore", "useGenerationStore", "useUIStore")) {
    Ensure-File "frontend/src/stores/$f.js" "// HEO-MOTION - $f Zustand store"
}

# Hooks
foreach ($f in @("useProjects", "useScenes", "useGeneration", "useSegmentation", "usePolling")) {
    Ensure-File "frontend/src/hooks/$f.js" "// HEO-MOTION - $f custom hook"
}

# Pages
foreach ($f in @("DashboardPage", "ProjectPage", "StoryboardPage", "GenerationPage", "SegmentationPage", "ExportPage", "NotFoundPage")) {
    Ensure-File "frontend/src/pages/$f.jsx" "// HEO-MOTION - $f"
}

# Components / Layout
foreach ($f in @("AppLayout", "Sidebar", "Header", "PageContainer")) {
    Ensure-File "frontend/src/components/layout/$f.jsx" "// HEO-MOTION - $f component"
}

# Components / UI
foreach ($f in @("Button", "Card", "Modal", "Spinner", "Badge", "EmptyState", "ProgressBar", "Toast")) {
    Ensure-File "frontend/src/components/ui/$f.jsx" "// HEO-MOTION - $f component"
}

# Components / Project
foreach ($f in @("ProjectCard", "ProjectForm", "ProjectStatusBadge")) {
    Ensure-File "frontend/src/components/project/$f.jsx" "// HEO-MOTION - $f component"
}

# Components / Scene
foreach ($f in @("SceneCard", "SceneEditor", "SceneTimeline")) {
    Ensure-File "frontend/src/components/scene/$f.jsx" "// HEO-MOTION - $f component"
}

# Components / Generation
foreach ($f in @("ImagePreview", "PromptEditor", "GenerationControls")) {
    Ensure-File "frontend/src/components/generation/$f.jsx" "// HEO-MOTION - $f component"
}

# Components / Segmentation
foreach ($f in @("AssetPreview", "LayerList", "SegmentationControls")) {
    Ensure-File "frontend/src/components/segmentation/$f.jsx" "// HEO-MOTION - $f component"
}

# Components / Export
foreach ($f in @("ExportConfig", "ExportProgress")) {
    Ensure-File "frontend/src/components/export/$f.jsx" "// HEO-MOTION - $f component"
}

# Utils
foreach ($f in @("constants", "formatters", "helpers")) {
    Ensure-File "frontend/src/utils/$f.js" "// HEO-MOTION - $f utilities"
}

# Tailwind config
$tailwindConfig = @"
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },
    },
  },
  plugins: [],
};
"@
Ensure-File "frontend/tailwind.config.js" $tailwindConfig

# PostCSS config
$postcssConfig = @"
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
"@
Ensure-File "frontend/postcss.config.js" $postcssConfig

Write-Host "[FRONTEND] Fichiers JSX/JS OK" -ForegroundColor Green


# ============================================================
# DOCUMENTATION
# ============================================================

Write-Host "[DOCS] Creation de la documentation..." -ForegroundColor Yellow
Ensure-File "documentation/architecture.md" "# HEO-MOTION - Architecture Technique"
Write-Host "[DOCS] OK" -ForegroundColor Green


# ============================================================
# GITKEEP (pour versionner les dossiers media vides)
# ============================================================

foreach ($dir in @("backend/media", "backend/media/images", "backend/media/masks", "backend/media/assets", "backend/media/svg", "backend/media/exports")) {
    Ensure-File "$dir/.gitkeep"
}


# ============================================================
# RESUME
# ============================================================

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "              GENERATION TERMINEE                        " -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Backend:" -ForegroundColor White
Write-Host "    - app/ (models, schemas, api, services, repos," -ForegroundColor Gray
Write-Host "           workers, integrations, utils)" -ForegroundColor Gray
Write-Host "    - alembic/ (migrations)" -ForegroundColor Gray
Write-Host "    - tests/" -ForegroundColor Gray
Write-Host "    - media/ (images, masks, assets, svg, exports)" -ForegroundColor Gray
Write-Host "    - requirements.txt, .env.example, alembic.ini" -ForegroundColor Gray
Write-Host ""
Write-Host "  Frontend (ajouts - Vite React intact):" -ForegroundColor White
Write-Host "    - src/api/, stores/, hooks/, pages/" -ForegroundColor Gray
Write-Host "    - src/components/ (layout, ui, project, scene," -ForegroundColor Gray
Write-Host "                       generation, segmentation, export)" -ForegroundColor Gray
Write-Host "    - src/utils/" -ForegroundColor Gray
Write-Host "    - tailwind.config.js, postcss.config.js" -ForegroundColor Gray
Write-Host ""
Write-Host "  Documentation:" -ForegroundColor White
Write-Host "    - documentation/architecture.md" -ForegroundColor Gray
Write-Host ""
Write-Host "  Prochaines etapes:" -ForegroundColor Cyan
Write-Host "    1. cd backend && env\Scripts\activate" -ForegroundColor Cyan
Write-Host "    2. pip install -r requirements.txt" -ForegroundColor Cyan
Write-Host "    3. cd frontend && npm install react-router-dom zustand axios tailwindcss @tailwindcss/vite" -ForegroundColor Cyan
Write-Host "    4. Ouvrir PROMPT.md et commencer le dev" -ForegroundColor Cyan
Write-Host ""
