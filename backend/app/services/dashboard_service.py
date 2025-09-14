from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from datetime import datetime, timedelta
from app.models.product import Product, ComplianceStatus
from app.models.violation import Violation, ViolationStatus, ViolationSeverity
from app.models.platform import Platform

class DashboardService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_dashboard_stats(self) -> Dict[str, Any]:
        """Get comprehensive dashboard statistics"""
        
        # Product statistics
        total_products = self.db.query(Product).count()
        compliant_products = self.db.query(Product).filter(
            Product.compliance_status == ComplianceStatus.COMPLIANT
        ).count()
        non_compliant_products = self.db.query(Product).filter(
            Product.compliance_status == ComplianceStatus.NON_COMPLIANT
        ).count()
        pending_products = self.db.query(Product).filter(
            Product.compliance_status == ComplianceStatus.PENDING
        ).count()
        
        # Violation statistics
        total_violations = self.db.query(Violation).count()
        open_violations = self.db.query(Violation).filter(
            Violation.status == ViolationStatus.OPEN
        ).count()
        resolved_violations = self.db.query(Violation).filter(
            Violation.status == ViolationStatus.RESOLVED
        ).count()
        critical_violations = self.db.query(Violation).filter(
            Violation.severity == ViolationSeverity.CRITICAL,
            Violation.status == ViolationStatus.OPEN
        ).count()
        
        # Platform statistics
        total_platforms = self.db.query(Platform).count()
        active_platforms = self.db.query(Platform).filter(Platform.is_active == True).count()
        
        # Calculate rates
        compliance_rate = (compliant_products / total_products * 100) if total_products > 0 else 0
        resolution_rate = (resolved_violations / total_violations * 100) if total_violations > 0 else 0
        
        return {
            "products": {
                "total": total_products,
                "compliant": compliant_products,
                "non_compliant": non_compliant_products,
                "pending": pending_products,
                "compliance_rate": round(compliance_rate, 2)
            },
            "violations": {
                "total": total_violations,
                "open": open_violations,
                "resolved": resolved_violations,
                "critical": critical_violations,
                "resolution_rate": round(resolution_rate, 2)
            },
            "platforms": {
                "total": total_platforms,
                "active": active_platforms
            }
        }
    
    def get_violations_chart_data(self, days: int = 30) -> List[Dict[str, Any]]:
        """Get violation trends for chart display"""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        result = self.db.execute(text("""
            SELECT 
                DATE(detected_at) as date,
                violation_type,
                COUNT(*) as count
            FROM violations 
            WHERE detected_at BETWEEN :start_date AND :end_date
            GROUP BY DATE(detected_at), violation_type
            ORDER BY date, violation_type
        """), {"start_date": start_date, "end_date": end_date})
        
        return [
            {
                "date": row[0].isoformat(),
                "violation_type": row[1],
                "count": row[2]
            }
            for row in result
        ]
    
    def get_compliance_trends(self, days: int = 30) -> List[Dict[str, Any]]:
        """Get compliance trends over time"""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        result = self.db.execute(text("""
            SELECT 
                DATE(created_at) as date,
                compliance_status,
                COUNT(*) as count
            FROM products 
            WHERE created_at BETWEEN :start_date AND :end_date
            GROUP BY DATE(created_at), compliance_status
            ORDER BY date, compliance_status
        """), {"start_date": start_date, "end_date": end_date})
        
        return [
            {
                "date": row[0].isoformat(),
                "compliance_status": row[1],
                "count": row[2]
            }
            for row in result
        ]
