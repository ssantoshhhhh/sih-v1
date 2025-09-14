from sqlalchemy import Column, Integer, String, DateTime, Boolean, JSON, ForeignKey, Enum, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class ViolationType(enum.Enum):
    WEIGHT_DECLARATION = "weight_declaration"
    PRICE_DISPLAY = "price_display"
    COUNTRY_OF_ORIGIN = "country_of_origin"
    MANUFACTURER_INFO = "manufacturer_info"
    UNIT_PRICING = "unit_pricing"
    QUANTITY_DECLARATION = "quantity_declaration"
    LABELING = "labeling"

class ViolationSeverity(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ViolationStatus(enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"

class Violation(Base):
    __tablename__ = "violations"
    
    id = Column(Integer, primary_key=True, index=True)
    violation_type = Column(Enum(ViolationType), nullable=False)
    severity = Column(Enum(ViolationSeverity), default=ViolationSeverity.MEDIUM)
    status = Column(Enum(ViolationStatus), default=ViolationStatus.OPEN)
    description = Column(Text, nullable=False)
    rule_reference = Column(String)
    evidence = Column(JSON)
    resolution_notes = Column(Text)
    detected_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True))
    
    # Foreign Keys
    product_id = Column(Integer, ForeignKey("products.id"))
    assigned_officer_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    product = relationship("Product", back_populates="violations")
    assigned_officer = relationship("User", back_populates="violations")
