from datetime import datetime
from typing import Optional, Dict, Any
from beanie import Document, PydanticObjectId
from pydantic import Field

class Crop(Document):
    user_id: Optional[PydanticObjectId] = None
    crop_name: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    temperature: Optional[float] = None
    soil_moisture: Optional[str] = None
    status: str = "Monitoring"
    risk_level: str = "Low"
    last_checked: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    soil_data: Optional[Dict[str, Any]] = None
    weather_data: Optional[Dict[str, Any]] = None
    recommendation: Optional[str] = None

    class Settings:
        name = "crops"

