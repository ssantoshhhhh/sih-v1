from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.permissions import require_officer
from app.models.user import User
from app.models.product import Product as ProductModel, ComplianceStatus
from app.schemas.product import Product, ProductCreate, ProductUpdate, ProductScanRequest
from app.services.product_service import ProductService
from app.services.compliance_engine import LegalMetrologyRuleEngine
from app.services.violation_service import ViolationService

router = APIRouter()

@router.get("/", response_model=List[Product])
async def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    compliance_status: Optional[ComplianceStatus] = None,
    platform_id: Optional[int] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProductService(db)
    products = service.get_products(
        skip=skip,
        limit=limit,
        compliance_status=compliance_status,
        platform_id=platform_id,
        category_id=category_id
    )
    return products

@router.get("/{product_id}", response_model=Product)
async def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProductService(db)
    product = service.get_product(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product

@router.post("/", response_model=Product)
async def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_officer)
):
    service = ProductService(db)
    return service.create_product(product)

@router.put("/{product_id}", response_model=Product)
async def update_product(
    product_id: int,
    product_update: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_officer)
):
    service = ProductService(db)
    product = service.update_product(product_id, product_update)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product

@router.delete("/{product_id}")
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_officer)
):
    service = ProductService(db)
    if not service.delete_product(product_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return {"message": "Product deleted successfully"}

@router.post("/{product_id}/scan")
async def scan_product_compliance(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_officer)
):
    service = ProductService(db)
    product = service.get_product(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Run compliance check
    engine = LegalMetrologyRuleEngine()
    violations = engine.validate_product(product)
    compliance_score = engine.get_compliance_score(product)
    
    # Update product compliance status
    if violations:
        product.compliance_status = ComplianceStatus.NON_COMPLIANT
        product.violation_count = len(violations)
        
        # Create violation records
        violation_service = ViolationService(db)
        for violation_data in violations:
            violation_service.create_violation(violation_data, product_id)
    else:
        product.compliance_status = ComplianceStatus.COMPLIANT
        product.violation_count = 0
    
    db.commit()
    
    return {
        "product_id": product_id,
        "compliance_status": product.compliance_status,
        "compliance_score": compliance_score,
        "violations_found": len(violations),
        "violations": violations
    }
