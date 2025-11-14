from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class SoilData(BaseModel):
    ph: float
    nitrogen: float
    phosphorus: float
    potassium: float
    organic_matter: Optional[float] = None


@router.post("/analyze")
async def analyze_soil(soil_data: SoilData):
    """Analyze soil parameters and provide recommendations"""
    
    # Validate ranges
    if not (0 <= soil_data.ph <= 14):
        raise HTTPException(status_code=400, detail="pH must be between 0 and 14")
    
    # Generate recommendations
    recommendations = []
    
    if soil_data.ph < 6.0:
        recommendations.append("Soil is acidic. Consider adding lime to raise pH.")
    elif soil_data.ph > 7.5:
        recommendations.append("Soil is alkaline. Consider adding sulfur to lower pH.")
    else:
        recommendations.append("Soil pH is optimal for most crops.")
    
    if soil_data.nitrogen < 20:
        recommendations.append("Low nitrogen levels. Add nitrogen-rich fertilizer.")
    if soil_data.phosphorus < 15:
        recommendations.append("Low phosphorus. Consider adding phosphate fertilizer.")
    if soil_data.potassium < 20:
        recommendations.append("Low potassium. Add potash fertilizer.")
    
    return {
        "soil_data": soil_data.dict(),
        "quality_score": min(100, (soil_data.nitrogen + soil_data.phosphorus + soil_data.potassium) / 3),
        "recommendations": recommendations,
        "suitable_crops": ["Wheat", "Rice", "Corn", "Soybeans"]
    }
