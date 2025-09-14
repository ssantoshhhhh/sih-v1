from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.services.scraping_service import WebScrapingService, PLATFORM_CONFIGS
from app.services.compliance_engine import LegalMetrologyRuleEngine
from app.services.product_service import ProductService
from app.services.violation_service import ViolationService
from app.services.platform_service import PlatformService
from app.schemas.product import ProductCreate, ProductScanRequest
from app.models.product import ComplianceStatus
from app.models.platform import Platform
import hashlib
from urllib.parse import urlparse

class ComplianceService:
    def __init__(self, db: Session):
        self.db = db
        self.scraping_service = WebScrapingService()
        self.compliance_engine = LegalMetrologyRuleEngine()
        self.product_service = ProductService(db) if db else None
        self.violation_service = ViolationService(db) if db else None
        self.platform_service = PlatformService(db) if db else None
    
    async def scan_product_from_url(self, scan_request: ProductScanRequest) -> Dict[str, Any]:
        """Scan a single product from URL and check compliance"""
        try:
            # Get platform configuration
            platform = self.platform_service.get_platform(scan_request.platform_id)
            if not platform:
                return {"error": "Platform not found"}
            
            platform_config = platform.scraping_config or self._get_default_config(scan_request.url)
            
            # Scrape product data
            scraped_data = await self.scraping_service.scrape_product_data(
                scan_request.url, 
                platform_config
            )
            
            if not scraped_data.get('scraped_successfully'):
                return {
                    "error": "Failed to scrape product data",
                    "details": scraped_data.get('error')
                }
            
            # Create or update product
            product_id = self._generate_product_id(scan_request.url)
            existing_product = self.product_service.get_product_by_product_id(product_id)
            
            if existing_product:
                # Update existing product
                product = self.product_service.update_product(
                    existing_product.id,
                    self._create_product_update_from_scraped_data(scraped_data)
                )
            else:
                # Create new product
                product_create = ProductCreate(
                    product_id=product_id,
                    product_name=scraped_data.get('product_name', 'Unknown Product'),
                    brand=scraped_data.get('brand'),
                    source=scan_request.url,
                    price=scraped_data.get('price'),
                    weight=scraped_data.get('weight') or scraped_data.get('extracted_weight'),
                    country_of_origin=scraped_data.get('country_of_origin') or scraped_data.get('extracted_country'),
                    manufacturer=scraped_data.get('manufacturer'),
                    extracted_data=scraped_data,
                    platform_id=scan_request.platform_id,
                    category_id=scan_request.category_id
                )
                product = self.product_service.create_product(product_create)
            
            # Run compliance check
            violations = self.compliance_engine.validate_product(product)
            compliance_score = self.compliance_engine.get_compliance_score(product)
            
            # Update compliance status
            if violations:
                product.compliance_status = ComplianceStatus.NON_COMPLIANT
                product.violation_count = len(violations)
                
                # Create violation records
                for violation_data in violations:
                    self.violation_service.create_violation(violation_data, product.id)
            else:
                product.compliance_status = ComplianceStatus.COMPLIANT
                product.violation_count = 0
            
            self.product_service.update_last_scanned(product.id)
            
            return {
                "success": True,
                "product_id": product.id,
                "product_name": product.product_name,
                "compliance_status": product.compliance_status,
                "compliance_score": compliance_score,
                "violations_found": len(violations),
                "violations": violations,
                "scraped_data": scraped_data
            }
            
        except Exception as e:
            return {
                "error": f"Compliance scan failed: {str(e)}",
                "url": scan_request.url
            }
    
    async def bulk_scan_platform(self, platform_id: int, limit: int = 100) -> Dict[str, Any]:
        """Bulk scan products from a platform"""
        platform = self.platform_service.get_platform(platform_id)
        if not platform:
            return {"error": "Platform not found"}
        
        # Get existing products for this platform
        products = self.product_service.get_products(
            platform_id=platform_id,
            limit=limit
        )
        
        results = {
            "total_scanned": 0,
            "successful_scans": 0,
            "failed_scans": 0,
            "compliance_results": {
                "compliant": 0,
                "non_compliant": 0,
                "pending": 0
            },
            "details": []
        }
        
        for product in products:
            try:
                # Re-scan existing product
                scan_request = ProductScanRequest(
                    url=product.source,
                    platform_id=platform_id,
                    category_id=product.category_id
                )
                
                result = await self.scan_product_from_url(scan_request)
                results["total_scanned"] += 1
                
                if result.get("success"):
                    results["successful_scans"] += 1
                    status = result.get("compliance_status")
                    if status == ComplianceStatus.COMPLIANT:
                        results["compliance_results"]["compliant"] += 1
                    elif status == ComplianceStatus.NON_COMPLIANT:
                        results["compliance_results"]["non_compliant"] += 1
                    else:
                        results["compliance_results"]["pending"] += 1
                else:
                    results["failed_scans"] += 1
                
                results["details"].append({
                    "product_id": product.id,
                    "product_name": product.product_name,
                    "result": result
                })
                
            except Exception as e:
                results["failed_scans"] += 1
                results["details"].append({
                    "product_id": product.id,
                    "error": str(e)
                })
        
        return results
    
    def get_all_rules(self) -> List[Dict[str, Any]]:
        """Get all compliance rules"""
        return [
            {
                "rule_id": rule.rule_id,
                "name": rule.name,
                "description": rule.description,
                "violation_type": rule.violation_type.value,
                "severity": rule.severity.value,
                "rule_reference": rule.rule_reference
            }
            for rule in self.compliance_engine.rules
        ]
    
    def _generate_product_id(self, url: str) -> str:
        """Generate unique product ID from URL"""
        return hashlib.md5(url.encode()).hexdigest()[:16]
    
    def _get_default_config(self, url: str) -> Dict[str, Any]:
        """Get default scraping configuration based on URL"""
        domain = urlparse(url).netloc.lower()
        
        if 'amazon' in domain:
            return PLATFORM_CONFIGS['amazon']
        elif 'flipkart' in domain:
            return PLATFORM_CONFIGS['flipkart']
        elif 'myntra' in domain:
            return PLATFORM_CONFIGS['myntra']
        else:
            return {
                'requires_js': False,
                'selectors': {
                    'product_name': 'h1, .product-title, .title',
                    'price': '.price, .cost, .amount',
                    'brand': '.brand, .manufacturer',
                    'images': 'img[src*="product"], .product-image img'
                }
            }
    
    def _create_product_update_from_scraped_data(self, scraped_data: Dict[str, Any]):
        """Create ProductUpdate from scraped data"""
        from app.schemas.product import ProductUpdate
        
        return ProductUpdate(
            product_name=scraped_data.get('product_name'),
            brand=scraped_data.get('brand'),
            price=scraped_data.get('price'),
            weight=scraped_data.get('weight') or scraped_data.get('extracted_weight'),
            country_of_origin=scraped_data.get('country_of_origin') or scraped_data.get('extracted_country'),
            manufacturer=scraped_data.get('manufacturer'),
            extracted_data=scraped_data
        )
