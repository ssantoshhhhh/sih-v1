import re
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from app.models.product import Product, ComplianceStatus
from app.models.violation import Violation, ViolationType, ViolationSeverity
from app.core.config import settings

@dataclass
class ComplianceRule:
    rule_id: str
    name: str
    description: str
    violation_type: ViolationType
    severity: ViolationSeverity
    rule_reference: str
    
class LegalMetrologyRuleEngine:
    """
    Implements Legal Metrology Rules 2011 for Indian e-commerce platforms
    """
    
    def __init__(self):
        self.rules = self._initialize_rules()
    
    def _initialize_rules(self) -> List[ComplianceRule]:
        return [
            ComplianceRule(
                rule_id="LM001",
                name="Weight Declaration Mandatory",
                description="Products must declare weight in metric units",
                violation_type=ViolationType.WEIGHT_DECLARATION,
                severity=ViolationSeverity.HIGH,
                rule_reference="Rule 6(1) - Legal Metrology Rules 2011"
            ),
            ComplianceRule(
                rule_id="LM002",
                name="Price Display Required",
                description="Maximum retail price must be clearly displayed",
                violation_type=ViolationType.PRICE_DISPLAY,
                severity=ViolationSeverity.CRITICAL,
                rule_reference="Rule 18 - Legal Metrology Rules 2011"
            ),
            ComplianceRule(
                rule_id="LM003",
                name="Country of Origin",
                description="Country of origin must be declared",
                violation_type=ViolationType.COUNTRY_OF_ORIGIN,
                severity=ViolationSeverity.MEDIUM,
                rule_reference="Rule 8 - Legal Metrology Rules 2011"
            ),
            ComplianceRule(
                rule_id="LM004",
                name="Manufacturer Information",
                description="Name and address of manufacturer/packer required",
                violation_type=ViolationType.MANUFACTURER_INFO,
                severity=ViolationSeverity.HIGH,
                rule_reference="Rule 7 - Legal Metrology Rules 2011"
            ),
            ComplianceRule(
                rule_id="LM005",
                name="Unit Pricing",
                description="Price per unit weight/volume must be displayed",
                violation_type=ViolationType.UNIT_PRICING,
                severity=ViolationSeverity.MEDIUM,
                rule_reference="Rule 19 - Legal Metrology Rules 2011"
            )
        ]
    
    def validate_product(self, product: Product) -> List[Dict[str, Any]]:
        """
        Validate a product against all compliance rules
        Returns list of violations found
        """
        violations = []
        extracted_data = product.extracted_data or {}
        
        # Rule LM001: Weight Declaration
        if not self._validate_weight_declaration(product, extracted_data):
            violations.append(self._create_violation_dict("LM001", product, extracted_data))
        
        # Rule LM002: Price Display
        if not self._validate_price_display(product, extracted_data):
            violations.append(self._create_violation_dict("LM002", product, extracted_data))
        
        # Rule LM003: Country of Origin
        if not self._validate_country_of_origin(product, extracted_data):
            violations.append(self._create_violation_dict("LM003", product, extracted_data))
        
        # Rule LM004: Manufacturer Information
        if not self._validate_manufacturer_info(product, extracted_data):
            violations.append(self._create_violation_dict("LM004", product, extracted_data))
        
        # Rule LM005: Unit Pricing
        if not self._validate_unit_pricing(product, extracted_data):
            violations.append(self._create_violation_dict("LM005", product, extracted_data))
        
        return violations
    
    def _validate_weight_declaration(self, product: Product, data: Dict) -> bool:
        """Validate weight declaration compliance"""
        weight_patterns = [
            r'\d+\.?\d*\s*(kg|g|gram|grams|kilogram|kilograms)',
            r'\d+\.?\d*\s*(ml|l|litre|litres|millilitre|millilitres)',
            r'\d+\.?\d*\s*(piece|pieces|pcs|units?)'
        ]
        
        # Check product weight field
        if product.weight:
            for pattern in weight_patterns:
                if re.search(pattern, product.weight.lower()):
                    return True
        
        # Check extracted data
        weight_fields = ['weight', 'net_weight', 'quantity', 'volume', 'size']
        for field in weight_fields:
            if field in data and data[field]:
                for pattern in weight_patterns:
                    if re.search(pattern, str(data[field]).lower()):
                        return True
        
        return False
    
    def _validate_price_display(self, product: Product, data: Dict) -> bool:
        """Validate price display compliance"""
        # Check if price is available
        if product.price and product.price > 0:
            return True
        
        # Check extracted data for price information
        price_fields = ['price', 'mrp', 'cost', 'amount', 'rate']
        for field in price_fields:
            if field in data and data[field]:
                try:
                    price_value = float(str(data[field]).replace('₹', '').replace(',', ''))
                    if price_value > 0:
                        return True
                except (ValueError, TypeError):
                    continue
        
        return False
    
    def _validate_country_of_origin(self, product: Product, data: Dict) -> bool:
        """Validate country of origin declaration"""
        # Check product country_of_origin field
        if product.country_of_origin and product.country_of_origin.strip():
            return True
        
        # Check extracted data
        origin_fields = ['country_of_origin', 'origin', 'made_in', 'manufactured_in']
        for field in origin_fields:
            if field in data and data[field] and str(data[field]).strip():
                return True
        
        return False
    
    def _validate_manufacturer_info(self, product: Product, data: Dict) -> bool:
        """Validate manufacturer information compliance"""
        # Check product manufacturer field
        if product.manufacturer and product.manufacturer.strip():
            return True
        
        # Check extracted data
        manufacturer_fields = ['manufacturer', 'packer', 'company', 'brand_owner']
        for field in manufacturer_fields:
            if field in data and data[field] and str(data[field]).strip():
                return True
        
        return False
    
    def _validate_unit_pricing(self, product: Product, data: Dict) -> bool:
        """Validate unit pricing compliance"""
        # Check if both price and weight are available for unit calculation
        if product.price and product.weight:
            return True
        
        # Check extracted data for unit pricing
        unit_price_fields = ['unit_price', 'price_per_unit', 'rate_per_kg', 'cost_per_gram']
        for field in unit_price_fields:
            if field in data and data[field]:
                return True
        
        return False
    
    def _create_violation_dict(self, rule_id: str, product: Product, data: Dict) -> Dict[str, Any]:
        """Create violation dictionary for a specific rule"""
        rule = next((r for r in self.rules if r.rule_id == rule_id), None)
        if not rule:
            return {}
        
        return {
            "violation_type": rule.violation_type,
            "severity": rule.severity,
            "description": f"{rule.name}: {rule.description}",
            "rule_reference": rule.rule_reference,
            "evidence": {
                "product_data": {
                    "name": product.product_name,
                    "brand": product.brand,
                    "price": product.price,
                    "weight": product.weight,
                    "country_of_origin": product.country_of_origin,
                    "manufacturer": product.manufacturer
                },
                "extracted_data": data,
                "rule_id": rule_id
            }
        }
    
    def get_compliance_score(self, product: Product) -> float:
        """Calculate compliance score for a product (0-100)"""
        violations = self.validate_product(product)
        total_rules = len(self.rules)
        violations_count = len(violations)
        
        if total_rules == 0:
            return 100.0
        
        # Weight violations by severity
        severity_weights = {
            ViolationSeverity.LOW: 0.25,
            ViolationSeverity.MEDIUM: 0.5,
            ViolationSeverity.HIGH: 0.75,
            ViolationSeverity.CRITICAL: 1.0
        }
        
        weighted_violations = sum(
            severity_weights.get(v.get("severity", ViolationSeverity.MEDIUM), 0.5)
            for v in violations
        )
        
        score = max(0, 100 - (weighted_violations / total_rules * 100))
        return round(score, 2)
