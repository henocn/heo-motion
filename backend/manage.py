"""
Point d'entree CLI du backend HEO-MOTION.
Usage :
    python manage.py runserver          Demarre le serveur FastAPI (uvicorn)
    python manage.py runcelery          Demarre le worker Celery
    python manage.py migrate            Applique les migrations Alembic (upgrade head)
    python manage.py makemigrations     Genere une migration Alembic auto
    python manage.py shell              Ouvre un shell Python interactif avec le contexte app
"""

import argparse
import os
import subprocess
import sys


# Lance le serveur uvicorn avec reload en dev
def cmd_runserver(args):
    host = args.host or os.getenv("APP_HOST", "0.0.0.0")
    port = args.port or int(os.getenv("APP_PORT", "8000"))

    cmd = [
        sys.executable, "-m", "uvicorn",
        "app.main:app",
        "--host", host,
        "--port", str(port),
    ]
    if args.reload:
        cmd.append("--reload")

    print(f"  HEO-MOTION server  →  http://{host}:{port}")
    print(f"  Docs               →  http://{host}:{port}/docs")
    print()
    sys.exit(subprocess.call(cmd))


# Lance le worker Celery avec auto-reload via watchdog en dev
def cmd_runcelery(args):
    concurrency = str(args.concurrency)
    loglevel = args.loglevel

    cmd = [
        sys.executable, "-m", "celery",
        "-A", "app.workers.celery_app:celery_app",
        "worker",
        "--loglevel", loglevel,
        "--concurrency", concurrency,
        "--pool", "solo",
    ]

    print(f"  HEO-MOTION celery worker  (concurrency={concurrency}, loglevel={loglevel})")
    print()
    sys.exit(subprocess.call(cmd))


# Applique les migrations Alembic (alembic upgrade head)
def cmd_migrate(args):
    revision = args.revision or "head"
    cmd = [sys.executable, "-m", "alembic", "upgrade", revision]

    print(f"  Alembic upgrade → {revision}")
    sys.exit(subprocess.call(cmd))


# Genere automatiquement une nouvelle migration Alembic
def cmd_makemigrations(args):
    message = args.message or "auto"
    cmd = [
        sys.executable, "-m", "alembic",
        "revision", "--autogenerate",
        "-m", message,
    ]

    print(f"  Alembic autogenerate → \"{message}\"")
    sys.exit(subprocess.call(cmd))


# Ouvre un shell Python interactif avec les imports de l'app pre-charges
def cmd_shell(_args):
    banner = (
        "HEO-MOTION interactive shell\n"
        "Objets disponibles : settings, celery_app\n"
    )
    try:
        from app.config import settings  # noqa: F811
        from app.workers.celery_app import celery_app  # noqa: F811

        namespace = {
            "settings": settings,
            "celery_app": celery_app,
        }

        try:
            from IPython import start_ipython
            start_ipython(argv=[], user_ns=namespace)
        except ImportError:
            import code
            code.interact(banner=banner, local=namespace)

    except Exception as exc:
        print(f"Erreur au chargement du contexte : {exc}")
        sys.exit(1)


# Construit le parser argparse avec toutes les sous-commandes
def build_parser():
    parser = argparse.ArgumentParser(
        prog="manage.py",
        description="CLI de gestion du backend HEO-MOTION",
    )
    sub = parser.add_subparsers(dest="command", help="Commande a executer")

    # --- runserver ---
    srv = sub.add_parser("runserver", help="Demarre le serveur FastAPI")
    srv.add_argument("--host", default=None, help="Adresse d'ecoute (defaut: APP_HOST ou 0.0.0.0)")
    srv.add_argument("--port", type=int, default=None, help="Port d'ecoute (defaut: APP_PORT ou 8000)")
    srv.add_argument("--no-reload", dest="reload", action="store_false", help="Desactive le hot-reload")
    srv.set_defaults(reload=True, func=cmd_runserver)

    # --- runcelery ---
    cel = sub.add_parser("runcelery", help="Demarre le worker Celery")
    cel.add_argument("--concurrency", type=int, default=1, help="Nombre de workers (defaut: 1)")
    cel.add_argument("--loglevel", default="info", help="Niveau de log (defaut: info)")
    cel.set_defaults(func=cmd_runcelery)

    # --- migrate ---
    mig = sub.add_parser("migrate", help="Applique les migrations Alembic")
    mig.add_argument("revision", nargs="?", default="head", help="Revision cible (defaut: head)")
    mig.set_defaults(func=cmd_migrate)

    # --- makemigrations ---
    mak = sub.add_parser("makemigrations", help="Genere une migration Alembic")
    mak.add_argument("-m", "--message", default="auto", help="Message de la migration")
    mak.set_defaults(func=cmd_makemigrations)

    # --- shell ---
    sh = sub.add_parser("shell", help="Shell Python interactif")
    sh.set_defaults(func=cmd_shell)

    return parser


if __name__ == "__main__":
    parser = build_parser()
    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(0)

    args.func(args)
