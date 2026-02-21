from fastapi import APIRouter, HTTPException
from app.schemas.crop import CropCreate, CropResponse, CropDetails, WeatherData, SoilData, AIRecommendation
from typing import List
from datetime import datetime
import random

router = APIRouter()

# In-memory storage (replace with database in production)
crops_db = []
crop_id_counter = 1


@router.get("/crops", response_model=List[CropResponse])
async def get_crops():
    """
    Get all crops
    """
    return crops_db


@router.post("/crops", response_model=CropResponse)
async def create_crop(crop: CropCreate):
    """
    Create a new crop
    """
    global crop_id_counter
    
    # Simulate some initial data
    new_crop = CropResponse(
        id=crop_id_counter,
        crop_name=crop.crop_name,
        location=crop.location,
        latitude=crop.latitude,
        longitude=crop.longitude,
        temperature=round(random.uniform(25, 38), 1),
        soil_moisture=random.choice(["Low", "Medium", "High"]),
        status=random.choice([
            "Healthy - Continue monitoring",
            "Needs water - Irrigate soon",
            "Optimal conditions",
            "Check soil nutrients"
        ]),
        risk_level=random.choice(["Low", "Medium", "High"]),
        last_checked=datetime.now()
    )
    
    crops_db.append(new_crop)
    crop_id_counter += 1
    
    return new_crop


@router.get("/crops/{crop_id}", response_model=CropDetails)
async def get_crop_details(crop_id: int):
    """
    Get detailed information about a specific crop
    """
    # Find crop
    crop = next((c for c in crops_db if c.id == crop_id), None)
    
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    
    # Generate detailed data
    details = CropDetails(
        **crop.dict(),
        weather=WeatherData(
            temperature=round(random.uniform(25, 38), 1),
            humidity=round(random.uniform(40, 90), 1),
            rain_forecast=random.choice(["No rain expected", "Light rain", "Heavy rain", "Moderate rain"])
        ),
        soil=SoilData(
            moisture=random.choice(["Low", "Medium", "High"]),
            ph=round(random.uniform(5.5, 8.0), 1),
            nitrogen=round(random.uniform(150, 350), 1),
            phosphorus=round(random.uniform(20, 60), 1),
            potassium=round(random.uniform(100, 300), 1)
        ),
        ai_recommendation=AIRecommendation(
            water_needed=random.choice([True, False]),
            fertilizer_needed=random.choice([True, False]),
            shade_needed=random.choice([True, False]),
            notes=random.choice([
                "Crop is in optimal condition. Continue current care routine.",
                "Consider increasing irrigation frequency due to high temperatures.",
                "Soil nutrients are adequate. No immediate action required.",
                "Monitor for pest activity. Apply organic pesticides if needed."
            ])
        )
    )
    
    return details


@router.delete("/crops/{crop_id}")
async def delete_crop(crop_id: int):
    """
    Delete a crop
    """
    global crops_db
    
    crop = next((c for c in crops_db if c.id == crop_id), None)
    
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    
    crops_db = [c for c in crops_db if c.id != crop_id]
    
    return {"message": "Crop deleted successfully"}
