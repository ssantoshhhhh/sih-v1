from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.platform import Platform

class PlatformService:
    def __init__(self, db: Session):
        self.db = db

    def get_active_platforms(self) -> List[Platform]:
        return self.db.query(Platform).filter(Platform.is_active == True).all()

    def get_platform(self, platform_id: int) -> Optional[Platform]:
        return self.db.query(Platform).filter(Platform.id == platform_id).first()
