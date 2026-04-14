from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.crop import CropCreate, CropResponse, CropDetails
from typing import List
from app.database.db import get_db
from app.models.crop import Crop
from datetime import datetime
import random

router = APIRouter()


@router.get("/crops", response_model=List[CropResponse])
def get_crops(db: Session = Depends(get_db)):
    """Get all crops from database"""
    crops = db.query(Crop).all()
    return crops


@router.post("/crops", response_model=CropResponse)
def create_crop(crop: CropCreate, db: Session = Depends(get_db)):
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
    db.add(db_crop)
    db.commit()
    db.refresh(db_crop)
    return db_crop


@router.get("/crops/{crop_id}", response_model=CropDetails)
def get_crop_details(crop_id: int, db: Session = Depends(get_db)):
    """Get detailed information about a specific crop from database"""
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    return crop


@router.delete("/crops/{crop_id}")
def delete_crop(crop_id: int, db: Session = Depends(get_db)):
    """Delete a crop from the database"""
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    db.delete(crop)
    db.commit()
    return {"message": "Crop deleted successfully"}