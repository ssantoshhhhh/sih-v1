from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.services.dashboard_service import DashboardService

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = DashboardService(db)
    return service.get_dashboard_stats()

@router.get("/violations/chart")
async def get_violations_chart_data(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = DashboardService(db)
    return service.get_violations_chart_data(days)

@router.get("/compliance/trends")
async def get_compliance_trends(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = DashboardService(db)
    return service.get_compliance_trends(days)
