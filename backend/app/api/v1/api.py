from fastapi import APIRouter
from app.api.v1.endpoints import auth, products, platforms, violations, dashboard, compliance

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(platforms.router, prefix="/platforms", tags=["platforms"])
api_router.include_router(violations.router, prefix="/violations", tags=["violations"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(compliance.router, prefix="/compliance", tags=["compliance"])
