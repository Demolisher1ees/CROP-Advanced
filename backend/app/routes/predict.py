from fastapi import APIRouter, HTTPException
from app.schemas.crop_request import CropPredictionRequest
from app.core.utils import calculate_crop_score

router = APIRouter()


@router.post("/crop")
async def predict_crop(request: CropPredictionRequest):
    """Predict suitable crops based on environmental and soil parameters"""
    
    # Calculate scores for different crops (simplified logic)
    crops = [
        {
            "name": "Rice",
            "score": calculate_crop_score(
                request.temperature, request.humidity, request.ph,
                request.nitrogen, request.phosphorus, request.potassium
            ),
            "season": "Kharif",
            "duration": "120-150 days"
        },
        {
            "name": "Wheat",
            "score": calculate_crop_score(
                request.temperature - 5, request.humidity - 10, request.ph,
                request.nitrogen, request.phosphorus, request.potassium
            ),
            "season": "Rabi",
            "duration": "110-130 days"
        },
        {
            "name": "Cotton",
            "score": calculate_crop_score(
                request.temperature + 2, request.humidity, request.ph,
                request.nitrogen, request.phosphorus, request.potassium
            ),
            "season": "Kharif",
            "duration": "150-180 days"
        },
        {
            "name": "Sugarcane",
            "score": calculate_crop_score(
                request.temperature + 3, request.humidity + 5, request.ph,
                request.nitrogen, request.phosphorus, request.potassium
            ),
            "season": "Year-round",
            "duration": "12-18 months"
        }
    ]
    
    # Sort by score
    crops.sort(key=lambda x: x["score"], reverse=True)
    
    return {
        "recommendations": crops[:3],
        "input_parameters": request.dict(),
        "confidence": "High" if crops[0]["score"] > 70 else "Medium"
    }
