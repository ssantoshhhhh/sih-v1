#!/usr/bin/env python3
"""
Celery worker entry point
"""
from app.tasks.celery_app import celery_app

if __name__ == '__main__':
    celery_app.start()
