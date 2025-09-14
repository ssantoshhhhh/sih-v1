from celery import current_task
from app.tasks.celery_app import celery_app
from app.core.database import SessionLocal, engine
from app.services.violation_service import ViolationService
from app.services.product_service import ProductService
from sqlalchemy import text
from datetime import datetime, timedelta
import psutil
import logging

logger = logging.getLogger(__name__)

@celery_app.task
def system_health_check():
    """Monitor system health and performance"""
    try:
        health_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "database": _check_database_health(),
            "system": _check_system_resources(),
            "application": _check_application_health(),
            "status": "healthy"
        }
        
        # Determine overall health status
        if (health_data["database"]["status"] != "healthy" or 
            health_data["system"]["cpu_usage"] > 90 or 
            health_data["system"]["memory_usage"] > 90):
            health_data["status"] = "unhealthy"
        elif (health_data["system"]["cpu_usage"] > 70 or 
              health_data["system"]["memory_usage"] > 70):
            health_data["status"] = "warning"
        
        logger.info(f"System health check completed: {health_data['status']}")
        
        # Store health data (you might want to store this in a monitoring database)
        if health_data["status"] != "healthy":
            logger.warning(f"System health warning: {health_data}")
        
        return health_data
        
    except Exception as e:
        logger.error(f"System health check failed: {str(e)}")
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "status": "error",
            "error": str(e)
        }

def _check_database_health():
    """Check database connectivity and performance"""
    try:
        db = SessionLocal()
        start_time = datetime.utcnow()
        
        # Test basic connectivity
        result = db.execute(text("SELECT 1"))
        result.fetchone()
        
        # Check response time
        response_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        # Get database stats
        product_count = db.execute(text("SELECT COUNT(*) FROM products")).scalar()
        violation_count = db.execute(text("SELECT COUNT(*) FROM violations")).scalar()
        
        db.close()
        
        return {
            "status": "healthy" if response_time < 1000 else "slow",
            "response_time_ms": response_time,
            "product_count": product_count,
            "violation_count": violation_count
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }

def _check_system_resources():
    """Check system resource usage"""
    try:
        cpu_usage = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        return {
            "cpu_usage": cpu_usage,
            "memory_usage": memory.percent,
            "memory_available_gb": memory.available / (1024**3),
            "disk_usage": disk.percent,
            "disk_free_gb": disk.free / (1024**3)
        }
        
    except Exception as e:
        return {
            "error": str(e)
        }

def _check_application_health():
    """Check application-specific health metrics"""
    db = SessionLocal()
    try:
        violation_service = ViolationService(db)
        product_service = ProductService(db)
        
        # Get recent activity stats
        recent_products = len(product_service.get_products(limit=100))
        violation_stats = violation_service.get_violation_stats()
        
        # Check for stuck processes (products not scanned in 24 hours)
        yesterday = datetime.utcnow() - timedelta(days=1)
        stale_products = db.execute(
            text("SELECT COUNT(*) FROM products WHERE last_scanned < :yesterday OR last_scanned IS NULL"),
            {"yesterday": yesterday}
        ).scalar()
        
        return {
            "recent_products": recent_products,
            "violation_stats": violation_stats,
            "stale_products": stale_products,
            "status": "healthy" if stale_products < 100 else "warning"
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "status": "unhealthy"
        }
    finally:
        db.close()

@celery_app.task
def cleanup_old_data():
    """Clean up old data to maintain database performance"""
    db = SessionLocal()
    try:
        cleanup_results = {
            "timestamp": datetime.utcnow().isoformat(),
            "cleaned_items": {}
        }
        
        # Clean up old resolved violations (older than 6 months)
        six_months_ago = datetime.utcnow() - timedelta(days=180)
        old_violations = db.execute(
            text("""
                DELETE FROM violations 
                WHERE status = 'resolved' AND resolved_at < :six_months_ago
                RETURNING id
            """),
            {"six_months_ago": six_months_ago}
        )
        cleanup_results["cleaned_items"]["old_violations"] = old_violations.rowcount
        
        # Clean up old product scan data (keep only latest scan data)
        db.execute(text("""
            UPDATE products 
            SET extracted_data = jsonb_strip_nulls(
                jsonb_build_object(
                    'compliance_score', extracted_data->'compliance_score',
                    'last_scan_summary', extracted_data->'last_scan_summary'
                )
            )
            WHERE jsonb_typeof(extracted_data) = 'object'
            AND char_length(extracted_data::text) > 10000
        """))
        
        # Clean up old reports (older than 1 year)
        one_year_ago = datetime.utcnow() - timedelta(days=365)
        old_reports = db.execute(
            text("DELETE FROM reports WHERE generated_at < :one_year_ago RETURNING id"),
            {"one_year_ago": one_year_ago}
        )
        cleanup_results["cleaned_items"]["old_reports"] = old_reports.rowcount
        
        db.commit()
        
        logger.info(f"Data cleanup completed: {cleanup_results}")
        return cleanup_results
        
    except Exception as e:
        db.rollback()
        logger.error(f"Data cleanup failed: {str(e)}")
        raise
    finally:
        db.close()

@celery_app.task
def alert_critical_violations():
    """Send alerts for critical violations"""
    db = SessionLocal()
    try:
        violation_service = ViolationService(db)
        
        # Get critical violations from last 24 hours
        from app.models.violation import ViolationSeverity, ViolationStatus
        critical_violations = violation_service.get_violations(
            severity=ViolationSeverity.CRITICAL,
            status=ViolationStatus.OPEN,
            limit=100
        )
        
        if critical_violations:
            alert_data = {
                "timestamp": datetime.utcnow().isoformat(),
                "critical_violations_count": len(critical_violations),
                "violations": [
                    {
                        "id": v.id,
                        "type": v.violation_type.value,
                        "description": v.description,
                        "product_id": v.product_id,
                        "detected_at": v.detected_at.isoformat()
                    }
                    for v in critical_violations[:10]  # Limit to first 10
                ]
            }
            
            # Here you would integrate with your alerting system
            # (email, Slack, SMS, etc.)
            logger.warning(f"Critical violations alert: {alert_data}")
            
            return alert_data
        
        return {"message": "No critical violations found"}
        
    except Exception as e:
        logger.error(f"Critical violations alert failed: {str(e)}")
        raise
    finally:
        db.close()
