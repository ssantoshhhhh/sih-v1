from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.permissions import require_officer
from app.models.user import User
from app.models.violation import ViolationStatus, ViolationSeverity, ViolationType
from app.schemas.violation import Violation, ViolationUpdate
from app.services.violation_service import ViolationService

router = APIRouter()

@router.get("/", response_model=List[Violation])
async def get_violations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[ViolationStatus] = None,
    severity: Optional[ViolationSeverity] = None,
    violation_type: Optional[ViolationType] = None,
    assigned_officer_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ViolationService(db)
    violations = service.get_violations(
        skip=skip,
        limit=limit,
        status=status,
        severity=severity,
        violation_type=violation_type,
        assigned_officer_id=assigned_officer_id
    )
    return violations

@router.get("/{violation_id}", response_model=Violation)
async def get_violation(
    violation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ViolationService(db)
    violation = service.get_violation(violation_id)
    if not violation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Violation not found"
        )
    return violation

@router.put("/{violation_id}/assign")
async def assign_violation(
    violation_id: int,
    officer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_officer)
):
    service = ViolationService(db)
    violation = service.assign_violation(violation_id, officer_id)
    if not violation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Violation not found"
        )
    return {"message": "Violation assigned successfully", "violation": violation}

@router.put("/{violation_id}/resolve")
async def resolve_violation(
    violation_id: int,
    resolution_notes: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_officer)
):
    service = ViolationService(db)
    violation = service.resolve_violation(violation_id, resolution_notes)
    if not violation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Violation not found"
        )
    return {"message": "Violation resolved successfully", "violation": violation}

@router.get("/stats/overview")
async def get_violation_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ViolationService(db)
    return service.get_violation_stats()
