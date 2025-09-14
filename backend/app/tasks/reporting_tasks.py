from app.tasks.celery_app import celery_app
from app.core.database import SessionLocal
from app.services.violation_service import ViolationService
from app.services.product_service import ProductService
from app.services.dashboard_service import DashboardService
from app.models.report import Report, ReportType
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

@celery_app.task
def generate_weekly_report():
    """Generate weekly compliance report"""
    db = SessionLocal()
    try:
        dashboard_service = DashboardService(db)
        
        # Get data for the past week
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=7)
        
        # Generate report data
        report_data = {
            "period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "summary": dashboard_service.get_dashboard_stats(),
            "violations": dashboard_service.get_violations_chart_data(7),
            "compliance_trends": dashboard_service.get_compliance_trends(7),
            "top_violations": _get_top_violations(db, start_date, end_date),
            "platform_performance": _get_platform_performance(db, start_date, end_date)
        }
        
        # Save report to database
        report = Report(
            title=f"Weekly Compliance Report - {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}",
            report_type=ReportType.WEEKLY,
            data=report_data,
            period_start=start_date,
            period_end=end_date
        )
        
        db.add(report)
        db.commit()
        db.refresh(report)
        
        logger.info(f"Weekly report generated with ID: {report.id}")
        return {
            "report_id": report.id,
            "title": report.title,
            "summary": report_data["summary"]
        }
        
    except Exception as e:
        logger.error(f"Weekly report generation failed: {str(e)}")
        raise
    finally:
        db.close()

@celery_app.task
def generate_monthly_report():
    """Generate monthly compliance report"""
    db = SessionLocal()
    try:
        dashboard_service = DashboardService(db)
        
        # Get data for the past month
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30)
        
        # Generate comprehensive monthly report
        report_data = {
            "period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "executive_summary": _generate_executive_summary(db, start_date, end_date),
            "detailed_stats": dashboard_service.get_dashboard_stats(),
            "violation_analysis": _get_detailed_violation_analysis(db, start_date, end_date),
            "compliance_trends": dashboard_service.get_compliance_trends(30),
            "platform_comparison": _get_platform_comparison(db, start_date, end_date),
            "recommendations": _generate_recommendations(db, start_date, end_date)
        }
        
        # Save report to database
        report = Report(
            title=f"Monthly Compliance Report - {start_date.strftime('%B %Y')}",
            report_type=ReportType.MONTHLY,
            data=report_data,
            period_start=start_date,
            period_end=end_date
        )
        
        db.add(report)
        db.commit()
        db.refresh(report)
        
        logger.info(f"Monthly report generated with ID: {report.id}")
        return {
            "report_id": report.id,
            "title": report.title,
            "executive_summary": report_data["executive_summary"]
        }
        
    except Exception as e:
        logger.error(f"Monthly report generation failed: {str(e)}")
        raise
    finally:
        db.close()

def _get_top_violations(db, start_date, end_date):
    """Get top violations for the period"""
    from sqlalchemy import text
    
    result = db.execute(text("""
        SELECT 
            violation_type,
            COUNT(*) as count,
            AVG(CASE WHEN severity = 'critical' THEN 4
                     WHEN severity = 'high' THEN 3
                     WHEN severity = 'medium' THEN 2
                     ELSE 1 END) as avg_severity
        FROM violations 
        WHERE detected_at BETWEEN :start_date AND :end_date
        GROUP BY violation_type
        ORDER BY count DESC
        LIMIT 10
    """), {"start_date": start_date, "end_date": end_date})
    
    return [
        {
            "violation_type": row[0],
            "count": row[1],
            "avg_severity": float(row[2])
        }
        for row in result
    ]

def _get_platform_performance(db, start_date, end_date):
    """Get platform performance metrics"""
    from sqlalchemy import text
    
    result = db.execute(text("""
        SELECT 
            p.name,
            COUNT(DISTINCT pr.id) as total_products,
            COUNT(v.id) as total_violations,
            AVG(CASE WHEN pr.compliance_status = 'compliant' THEN 100
                     WHEN pr.compliance_status = 'non_compliant' THEN 0
                     ELSE 50 END) as compliance_rate
        FROM platforms p
        LEFT JOIN products pr ON p.id = pr.platform_id
        LEFT JOIN violations v ON pr.id = v.product_id 
            AND v.detected_at BETWEEN :start_date AND :end_date
        WHERE pr.created_at BETWEEN :start_date AND :end_date
        GROUP BY p.id, p.name
        ORDER BY compliance_rate DESC
    """), {"start_date": start_date, "end_date": end_date})
    
    return [
        {
            "platform_name": row[0],
            "total_products": row[1],
            "total_violations": row[2],
            "compliance_rate": float(row[3]) if row[3] else 0
        }
        for row in result
    ]

def _generate_executive_summary(db, start_date, end_date):
    """Generate executive summary for the report"""
    violation_service = ViolationService(db)
    stats = violation_service.get_violation_stats()
    
    return {
        "total_violations": stats["total_violations"],
        "resolution_rate": stats["resolution_rate"],
        "critical_violations": stats["critical_violations"],
        "key_insights": [
            f"Total violations detected: {stats['total_violations']}",
            f"Resolution rate: {stats['resolution_rate']:.1f}%",
            f"Critical violations requiring immediate attention: {stats['critical_violations']}"
        ]
    }

def _get_detailed_violation_analysis(db, start_date, end_date):
    """Get detailed violation analysis"""
    from sqlalchemy import text
    
    # Violation trends by type
    trends = db.execute(text("""
        SELECT 
            violation_type,
            DATE(detected_at) as date,
            COUNT(*) as count
        FROM violations 
        WHERE detected_at BETWEEN :start_date AND :end_date
        GROUP BY violation_type, DATE(detected_at)
        ORDER BY date, violation_type
    """), {"start_date": start_date, "end_date": end_date})
    
    return {
        "trends": [
            {
                "violation_type": row[0],
                "date": row[1].isoformat(),
                "count": row[2]
            }
            for row in trends
        ]
    }

def _get_platform_comparison(db, start_date, end_date):
    """Compare platform compliance performance"""
    return _get_platform_performance(db, start_date, end_date)

def _generate_recommendations(db, start_date, end_date):
    """Generate recommendations based on violation patterns"""
    top_violations = _get_top_violations(db, start_date, end_date)
    
    recommendations = []
    
    for violation in top_violations[:3]:  # Top 3 violations
        if violation["violation_type"] == "weight_declaration":
            recommendations.append({
                "priority": "high",
                "category": "Weight Declaration",
                "recommendation": "Implement automated weight validation checks for product listings",
                "impact": "Could reduce weight declaration violations by up to 70%"
            })
        elif violation["violation_type"] == "price_display":
            recommendations.append({
                "priority": "critical",
                "category": "Price Display",
                "recommendation": "Mandate MRP display validation before product approval",
                "impact": "Essential for legal compliance under Legal Metrology Rules"
            })
    
    return recommendations
