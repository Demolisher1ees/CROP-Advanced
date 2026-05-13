from fastapi import APIRouter, HTTPException
from app.schemas.crop import CropCreate, CropResponse, CropDetails
from typing import List
from app.models.crop import Crop
from datetime import datetime
import random
from beanie import PydanticObjectId

router = APIRouter()


@router.get("/crops", response_model=List[CropResponse])
async def get_crops():
    """Get all crops from database"""
    crops = await Crop.find_all().to_list()
    return crops


@router.post("/crops", response_model=CropResponse)
async def create_crop(crop: CropCreate):
    """Create a new crop and store in database"""
    # create DB object
    db_crop = Crop(
        crop_name=crop.crop_name,
        location=crop.location,
        latitude=crop.latitude,
        longitude=crop.longitude,
        # initial random monitoring values
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
    await db_crop.insert()
    return db_crop


@router.get("/crops/{crop_id}", response_model=CropDetails)
async def get_crop_details(crop_id: str):
    """Get detailed information about a specific crop from database"""
    try:
        oid = PydanticObjectId(crop_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid crop ID format")
        
    crop = await Crop.get(oid)
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    return crop


@router.delete("/crops/{crop_id}")
async def delete_crop(crop_id: str):
    """Delete a crop from the database"""
    try:
        oid = PydanticObjectId(crop_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid crop ID format")
        
    crop = await Crop.get(oid)
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    await crop.delete()
    return {"message": "Crop deleted successfully"}