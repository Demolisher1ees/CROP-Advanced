import os
import joblib
import pandas as pd
from fastapi import APIRouter, HTTPException
from app.schemas.crop_request import CropPredictionRequest

router = APIRouter()

# Load the model once when the module is imported
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "crop_model.joblib")
try:
    crop_model = joblib.load(MODEL_PATH)
except Exception as e:
    crop_model = None
    print(f"Failed to load crop model: {e}")

def get_season_for_crop(crop_name: str) -> str:
    mapping = {
        "Rice": "Kharif",
        "Wheat": "Rabi",
        "Cotton": "Kharif",
        "Sugarcane": "Year-round"
    }
    return mapping.get(crop_name, "Varies")

def get_duration_for_crop(crop_name: str) -> str:
    mapping = {
        "Rice": "120-150 days",
        "Wheat": "110-130 days",
        "Cotton": "150-180 days",
        "Sugarcane": "12-18 months"
    }
    return mapping.get(crop_name, "Varies")

@router.post("/crop")
async def predict_crop(request: CropPredictionRequest):
    """Predict suitable crops based on environmental and soil parameters using trained ML model"""
    if crop_model is None:
        raise HTTPException(status_code=500, detail="Crop prediction model is currently unavailable. Please run the training script.")
        
    # Prepare input for the model
    # The model expects: temperature, humidity, ph, rainfall, nitrogen, phosphorus, potassium
    # (Matches training data order in train_model.py)
    rainfall_val = request.rainfall if request.rainfall is not None else 100.0
    input_data = pd.DataFrame([{
        'temperature': request.temperature,
        'humidity': request.humidity,
        'ph': request.ph,
        'rainfall': rainfall_val,
        'nitrogen': request.nitrogen,
        'phosphorus': request.phosphorus,
        'potassium': request.potassium
    }])
    
    try:
        # Predict probabilities for all classes
        probs = crop_model.predict_proba(input_data)[0]
        classes = crop_model.classes_
        
        # Create a list of recommendations with confidence scores
        recommendations = []
        for i, crop_class in enumerate(classes):
            score = round(probs[i] * 100, 2)
            if score > 0:
                recommendations.append({
                    "name": crop_class,
                    "score": score,
                    "season": get_season_for_crop(crop_class),
                    "duration": get_duration_for_crop(crop_class)
                })
                
        # Sort by score descending
        recommendations.sort(key=lambda x: x["score"], reverse=True)
        
        return {
            "recommendations": recommendations[:3], # Top 3
            "input_parameters": request.model_dump(),
            "confidence": "High" if recommendations and recommendations[0]["score"] > 70 else "Medium"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
