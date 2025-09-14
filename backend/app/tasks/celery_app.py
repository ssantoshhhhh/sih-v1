from celery import Celery
from app.core.config import settings

# Create Celery instance
celery_app = Celery(
    "compliance_checker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.tasks.compliance_tasks",
        "app.tasks.monitoring_tasks",
        "app.tasks.reporting_tasks"
    ]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Periodic tasks configuration
celery_app.conf.beat_schedule = {
    'daily-compliance-scan': {
        'task': 'app.tasks.compliance_tasks.daily_compliance_scan',
        'schedule': 86400.0,  # Run daily (24 hours)
    },
    'hourly-monitoring-check': {
        'task': 'app.tasks.monitoring_tasks.system_health_check',
        'schedule': 3600.0,  # Run hourly
    },
    'weekly-compliance-report': {
        'task': 'app.tasks.reporting_tasks.generate_weekly_report',
        'schedule': 604800.0,  # Run weekly (7 days)
    },
    'cleanup-old-data': {
        'task': 'app.tasks.monitoring_tasks.cleanup_old_data',
        'schedule': 86400.0,  # Run daily
    }
}
