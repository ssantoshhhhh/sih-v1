from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.models.product import ComplianceStatus

class ProductBase(BaseModel):
    product_id: str
    product_name: str
    brand: Optional[str] = None
    source: str
    price: Optional[float] = None
    weight: Optional[str] = None
    country_of_origin: Optional[str] = None
    manufacturer: Optional[str] = None
    extracted_data: Optional[Dict[str, Any]] = None

class ProductCreate(ProductBase):
    platform_id: int
    category_id: int

class ProductUpdate(BaseModel):
    product_name: Optional[str] = None
    brand: Optional[str] = None
    price: Optional[float] = None
    weight: Optional[str] = None
    country_of_origin: Optional[str] = None
    manufacturer: Optional[str] = None
    extracted_data: Optional[Dict[str, Any]] = None
    compliance_status: Optional[ComplianceStatus] = None

class ProductInDB(ProductBase):
    id: int
    compliance_status: ComplianceStatus
    violation_count: int
    platform_id: int
    category_id: int
    last_scanned: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class Product(ProductInDB):
    violations: Optional[List[Dict[str, Any]]] = None

class ProductScanRequest(BaseModel):
    url: str
    platform_id: int
    category_id: int
