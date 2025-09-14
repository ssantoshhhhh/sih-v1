from celery import current_task
from app.tasks.celery_app import celery_app
from app.core.database import SessionLocal
from app.services.compliance_service import ComplianceService
from app.services.platform_service import PlatformService
from app.services.product_service import ProductService
from app.models.product import ComplianceStatus
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

@celery_app.task(bind=True)
def daily_compliance_scan(self):
    """Daily task to scan all active platforms for compliance"""
    db = SessionLocal()
    try:
        compliance_service = ComplianceService(db)
        platform_service = PlatformService(db)
        
        # Get all active platforms
        platforms = platform_service.get_active_platforms()
        
        results = {
            "total_platforms": len(platforms),
            "scanned_platforms": 0,
            "total_products_scanned": 0,
            "compliance_summary": {
                "compliant": 0,
                "non_compliant": 0,
                "pending": 0
            },
            "platform_results": []
        }
        
        for platform in platforms:
            try:
                # Update task progress
                current_task.update_state(
                    state='PROGRESS',
                    meta={
                        'current_platform': platform.name,
                        'completed_platforms': results["scanned_platforms"],
                        'total_platforms': results["total_platforms"]
                    }
                )
                
                # Bulk scan platform
                platform_result = await compliance_service.bulk_scan_platform(
                    platform.id, 
                    limit=100
                )
                
                results["scanned_platforms"] += 1
                results["total_products_scanned"] += platform_result.get("total_scanned", 0)
                
                # Update compliance summary
                compliance_results = platform_result.get("compliance_results", {})
                results["compliance_summary"]["compliant"] += compliance_results.get("compliant", 0)
                results["compliance_summary"]["non_compliant"] += compliance_results.get("non_compliant", 0)
                results["compliance_summary"]["pending"] += compliance_results.get("pending", 0)
                
                results["platform_results"].append({
                    "platform_id": platform.id,
                    "platform_name": platform.name,
                    "result": platform_result
                })
                
                logger.info(f"Completed compliance scan for platform: {platform.name}")
                
            except Exception as e:
                logger.error(f"Error scanning platform {platform.name}: {str(e)}")
                results["platform_results"].append({
                    "platform_id": platform.id,
                    "platform_name": platform.name,
                    "error": str(e)
                })
        
        logger.info(f"Daily compliance scan completed. Results: {results}")
        return results
        
    except Exception as e:
        logger.error(f"Daily compliance scan failed: {str(e)}")
        raise
    finally:
        db.close()

@celery_app.task(bind=True)
def scan_single_product(self, product_url: str, platform_id: int, category_id: int):
    """Background task to scan a single product"""
    db = SessionLocal()
    try:
        compliance_service = ComplianceService(db)
        
        from app.schemas.product import ProductScanRequest
        scan_request = ProductScanRequest(
            url=product_url,
            platform_id=platform_id,
            category_id=category_id
        )
        
        result = await compliance_service.scan_product_from_url(scan_request)
        
        logger.info(f"Product scan completed for URL: {product_url}")
        return result
        
    except Exception as e:
        logger.error(f"Product scan failed for URL {product_url}: {str(e)}")
        raise
    finally:
        db.close()

@celery_app.task
def update_compliance_scores():
    """Task to recalculate compliance scores for all products"""
    db = SessionLocal()
    try:
        from app.services.compliance_engine import LegalMetrologyRuleEngine
        
        product_service = ProductService(db)
        compliance_engine = LegalMetrologyRuleEngine()
        
        # Get all products
        products = product_service.get_products(limit=10000)
        
        updated_count = 0
        for product in products:
            try:
                # Recalculate compliance score
                compliance_score = compliance_engine.get_compliance_score(product)
                
                # Update product if score changed significantly
                if abs((product.extracted_data or {}).get('compliance_score', 0) - compliance_score) > 5:
                    extracted_data = product.extracted_data or {}
                    extracted_data['compliance_score'] = compliance_score
                    
                    from app.schemas.product import ProductUpdate
                    product_service.update_product(
                        product.id,
                        ProductUpdate(extracted_data=extracted_data)
                    )
                    updated_count += 1
                    
            except Exception as e:
                logger.error(f"Error updating compliance score for product {product.id}: {str(e)}")
        
        logger.info(f"Updated compliance scores for {updated_count} products")
        return {"updated_products": updated_count}
        
    except Exception as e:
        logger.error(f"Compliance score update failed: {str(e)}")
        raise
    finally:
        db.close()
