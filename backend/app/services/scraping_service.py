import asyncio
import re
from typing import Dict, Any, Optional, List
from urllib.parse import urljoin, urlparse
import httpx
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
from app.core.config import settings

class WebScrapingService:
    """
    Advanced web scraping service for e-commerce product data extraction
    """
    
    def __init__(self):
        self.session = httpx.AsyncClient(
            timeout=30.0,
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        )
        self.selenium_options = self._setup_selenium_options()
    
    def _setup_selenium_options(self) -> Options:
        """Setup Chrome options for Selenium"""
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')
        options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        return options
    
    async def scrape_product_data(self, url: str, platform_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Scrape product data from a given URL using platform-specific configuration
        """
        try:
            # Determine scraping method based on platform config
            if platform_config.get('requires_js', False):
                return await self._scrape_with_selenium(url, platform_config)
            else:
                return await self._scrape_with_httpx(url, platform_config)
        except Exception as e:
            return {
                'error': str(e),
                'url': url,
                'scraped_successfully': False
            }
    
    async def _scrape_with_httpx(self, url: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """Scrape using HTTP requests (faster for static content)"""
        try:
            response = await self.session.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            return self._extract_product_data(soup, url, config)
            
        except httpx.RequestError as e:
            raise Exception(f"HTTP request failed: {str(e)}")
    
    async def _scrape_with_selenium(self, url: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """Scrape using Selenium (for JavaScript-heavy sites)"""
        driver = None
        try:
            driver = webdriver.Chrome(options=self.selenium_options)
            driver.get(url)
            
            # Wait for page to load
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Additional wait for dynamic content
            await asyncio.sleep(2)
            
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            return self._extract_product_data(soup, url, config)
            
        except (TimeoutException, WebDriverException) as e:
            raise Exception(f"Selenium scraping failed: {str(e)}")
        finally:
            if driver:
                driver.quit()
    
    def _extract_product_data(self, soup: BeautifulSoup, url: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """Extract product data using CSS selectors from platform config"""
        selectors = config.get('selectors', {})
        
        extracted_data = {
            'url': url,
            'scraped_successfully': True,
            'platform': self._identify_platform(url)
        }
        
        # Extract basic product information
        extracted_data.update(self._extract_basic_info(soup, selectors))
        
        # Extract pricing information
        extracted_data.update(self._extract_pricing_info(soup, selectors))
        
        # Extract compliance-related information
        extracted_data.update(self._extract_compliance_info(soup, selectors))
        
        # Extract images
        extracted_data['images'] = self._extract_images(soup, url, selectors)
        
        return extracted_data
    
    def _extract_basic_info(self, soup: BeautifulSoup, selectors: Dict[str, str]) -> Dict[str, Any]:
        """Extract basic product information"""
        data = {}
        
        # Product name
        name_selector = selectors.get('product_name', 'h1, .product-title, [data-testid="product-title"]')
        name_element = soup.select_one(name_selector)
        data['product_name'] = name_element.get_text(strip=True) if name_element else None
        
        # Brand
        brand_selector = selectors.get('brand', '.brand, .product-brand, [data-testid="brand"]')
        brand_element = soup.select_one(brand_selector)
        data['brand'] = brand_element.get_text(strip=True) if brand_element else None
        
        # Description
        desc_selector = selectors.get('description', '.description, .product-description, .product-details')
        desc_element = soup.select_one(desc_selector)
        data['description'] = desc_element.get_text(strip=True) if desc_element else None
        
        return data
    
    def _extract_pricing_info(self, soup: BeautifulSoup, selectors: Dict[str, str]) -> Dict[str, Any]:
        """Extract pricing information"""
        data = {}
        
        # Price
        price_selector = selectors.get('price', '.price, .product-price, [data-testid="price"]')
        price_element = soup.select_one(price_selector)
        if price_element:
            price_text = price_element.get_text(strip=True)
            data['price_text'] = price_text
            data['price'] = self._extract_price_value(price_text)
        
        # MRP
        mrp_selector = selectors.get('mrp', '.mrp, .original-price, .strike-price')
        mrp_element = soup.select_one(mrp_selector)
        if mrp_element:
            mrp_text = mrp_element.get_text(strip=True)
            data['mrp_text'] = mrp_text
            data['mrp'] = self._extract_price_value(mrp_text)
        
        return data
    
    def _extract_compliance_info(self, soup: BeautifulSoup, selectors: Dict[str, str]) -> Dict[str, Any]:
        """Extract compliance-related information"""
        data = {}
        
        # Weight/Quantity
        weight_selector = selectors.get('weight', '.weight, .quantity, .net-weight, .product-weight')
        weight_element = soup.select_one(weight_selector)
        data['weight'] = weight_element.get_text(strip=True) if weight_element else None
        
        # Country of Origin
        origin_selector = selectors.get('country_of_origin', '.country-origin, .origin, .made-in')
        origin_element = soup.select_one(origin_selector)
        data['country_of_origin'] = origin_element.get_text(strip=True) if origin_element else None
        
        # Manufacturer
        manufacturer_selector = selectors.get('manufacturer', '.manufacturer, .brand-owner, .company')
        manufacturer_element = soup.select_one(manufacturer_selector)
        data['manufacturer'] = manufacturer_element.get_text(strip=True) if manufacturer_element else None
        
        # Additional compliance fields from product details
        details_selector = selectors.get('product_details', '.product-details, .specifications, .details')
        details_element = soup.select_one(details_selector)
        if details_element:
            details_text = details_element.get_text().lower()
            
            # Extract additional info using regex
            data.update(self._extract_details_with_regex(details_text))
        
        return data
    
    def _extract_details_with_regex(self, text: str) -> Dict[str, Any]:
        """Extract additional details using regex patterns"""
        data = {}
        
        # Weight patterns
        weight_patterns = [
            r'weight[:\s]*(\d+\.?\d*\s*(?:kg|g|gram|grams|kilogram|kilograms))',
            r'net\s*weight[:\s]*(\d+\.?\d*\s*(?:kg|g|gram|grams|kilogram|kilograms))',
            r'(\d+\.?\d*\s*(?:kg|g|gram|grams|kilogram|kilograms))'
        ]
        
        for pattern in weight_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                data['extracted_weight'] = match.group(1).strip()
                break
        
        # Country patterns
        country_patterns = [
            r'country\s*of\s*origin[:\s]*([a-zA-Z\s]+)',
            r'made\s*in[:\s]*([a-zA-Z\s]+)',
            r'origin[:\s]*([a-zA-Z\s]+)'
        ]
        
        for pattern in country_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                data['extracted_country'] = match.group(1).strip()
                break
        
        return data
    
    def _extract_images(self, soup: BeautifulSoup, base_url: str, selectors: Dict[str, str]) -> List[str]:
        """Extract product images"""
        image_selector = selectors.get('images', '.product-image img, .gallery img, [data-testid="product-image"]')
        image_elements = soup.select(image_selector)
        
        images = []
        for img in image_elements[:5]:  # Limit to 5 images
            src = img.get('src') or img.get('data-src')
            if src:
                # Convert relative URLs to absolute
                absolute_url = urljoin(base_url, src)
                images.append(absolute_url)
        
        return images
    
    def _extract_price_value(self, price_text: str) -> Optional[float]:
        """Extract numeric price value from text"""
        if not price_text:
            return None
        
        # Remove currency symbols and extract number
        price_match = re.search(r'[\d,]+\.?\d*', price_text.replace(',', ''))
        if price_match:
            try:
                return float(price_match.group())
            except ValueError:
                pass
        
        return None
    
    def _identify_platform(self, url: str) -> str:
        """Identify e-commerce platform from URL"""
        domain = urlparse(url).netloc.lower()
        
        platform_mapping = {
            'amazon.in': 'Amazon India',
            'flipkart.com': 'Flipkart',
            'myntra.com': 'Myntra',
            'ajio.com': 'Ajio',
            'nykaa.com': 'Nykaa',
            'bigbasket.com': 'BigBasket',
            'grofers.com': 'Grofers',
            'paytmmall.com': 'Paytm Mall'
        }
        
        for domain_key, platform_name in platform_mapping.items():
            if domain_key in domain:
                return platform_name
        
        return 'Unknown Platform'
    
    async def close(self):
        """Close the HTTP session"""
        await self.session.aclose()

# Platform-specific configurations
PLATFORM_CONFIGS = {
    'amazon': {
        'requires_js': True,
        'selectors': {
            'product_name': '#productTitle',
            'price': '.a-price-whole',
            'mrp': '.a-price.a-text-price .a-offscreen',
            'brand': '#bylineInfo',
            'weight': '#feature-bullets ul li span',
            'images': '#landingImage, .a-dynamic-image',
            'product_details': '#feature-bullets, #productDetails_techSpec_section_1'
        }
    },
    'flipkart': {
        'requires_js': True,
        'selectors': {
            'product_name': '.B_NuCI',
            'price': '._30jeq3._16Jk6d',
            'mrp': '._3I9_wc._2p6lqe',
            'brand': '._2WkVRV',
            'weight': '._21Ahn-',
            'images': '._396cs4 img',
            'product_details': '._1mXcCf'
        }
    },
    'myntra': {
        'requires_js': False,
        'selectors': {
            'product_name': '.pdp-name',
            'price': '.pdp-price strong',
            'mrp': '.pdp-mrp',
            'brand': '.pdp-title',
            'images': '.image-grid-image',
            'product_details': '.index-productDetailsContainer'
        }
    }
}
