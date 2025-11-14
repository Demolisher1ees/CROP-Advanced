import hashlib
import json
from typing import Any


def generate_cache_key(prefix: str, **kwargs) -> str:
    """Generate a cache key from prefix and parameters"""
    params_str = json.dumps(kwargs, sort_keys=True)
    hash_obj = hashlib.md5(params_str.encode())
    return f"{prefix}:{hash_obj.hexdigest()}"


def normalize_location(location: str) -> str:
    """Normalize location string for consistent caching"""
    return location.lower().strip()


def calculate_crop_score(
    temperature: float,
    humidity: float,
    ph: float,
    nitrogen: float,
    phosphorus: float,
    potassium: float
) -> float:
    """Calculate a simple crop suitability score"""
    # Simplified scoring logic
    temp_score = max(0, 100 - abs(temperature - 25) * 2)
    humidity_score = max(0, 100 - abs(humidity - 60) * 1.5)
    ph_score = max(0, 100 - abs(ph - 6.5) * 15)
    nutrient_score = min(100, (nitrogen + phosphorus + potassium) / 3)
    
    return (temp_score + humidity_score + ph_score + nutrient_score) / 4
