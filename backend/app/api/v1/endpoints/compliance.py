from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.permissions import require_officer
from app.models.user import User
from app.schemas.product import ProductScanRequest
from app.services.compliance_service import ComplianceService

router = APIRouter()

@router.post("/scan")
async def scan_product_url(
    scan_request: ProductScanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_officer)
):
    service = ComplianceService(db)
    result = await service.scan_product_from_url(scan_request)
    return result

@router.post("/bulk-scan")
async def bulk_scan_platform(
    platform_id: int,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_officer)
):
    service = ComplianceService(db)
    result = await service.bulk_scan_platform(platform_id, limit)
    return result

@router.get("/rules")
async def get_compliance_rules(
    current_user: User = Depends(get_current_user)
):
    service = ComplianceService(None)
    return service.get_all_rules()
