from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/compliance_db")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_HOSTS: List[str] = ["http://localhost:3000", "https://your-frontend-domain.com"]
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Scraping
    SCRAPING_DELAY: int = 2
    MAX_CONCURRENT_REQUESTS: int = 10
    
    # Legal Metrology Rules
    WEIGHT_TOLERANCE: float = 0.05  # 5% tolerance
    PRICE_DISPLAY_REQUIRED: bool = True
    COUNTRY_OF_ORIGIN_REQUIRED: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings()
