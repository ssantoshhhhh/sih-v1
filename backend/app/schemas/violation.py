from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from app.models.violation import ViolationType, ViolationSeverity, ViolationStatus

class ViolationBase(BaseModel):
    violation_type: ViolationType
    severity: ViolationSeverity
    description: str
    rule_reference: Optional[str] = None
    evidence: Optional[Dict[str, Any]] = None

class ViolationCreate(ViolationBase):
    product_id: int

class ViolationUpdate(BaseModel):
    status: Optional[ViolationStatus] = None
    resolution_notes: Optional[str] = None
    assigned_officer_id: Optional[int] = None

class ViolationInDB(ViolationBase):
    id: int
    status: ViolationStatus
    product_id: int
    assigned_officer_id: Optional[int]
    resolution_notes: Optional[str]
    detected_at: datetime
    resolved_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class Violation(ViolationInDB):
    pass
