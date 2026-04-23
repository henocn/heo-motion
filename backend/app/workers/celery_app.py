from celery import Celery

from app.config import settings


#################################################
#           Celery Application                  #
#################################################


# Cree et configure l'instance Celery avec Redis comme broker
celery_app = Celery(
    "heo_motion",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL.replace("/0", "/1"),
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Europe/Paris",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)

celery_app.autodiscover_tasks([
    "app.workers.generation_tasks",
    "app.workers.vectorization_tasks",
    "app.workers.export_tasks",
])
