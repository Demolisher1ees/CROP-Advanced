from fastapi import APIRouter, HTTPException
from app.database.cache_manager import cache_manager
from app.core.utils import generate_cache_key, normalize_location

router = APIRouter()


@router.get("/{location}")
async def get_weather(location: str):
    """Get weather data for a location"""
    normalized_location = normalize_location(location)
    cache_key = generate_cache_key("weather", location=normalized_location)
    
    # Check cache
    cached_data = cache_manager.get(cache_key)
    if cached_data:
        return cached_data
    
    # Mock weather data (replace with actual API call)
    weather_data = {
        "location": location,
        "temperature": 25.5,
        "humidity": 65,
        "rainfall": 120,
        "wind_speed": 12.5,
        "conditions": "Partly Cloudy",
        "forecast": [
            {"day": "Today", "temp": 25.5, "conditions": "Partly Cloudy"},
            {"day": "Tomorrow", "temp": 26.0, "conditions": "Sunny"},
            {"day": "Day 3", "temp": 24.5, "conditions": "Rainy"}
        ]
    }
    
    # Cache for 1 hour
    cache_manager.set(cache_key, weather_data, ttl=3600)
    
    return weather_data
