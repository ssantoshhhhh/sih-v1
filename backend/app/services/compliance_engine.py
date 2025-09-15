import re
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from app.models.product import Product, ComplianceStatus
from app.models.violation import Violation, ViolationType, ViolationSeverity
from app.core.config import settings
import joblib
import os

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

    def analyze_with_ml(self, products: List[Product]) -> Dict[str, Any]:
        """
        Use ML models to analyze products for anomalies and patterns
        """
        if not products:
            return {}

        # Prepare data for ML analysis
        df = self._prepare_ml_data(products)

        results = {
            'anomaly_detection': self._detect_price_anomalies(df),
            'clustering': self._cluster_products(df),
            'insights': self._generate_ml_insights(df)
        }

        return results

    def _prepare_ml_data(self, products: List[Product]) -> pd.DataFrame:
        """Prepare product data for ML analysis"""
        data = []
        for product in products:
            extracted = product.extracted_data or {}
            data.append({
                'id': product.id,
                'price': product.price or extracted.get('price', 0),
                'weight': self._extract_numeric_weight(product.weight or extracted.get('weight', '')),
                'compliance_score': product.compliance_score,
                'platform': product.platform_id,
                'category': product.category_id,
                'brand': product.brand or '',
                'country_of_origin': product.country_of_origin or ''
            })

        return pd.DataFrame(data)

    def _extract_numeric_weight(self, weight_str: str) -> float:
        """Extract numeric weight value from string"""
        if not weight_str:
            return 0.0

        # Extract numbers
        import re
        numbers = re.findall(r'\d+\.?\d*', weight_str.lower())
        if numbers:
            return float(numbers[0])
        return 0.0

    def _detect_price_anomalies(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Detect price anomalies using Isolation Forest"""
        # Filter products with valid prices
        price_data = df[df['price'] > 0][['price', 'weight']].fillna(0)

        if len(price_data) < 10:
            return {'anomalies': [], 'message': 'Insufficient data for anomaly detection'}

        # Scale the data
        scaler = StandardScaler()
        scaled_data = scaler.fit_transform(price_data)

        # Train Isolation Forest
        iso_forest = IsolationForest(contamination=0.1, random_state=42)
        anomalies = iso_forest.fit_predict(scaled_data)

        # Get anomaly indices
        anomaly_indices = df[df['price'] > 0].index[anomalies == -1].tolist()

        return {
            'anomalies': anomaly_indices,
            'contamination_rate': 0.1,
            'total_products_analyzed': len(price_data)
        }

    def _cluster_products(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Cluster products based on price and compliance"""
        # Prepare clustering data
        cluster_data = df[['price', 'compliance_score']].fillna(0)

        if len(cluster_data) < 5:
            return {'clusters': {}, 'message': 'Insufficient data for clustering'}

        # Scale data
        scaler = StandardScaler()
        scaled_data = scaler.fit_transform(cluster_data)

        # Perform K-means clustering
        kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
        clusters = kmeans.fit_predict(scaled_data)

        # Analyze clusters
        cluster_analysis = {}
        for i in range(3):
            cluster_products = df[clusters == i]
            cluster_analysis[f'cluster_{i}'] = {
                'size': len(cluster_products),
                'avg_price': cluster_products['price'].mean(),
                'avg_compliance': cluster_products['compliance_score'].mean(),
                'product_ids': cluster_products['id'].tolist()
            }

        return {
            'clusters': cluster_analysis,
            'cluster_centers': kmeans.cluster_centers_.tolist()
        }

    def _generate_ml_insights(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Generate insights from ML analysis"""
        insights = {}

        # Price distribution insights
        if len(df[df['price'] > 0]) > 0:
            price_stats = df[df['price'] > 0]['price'].describe()
            insights['price_distribution'] = {
                'mean': price_stats['mean'],
                'median': price_stats['50%'],
                'std': price_stats['std'],
                'range': f"{price_stats['min']:.2f} - {price_stats['max']:.2f}"
            }

        # Compliance score insights
        compliance_stats = df['compliance_score'].describe()
        insights['compliance_distribution'] = {
            'mean': compliance_stats['mean'],
            'median': compliance_stats['50%'],
            'high_compliance_count': len(df[df['compliance_score'] >= 80]),
            'low_compliance_count': len(df[df['compliance_score'] < 50])
        }

        # Platform-wise insights
        platform_stats = df.groupby('platform')['compliance_score'].agg(['mean', 'count'])
        insights['platform_compliance'] = platform_stats.to_dict()

        return insights
