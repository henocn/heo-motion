# HEO-MOTION

Pipeline automatisé de production de motion design. Transforme un script texte en assets animables (PNG/SVG découpés par calques) prêts pour After Effects.

## Stack

| Couche | Technologies |
|--------|-------------|
| **Backend** | FastAPI, SQLAlchemy (async), PostgreSQL, Celery, Redis |
| **Frontend** | React 19, Vite 8, Zustand, React Router, Tailwind CSS |
| **IA / ML** | OpenAI (storyboard), Replicate (image gen), SAM2 (segmentation) |
| **Vectorisation** | vtracer, potrace |

## Pipeline

```
Script → Storyboard (LLM) → Prompts → Images (SDXL/Flux) → Segmentation (SAM2) → Export (PNG/SVG)
```

## Démarrage rapide

```bash
# 1. Générer l'architecture (PowerShell)
powershell -ExecutionPolicy Bypass -File ARCHITECTURE.ps1

# 2. Backend
cd backend
env\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Éditer .env avec vos clés API
uvicorn app.main:app --reload

# 3. Frontend
cd frontend
npm install react-router-dom zustand axios tailwindcss @tailwindcss/vite
npm run dev
```

## Documentation

Voir `PROMPT.md` pour le prompt de développement complet et `documentation/architecture.md` pour la doc technique.
