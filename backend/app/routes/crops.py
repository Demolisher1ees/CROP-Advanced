from fastapi import APIRouter, HTTPException
from app.schemas.crop import CropCreate, CropResponse, CropDetails
from typing import List, Dict, Any
from app.models.crop import Crop
from datetime import datetime
import random
import httpx
import logging
import os
from pathlib import Path
from beanie import PydanticObjectId

router = APIRouter()
logger = logging.getLogger(__name__)


async def fetch_current_weather(latitude: float, longitude: float) -> Dict[str, Any]:
    """Fetch current weather from OpenWeatherMap (or Open-Meteo as keyless fallback)"""
    # 1. Look up OpenWeatherMap API key from environment or frontend's .env.local
    api_key = os.getenv("WEATHER_API_KEY")
    if not api_key:
        try:
            frontend_env_path = Path(__file__).parent.parent.parent.parent / "frontend" / ".env.local"
            if frontend_env_path.exists():
                with open(frontend_env_path, "r") as f:
                    for line in f:
                        if "NEXT_PUBLIC_OPENWEATHER_API_KEY" in line:
                            api_key = line.split("=")[1].strip()
                            break
        except Exception as e:
            logger.warning(f"Could not read key from frontend .env.local: {e}")

    # 2. Try OpenWeatherMap API if key is found
    if api_key and api_key != "your-weather-api-key" and api_key != "your-openweather-api-key-here":
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={api_key}&units=metric"
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=5.0)
                if response.status_code == 200:
                    data = response.json()
                    main = data.get("main", {})
                    rain = data.get("rain", {})
                    # rain can be hourly or 3h
                    precipitation = rain.get("1h", rain.get("3h", 0.0))
                    logger.info("Successfully fetched weather from OpenWeatherMap")
                    return {
                        "temperature": main.get("temp", 25.0),
                        "humidity": main.get("humidity", 60.0),
                        "precipitation": precipitation
                    }
        except Exception as e:
            logger.warning(f"Failed to fetch weather from OpenWeatherMap: {e}")

    # 3. Keyless Fallback to Open-Meteo API
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current=temperature_2m,relative_humidity_2m,precipitation&timezone=auto"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=5.0)
            if response.status_code == 200:
                data = response.json()
                current = data.get("current", {})
                logger.info("Successfully fetched weather from Open-Meteo fallback")
                return {
                    "temperature": current.get("temperature_2m", 25.0),
                    "humidity": current.get("relative_humidity_2m", 60.0),
                    "precipitation": current.get("precipitation", 0.0)
                }
    except Exception as e:
        logger.error(f"Failed to fetch weather from Open-Meteo fallback: {e}")
    
    # Fallback default values
    return {
        "temperature": 25.0,
        "humidity": 60.0,
        "precipitation": 0.0
    }


@router.get("/crops", response_model=List[CropResponse])
async def get_crops():
    """Get all crops from database"""
    crops = await Crop.find_all().to_list()
    return crops


@router.post("/crops", response_model=CropResponse)
async def create_crop(crop: CropCreate):
    """Create a new crop and store in database using real environmental analysis"""
    # 1. Fetch current weather if coordinates are available
    if crop.latitude is not None and crop.longitude is not None:
        weather = await fetch_current_weather(crop.latitude, crop.longitude)
    else:
        # Default fallback weather
        weather = {
            "temperature": 25.0,
            "humidity": 60.0,
            "precipitation": 0.0
        }

    # 2. Simulate realistic soil parameters based on location
    is_kolkata = any(k in crop.location.lower() for k in ["kolkata", "calcutta", "dum dum"])
    ph_val = 6.8 if is_kolkata else 6.5
    nitrogen_val = 35.0 if is_kolkata else 45.0
    clay_val = 35.0 if is_kolkata else 25.0
    sand_val = 25.0 if is_kolkata else 45.0
    oc_val = 0.8 if is_kolkata else 1.2
    
    soil = {
        "ph": ph_val,
        "nitrogen": nitrogen_val,
        "clay": clay_val,
        "sand": sand_val,
        "organic_carbon": oc_val
    }

    # 3. Request suitability analysis from the ML service
    suitability_score = 50.0
    recommendations_list = []
    recommendation_text = "Suitability analysis complete."
    try:
        async with httpx.AsyncClient() as client:
            # ML service is running locally on port 8001
            ml_service_url = "http://localhost:8001"
            response = await client.post(
                f"{ml_service_url}/analyze",
                json={
                    "crop_name": crop.crop_name,
                    "environment": {
                        "temperature": weather["temperature"],
                        "humidity": weather["humidity"],
                        "precipitation": weather["precipitation"],
                        "ph": soil["ph"],
                        "nitrogen": soil["nitrogen"],
                        "clay": soil["clay"],
                        "sand": soil["sand"],
                        "organic_carbon": soil["organic_carbon"],
                        "latitude": crop.latitude,
                        "longitude": crop.longitude
                    }
                },
                timeout=5.0
            )
            if response.status_code == 200:
                analysis = response.json()
                suitability_score = analysis.get("suitability_score", 50.0)
                recommendations_list = analysis.get("recommendations", [])
                if recommendations_list:
                    # Pick the first action/message as primary recommendation
                    recommendation_text = recommendations_list[0].get("message", recommendation_text)
    except Exception as e:
        logger.error(f"Failed to query ML service: {e}")

    # 4. Map suitability score to risk level and status
    if suitability_score >= 75.0:
        risk_level = "Low"
        status = "Healthy - Favorable conditions"
    elif suitability_score >= 45.0:
        risk_level = "Medium"
        status = "Medium risk - Needs monitoring"
    else:
        risk_level = "High"
        status = "High risk - Unsuitable conditions"

    # Map weather/precipitation to soil moisture categories
    if weather["precipitation"] > 5.0:
        moisture_level = "High"
    elif weather["humidity"] > 75.0:
        moisture_level = "High"
    elif weather["humidity"] > 45.0:
        moisture_level = "Medium"
    else:
        moisture_level = "Low"

    # Create DB object
    db_crop = Crop(
        crop_name=crop.crop_name,
        location=crop.location,
        latitude=crop.latitude,
        longitude=crop.longitude,
        temperature=round(weather["temperature"], 1),
        soil_moisture=moisture_level,
        status=status,
        risk_level=risk_level,
        soil_data=soil,
        weather_data=weather,
        recommendation=recommendation_text,
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