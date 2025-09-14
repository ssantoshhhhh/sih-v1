from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models.product import Product, ComplianceStatus
from app.models.platform import Platform
from app.models.category import Category
from app.schemas.product import ProductCreate, ProductUpdate
from datetime import datetime

class ProductService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_product(self, product_id: int) -> Optional[Product]:
        return self.db.query(Product).filter(Product.id == product_id).first()
    
    def get_product_by_product_id(self, product_id: str) -> Optional[Product]:
        return self.db.query(Product).filter(Product.product_id == product_id).first()
    
    def get_products(
        self,
        skip: int = 0,
        limit: int = 100,
        compliance_status: Optional[ComplianceStatus] = None,
        platform_id: Optional[int] = None,
        category_id: Optional[int] = None
    ) -> List[Product]:
        query = self.db.query(Product)
        
        if compliance_status:
            query = query.filter(Product.compliance_status == compliance_status)
        if platform_id:
            query = query.filter(Product.platform_id == platform_id)
        if category_id:
            query = query.filter(Product.category_id == category_id)
        
        return query.offset(skip).limit(limit).all()
    
    def create_product(self, product: ProductCreate) -> Product:
        db_product = Product(
            product_id=product.product_id,
            product_name=product.product_name,
            brand=product.brand,
            source=product.source,
            price=product.price,
            weight=product.weight,
            country_of_origin=product.country_of_origin,
            manufacturer=product.manufacturer,
            extracted_data=product.extracted_data,
            platform_id=product.platform_id,
            category_id=product.category_id,
            compliance_status=ComplianceStatus.PENDING
        )
        
        self.db.add(db_product)
        self.db.commit()
        self.db.refresh(db_product)
        return db_product
    
    def update_product(self, product_id: int, product_update: ProductUpdate) -> Optional[Product]:
        db_product = self.get_product(product_id)
        if not db_product:
            return None
        
        update_data = product_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_product, field, value)
        
        db_product.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(db_product)
        return db_product
    
    def delete_product(self, product_id: int) -> bool:
        db_product = self.get_product(product_id)
        if not db_product:
            return False
        
        self.db.delete(db_product)
        self.db.commit()
        return True
    
    def update_last_scanned(self, product_id: int):
        db_product = self.get_product(product_id)
        if db_product:
            db_product.last_scanned = datetime.utcnow()
            self.db.commit()
