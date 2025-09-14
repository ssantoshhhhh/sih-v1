from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime
from app.models.violation import Violation, ViolationStatus, ViolationType, ViolationSeverity
from app.models.product import Product
from app.models.user import User
from app.schemas.violation import ViolationCreate, ViolationUpdate

class ViolationService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_violation(self, violation_data: Dict[str, Any], product_id: int) -> Violation:
        """Create a new violation from compliance engine results"""
        db_violation = Violation(
            product_id=product_id,
            violation_type=violation_data["violation_type"],
            severity=violation_data["severity"],
            description=violation_data["description"],
            rule_reference=violation_data["rule_reference"],
            evidence=violation_data["evidence"],
            status=ViolationStatus.OPEN
        )
        
        self.db.add(db_violation)
        self.db.commit()
        self.db.refresh(db_violation)
        return db_violation
    
    def get_violation(self, violation_id: int) -> Optional[Violation]:
        return self.db.query(Violation).filter(Violation.id == violation_id).first()
    
    def get_violations(
        self,
        skip: int = 0,
        limit: int = 100,
        status: Optional[ViolationStatus] = None,
        severity: Optional[ViolationSeverity] = None,
        violation_type: Optional[ViolationType] = None,
        assigned_officer_id: Optional[int] = None
    ) -> List[Violation]:
        query = self.db.query(Violation)
        
        if status:
            query = query.filter(Violation.status == status)
        if severity:
            query = query.filter(Violation.severity == severity)
        if violation_type:
            query = query.filter(Violation.violation_type == violation_type)
        if assigned_officer_id:
            query = query.filter(Violation.assigned_officer_id == assigned_officer_id)
        
        return query.offset(skip).limit(limit).all()
    
    def assign_violation(self, violation_id: int, officer_id: int) -> Optional[Violation]:
        violation = self.get_violation(violation_id)
        if not violation:
            return None
        
        violation.assigned_officer_id = officer_id
        violation.status = ViolationStatus.IN_PROGRESS
        
        self.db.commit()
        self.db.refresh(violation)
        return violation
    
    def resolve_violation(self, violation_id: int, resolution_notes: str) -> Optional[Violation]:
        violation = self.get_violation(violation_id)
        if not violation:
            return None
        
        violation.status = ViolationStatus.RESOLVED
        violation.resolution_notes = resolution_notes
        violation.resolved_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(violation)
        return violation
    
    def get_violation_stats(self) -> Dict[str, Any]:
        """Get violation statistics"""
        total_violations = self.db.query(Violation).count()
        open_violations = self.db.query(Violation).filter(
            Violation.status == ViolationStatus.OPEN
        ).count()
        in_progress_violations = self.db.query(Violation).filter(
            Violation.status == ViolationStatus.IN_PROGRESS
        ).count()
        resolved_violations = self.db.query(Violation).filter(
            Violation.status == ViolationStatus.RESOLVED
        ).count()
        
        # Violations by severity
        critical_violations = self.db.query(Violation).filter(
            Violation.severity == ViolationSeverity.CRITICAL
        ).count()
        high_violations = self.db.query(Violation).filter(
            Violation.severity == ViolationSeverity.HIGH
        ).count()
        
        return {
            "total_violations": total_violations,
            "open_violations": open_violations,
            "in_progress_violations": in_progress_violations,
            "resolved_violations": resolved_violations,
            "critical_violations": critical_violations,
            "high_violations": high_violations,
            "resolution_rate": (resolved_violations / total_violations * 100) if total_violations > 0 else 0
        }
