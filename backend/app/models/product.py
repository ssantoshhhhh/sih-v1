from sqlalchemy import Column, Integer, String, DateTime, Boolean, JSON, ForeignKey, Float, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class ComplianceStatus(enum.Enum):
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    PENDING = "pending"
    UNDER_REVIEW = "under_review"

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String, unique=True, index=True, nullable=False)
    product_name = Column(String, nullable=False)
    brand = Column(String)
    source = Column(String, nullable=False)  # Platform URL
    compliance_status = Column(Enum(ComplianceStatus), default=ComplianceStatus.PENDING)
    violation_count = Column(Integer, default=0)
    extracted_data = Column(JSON)
    price = Column(Float)
    weight = Column(String)
    country_of_origin = Column(String)
    manufacturer = Column(String)
    last_scanned = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign Keys
    platform_id = Column(Integer, ForeignKey("platforms.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))
    
    # Relationships
    platform = relationship("Platform", back_populates="products")
    category = relationship("Category", back_populates="products")
    violations = relationship("Violation", back_populates="product")
