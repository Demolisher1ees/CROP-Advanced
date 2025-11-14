from pydantic import BaseModel, Field
from typing import Optional


class CropPredictionRequest(BaseModel):
    temperature: float = Field(..., ge=-10, le=50, description="Temperature in Celsius")
    humidity: float = Field(..., ge=0, le=100, description="Humidity percentage")
    ph: float = Field(..., ge=0, le=14, description="Soil pH level")
    rainfall: Optional[float] = Field(None, ge=0, description="Rainfall in mm")
    nitrogen: float = Field(..., ge=0, le=100, description="Nitrogen content")
    phosphorus: float = Field(..., ge=0, le=100, description="Phosphorus content")
    potassium: float = Field(..., ge=0, le=100, description="Potassium content")
    
    class Config:
        json_schema_extra = {
            "example": {
                "temperature": 25.5,
                "humidity": 65,
                "ph": 6.5,
                "rainfall": 120,
                "nitrogen": 40,
                "phosphorus": 30,
                "potassium": 35
            }
        }
