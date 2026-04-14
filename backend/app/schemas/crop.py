from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime


class CropBase(BaseModel):
    crop_name: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    user_id: Optional[int] = None

    @validator('crop_name', 'location', pre=True)
    def strip_strings(cls, v):
        return v.strip()


class CropCreate(CropBase):
    pass


class CropResponse(CropBase):
    id: int
    temperature: Optional[float] = None
    soil_moisture: Optional[str] = None
    status: str = "Monitoring"
    risk_level: str = "Low"
    last_checked: datetime
    soil_data: Optional[dict] = None
    weather_data: Optional[dict] = None
    recommendation: Optional[str] = None

    class Config:
        from_attributes = True


class WeatherData(BaseModel):
    temperature: float
    humidity: float
    rain_forecast: str


class SoilData(BaseModel):
    moisture: str
    ph: float
    nitrogen: float
    phosphorus: float
    potassium: float


class AIRecommendation(BaseModel):
    water_needed: bool
    fertilizer_needed: bool
    shade_needed: bool
    notes: str


class CropDetails(CropResponse):
    weather: Optional[WeatherData] = None
    soil: Optional[SoilData] = None
    ai_recommendation: Optional[AIRecommendation] = None
