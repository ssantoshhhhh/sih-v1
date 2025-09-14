from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.permissions import require_officer
from app.models.user import User
from app.schemas.platform import Platform, PlatformCreate, PlatformUpdate
from app.services.platform_service import PlatformService

router = APIRouter()

@router.get("/", response_model=List[Platform])
async def get_platforms(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = PlatformService(db)
    return service.get_platforms(skip=skip, limit=limit)

@router.get("/{platform_id}", response_model=Platform)
async def get_platform(
    platform_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = PlatformService(db)
    platform = service.get_platform(platform_id)
    if not platform:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Platform not found"
        )
    return platform

@router.post("/", response_model=Platform)
async def create_platform(
    platform: PlatformCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_officer)
):
    service = PlatformService(db)
    return service.create_platform(platform)

@router.put("/{platform_id}", response_model=Platform)
async def update_platform(
    platform_id: int,
    platform_update: PlatformUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_officer)
):
    service = PlatformService(db)
    platform = service.update_platform(platform_id, platform_update)
    if not platform:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Platform not found"
        )
    return platform

@router.post("/{platform_id}/test")
async def test_platform_connection(
    platform_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_officer)
):
    service = PlatformService(db)
    result = await service.test_platform_connection(platform_id)
    return result
