from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from contextlib import asynccontextmanager
import pandas as pd
import numpy as np
from pathlib import Path
import os

# Load crop dataset
DATASET_PATH = Path("data/crop_data.csv")
crop_df = None

# Placeholder for ML model
model = None
MODEL_PATH = Path("model.joblib")
try:
    if MODEL_PATH.exists():
        import joblib
        model = joblib.load(MODEL_PATH)
        print(f"Loaded ML model from {MODEL_PATH}")
    else:
        print("WARNING: No pre-trained ML model found, using rule-based logic")
except Exception as e:
    print(f"Error loading ML model: {e}")
    print("WARNING: Using rule-based fallback logic")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global crop_df
    try:
        # Check multiple possible paths
        possible_paths = [
            DATASET_PATH,
            Path("/app/data/crop_data.csv"),
            Path("../data/crop_data.csv")
        ]
        print(f"Current working directory: {os.getcwd()}")
        print(f"Looking for dataset in: {[str(p) for p in possible_paths]}")
        
        for path in possible_paths:
            if path.exists():
                crop_df = pd.read_csv(path)
                print(f"Loaded crop dataset from {path}: {len(crop_df)} records")
                print(f"Columns: {crop_df.columns.tolist()}")
                break
        else:
            print(f"WARNING: Dataset not found in any of the expected locations")
            print(f"Files in current directory: {os.listdir('.')}")
            if os.path.exists('data'):
                print(f"Files in data directory: {os.listdir('data')}")
    except Exception as e:
        print(f"Error loading dataset: {e}")
    
    yield
    
    # Shutdown
    print("Shutting down ML service")

app = FastAPI(title="FarmIQ ML Service", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Request/Response Models
class EnvironmentData(BaseModel):
    temperature: float
    humidity: float
    precipitation: float
    ph: float
    nitrogen: float
    clay: float
    sand: float
    organic_carbon: float

class CropInput(BaseModel):
    crop_name: str
    environment: EnvironmentData

class Recommendation(BaseModel):
    category: str
    priority: str  # high, medium, low
    message: str
    action: str

class CropAnalysisResponse(BaseModel):
    crop: str
    suitability_score: float
    recommendations: List[Recommendation]
    optimal_conditions: dict
    current_conditions: dict

@app.get("/")
async def root():
    return {
        "service": "FarmIQ ML Service",
        "status": "running",
        "dataset_loaded": crop_df is not None,
        "total_crops": len(crop_df) if crop_df is not None else 0
    }

@app.get("/crops")
async def get_crops():
    """Get list of available crops"""
    if crop_df is None:
        raise HTTPException(status_code=500, detail="Dataset not loaded")
    
    # The crop name column is 'Crop' in the new CSV
    crops = crop_df['Crop'].unique().tolist()
    return {"crops": crops}

@app.post("/analyze", response_model=CropAnalysisResponse)
async def analyze_crop(input_data: CropInput):
    """Analyze crop suitability and provide recommendations"""
    if crop_df is None:
        raise HTTPException(status_code=500, detail="Dataset not loaded")
    
    # Find crop in dataset (column is 'Crop' in new CSV)
    crop_data = crop_df[crop_df['Crop'].str.lower() == input_data.crop_name.lower()]
    
    if crop_data.empty:
        raise HTTPException(status_code=404, detail=f"Crop '{input_data.crop_name}' not found in dataset")
    
    # Get the first row (each crop has one row)
    crop_row = crop_data.iloc[0]
    
    # Extract optimal values from the new CSV structure, handling NaN values
    def safe_float(value, default=0):
        """Convert value to float, return default if NaN"""
        try:
            val = float(value)
            return default if pd.isna(val) or np.isnan(val) or np.isinf(val) else val
        except (ValueError, TypeError):
            return default
    
    crop_stats = {
        'temperature': safe_float(crop_row['Opt_Temp_C'], 25),
        'min_temp': safe_float(crop_row['Min_Temp_C'], 15),
        'max_temp': safe_float(crop_row['Max_Temp_C'], 35),
        'humidity': safe_float((crop_row['Min_Humidity_pct'] + crop_row['Max_Humidity_pct']) / 2, 60),
        'min_humidity': safe_float(crop_row['Min_Humidity_pct'], 40),
        'max_humidity': safe_float(crop_row['Max_Humidity_pct'], 80),
        'ph': safe_float((crop_row['Soil_pH_Min'] + crop_row['Soil_pH_Max']) / 2, 6.5),
        'min_ph': safe_float(crop_row['Soil_pH_Min'], 5.5),
        'max_ph': safe_float(crop_row['Soil_pH_Max'], 7.5),
        'rainfall': safe_float(crop_row['Opt_Rainfall_mm'], 800),
        'min_rainfall': safe_float(crop_row['Min_Rainfall_mm'], 400),
        'max_rainfall': safe_float(crop_row['Max_Rainfall_mm'], 1200),
        'sand_min': safe_float(crop_row['Sand_pct_Min'], 20),
        'sand_max': safe_float(crop_row['Sand_pct_Max'], 60),
        'clay_min': safe_float(crop_row['Clay_pct_Min'], 15),
        'clay_max': safe_float(crop_row['Clay_pct_Max'], 40),
        'organic_carbon_min': safe_float(crop_row['Organic_Carbon_Min_pct'], 0.5),
        'organic_carbon_max': safe_float(crop_row['Organic_Carbon_Max_pct'], 2.0),
        'texture_class': str(crop_row['Texture_Class']) if pd.notna(crop_row['Texture_Class']) else 'loam',
        'drainage': str(crop_row['Drainage_Requirement']) if pd.notna(crop_row['Drainage_Requirement']) else 'well-drained'
    }
    
    env = input_data.environment
    
    # If a trained model was loaded at startup, use it for prediction
    if model is not None:
        try:
            # prepare a feature dict matching training data expectations
            feature_dict = {
                'temperature': env.temperature,
                'humidity': env.humidity,
                'precipitation': env.precipitation,
                'ph': env.ph,
                'nitrogen': env.nitrogen,
                'sand': env.sand,
                'clay': env.clay,
                'organic_carbon': env.organic_carbon,
            }
            # note: model must accept a DataFrame or 2D array
            df = pd.DataFrame([feature_dict])
            pred = model.predict(df)
            # assume model returns a numeric suitability score
            score = float(pred[0])
            recommendations = []
            # optionally the model could output recommendation flags
            recommendations.append(Recommendation(
                category="ML Model",
                priority="low",
                message="Prediction provided by trained model",
                action="Refer to rule-based suggestions for additional guidance."
            ))
        except Exception as e:
            # fallback to rule-based if model fails
            print(f"Model inference error: {e}")
            score = calculate_suitability_score(crop_stats, env)
            recommendations = generate_recommendations(crop_stats, env, input_data.crop_name)
    else:
        # no model available, use deterministic logic
        score = calculate_suitability_score(crop_stats, env)
        recommendations = generate_recommendations(crop_stats, env, input_data.crop_name)
    
    # Ensure score is valid
    if pd.isna(score) or np.isnan(score) or np.isinf(score):
        score = 50.0  # Default moderate score
    
    # Prepare response
    return CropAnalysisResponse(
        crop=input_data.crop_name.title(),
        suitability_score=round(float(score), 2),
        recommendations=recommendations,
        optimal_conditions={
            "temperature": f"{crop_stats['temperature']:.1f}°C (range: {crop_stats['min_temp']:.0f}-{crop_stats['max_temp']:.0f}°C)",
            "humidity": f"{crop_stats['humidity']:.1f}% (range: {crop_stats['min_humidity']:.0f}-{crop_stats['max_humidity']:.0f}%)",
            "ph": f"{crop_stats['ph']:.1f} (range: {crop_stats['min_ph']:.1f}-{crop_stats['max_ph']:.1f})",
            "rainfall": f"{crop_stats['rainfall']:.0f}mm (range: {crop_stats['min_rainfall']:.0f}-{crop_stats['max_rainfall']:.0f}mm)",
            "soil_texture": crop_stats['texture_class'],
            "drainage": crop_stats['drainage']
        },
        current_conditions={
            "temperature": f"{env.temperature:.1f}°C",
            "humidity": f"{env.humidity:.1f}%",
            "ph": f"{env.ph:.1f}",
            "nitrogen": f"{env.nitrogen:.1f}g/kg",
            "precipitation": f"{env.precipitation:.1f}mm",
            "sand": f"{env.sand:.1f}%",
            "clay": f"{env.clay:.1f}%",
            "organic_carbon": f"{env.organic_carbon:.1f}%"
        }
    )

def calculate_suitability_score(crop_stats, env: EnvironmentData) -> float:
    """Calculate how suitable the current conditions are for the crop"""
    scores = []
    
    # Temperature score - check if within range
    if crop_stats['min_temp'] <= env.temperature <= crop_stats['max_temp']:
        # Within range, score based on distance from optimal
        temp_diff = abs(env.temperature - crop_stats['temperature'])
        temp_score = max(70, 100 - (temp_diff * 3))
    else:
        # Outside range, penalize based on how far outside
        if env.temperature < crop_stats['min_temp']:
            temp_diff = crop_stats['min_temp'] - env.temperature
        else:
            temp_diff = env.temperature - crop_stats['max_temp']
        temp_score = max(0, 50 - (temp_diff * 5))
    scores.append(temp_score)
    
    # Humidity score - check if within range
    if crop_stats['min_humidity'] <= env.humidity <= crop_stats['max_humidity']:
        hum_diff = abs(env.humidity - crop_stats['humidity'])
        hum_score = max(70, 100 - (hum_diff * 2))
    else:
        if env.humidity < crop_stats['min_humidity']:
            hum_diff = crop_stats['min_humidity'] - env.humidity
        else:
            hum_diff = env.humidity - crop_stats['max_humidity']
        hum_score = max(0, 50 - (hum_diff * 2))
    scores.append(hum_score)
    
    # pH score - check if within range
    if crop_stats['min_ph'] <= env.ph <= crop_stats['max_ph']:
        ph_diff = abs(env.ph - crop_stats['ph'])
        ph_score = max(70, 100 - (ph_diff * 10))
    else:
        if env.ph < crop_stats['min_ph']:
            ph_diff = crop_stats['min_ph'] - env.ph
        else:
            ph_diff = env.ph - crop_stats['max_ph']
        ph_score = max(0, 50 - (ph_diff * 20))
    scores.append(ph_score)
    
    # Sand percentage score
    if not pd.isna(crop_stats['sand_min']) and not pd.isna(crop_stats['sand_max']):
        if crop_stats['sand_min'] <= env.sand <= crop_stats['sand_max']:
            sand_score = 100
        else:
            if env.sand < crop_stats['sand_min']:
                sand_diff = crop_stats['sand_min'] - env.sand
            else:
                sand_diff = env.sand - crop_stats['sand_max']
            sand_score = max(0, 80 - (sand_diff * 2))
        scores.append(sand_score)
    
    # Clay percentage score
    if not pd.isna(crop_stats['clay_min']) and not pd.isna(crop_stats['clay_max']):
        if crop_stats['clay_min'] <= env.clay <= crop_stats['clay_max']:
            clay_score = 100
        else:
            if env.clay < crop_stats['clay_min']:
                clay_diff = crop_stats['clay_min'] - env.clay
            else:
                clay_diff = env.clay - crop_stats['clay_max']
            clay_score = max(0, 80 - (clay_diff * 2))
        scores.append(clay_score)
    
    # Organic carbon score
    if not pd.isna(crop_stats['organic_carbon_min']) and not pd.isna(crop_stats['organic_carbon_max']):
        if crop_stats['organic_carbon_min'] <= env.organic_carbon <= crop_stats['organic_carbon_max']:
            oc_score = 100
        else:
            if env.organic_carbon < crop_stats['organic_carbon_min']:
                oc_diff = crop_stats['organic_carbon_min'] - env.organic_carbon
            else:
                oc_diff = env.organic_carbon - crop_stats['organic_carbon_max']
            oc_score = max(0, 80 - (oc_diff * 20))
        scores.append(oc_score)
    
    return np.mean(scores)

def generate_recommendations(crop_stats, env: EnvironmentData, crop_name: str) -> List[Recommendation]:
    """Generate actionable recommendations based on conditions"""
    recommendations = []
    
    # Temperature recommendations
    if env.temperature < crop_stats['min_temp']:
        temp_diff = crop_stats['min_temp'] - env.temperature
        recommendations.append(Recommendation(
            category="Temperature",
            priority="high",
            message=f"Temperature is {temp_diff:.1f}°C below minimum ({crop_stats['min_temp']:.1f}°C)",
            action="Use mulching, row covers, or greenhouse to increase temperature. Consider delaying planting until warmer weather."
        ))
    elif env.temperature > crop_stats['max_temp']:
        temp_diff = env.temperature - crop_stats['max_temp']
        recommendations.append(Recommendation(
            category="Temperature",
            priority="high",
            message=f"Temperature is {temp_diff:.1f}°C above maximum ({crop_stats['max_temp']:.1f}°C)",
            action="Increase irrigation frequency, use shade nets, apply mulch to cool soil. Consider heat-tolerant varieties."
        ))
    elif abs(env.temperature - crop_stats['temperature']) > 3:
        recommendations.append(Recommendation(
            category="Temperature",
            priority="medium",
            message=f"Temperature is {'below' if env.temperature < crop_stats['temperature'] else 'above'} optimal ({crop_stats['temperature']:.1f}°C)",
            action="Monitor temperature closely. Adjust planting time if possible for better yields."
        ))
    
    # Humidity recommendations
    if env.humidity < crop_stats['min_humidity']:
        hum_diff = crop_stats['min_humidity'] - env.humidity
        recommendations.append(Recommendation(
            category="Humidity",
            priority="high",
            message=f"Humidity is {hum_diff:.1f}% below minimum ({crop_stats['min_humidity']:.1f}%)",
            action="Increase irrigation frequency, use drip irrigation, or install misting systems to raise humidity."
        ))
    elif env.humidity > crop_stats['max_humidity']:
        hum_diff = env.humidity - crop_stats['max_humidity']
        recommendations.append(Recommendation(
            category="Humidity",
            priority="high",
            message=f"Humidity is {hum_diff:.1f}% above maximum ({crop_stats['max_humidity']:.1f}%)",
            action="Improve air circulation, reduce irrigation, monitor for fungal diseases. Apply fungicides preventively."
        ))
    
    # pH recommendations
    if env.ph < crop_stats['min_ph']:
        ph_diff = crop_stats['min_ph'] - env.ph
        recommendations.append(Recommendation(
            category="Soil pH",
            priority="high",
            message=f"Soil is too acidic (pH {env.ph:.1f}, minimum: {crop_stats['min_ph']:.1f})",
            action=f"Apply agricultural lime at 2-4 tons/hectare. Retest soil after 3 months."
        ))
    elif env.ph > crop_stats['max_ph']:
        ph_diff = env.ph - crop_stats['max_ph']
        recommendations.append(Recommendation(
            category="Soil pH",
            priority="high",
            message=f"Soil is too alkaline (pH {env.ph:.1f}, maximum: {crop_stats['max_ph']:.1f})",
            action=f"Apply elemental sulfur or organic compost. Add acidifying fertilizers like ammonium sulfate."
        ))
    
    # Sand percentage recommendations
    if not pd.isna(crop_stats['sand_min']) and not pd.isna(crop_stats['sand_max']):
        if env.sand < crop_stats['sand_min']:
            recommendations.append(Recommendation(
                category="Soil Texture - Sand",
                priority="medium",
                message=f"Sand content ({env.sand}%) is below optimal range ({crop_stats['sand_min']}-{crop_stats['sand_max']}%)",
                action="Add coarse sand to improve drainage and aeration. Consider raised beds."
            ))
        elif env.sand > crop_stats['sand_max']:
            recommendations.append(Recommendation(
                category="Soil Texture - Sand",
                priority="medium",
                message=f"Sand content ({env.sand}%) is above optimal range ({crop_stats['sand_min']}-{crop_stats['sand_max']}%)",
                action="Add organic matter and clay to improve water retention. Use mulching to reduce water loss."
            ))
    
    # Clay percentage recommendations
    if not pd.isna(crop_stats['clay_min']) and not pd.isna(crop_stats['clay_max']):
        if env.clay < crop_stats['clay_min']:
            recommendations.append(Recommendation(
                category="Soil Texture - Clay",
                priority="medium",
                message=f"Clay content ({env.clay}%) is below optimal range ({crop_stats['clay_min']}-{crop_stats['clay_max']}%)",
                action="Add clay or bentonite to improve nutrient retention. Incorporate compost for better structure."
            ))
        elif env.clay > crop_stats['clay_max']:
            recommendations.append(Recommendation(
                category="Soil Texture - Clay",
                priority="medium",
                message=f"Clay content ({env.clay}%) is above optimal range ({crop_stats['clay_min']}-{crop_stats['clay_max']}%)",
                action="Add sand and organic matter to improve drainage. Consider raised beds or ridge planting."
            ))
    
    # Organic carbon recommendations
    if not pd.isna(crop_stats['organic_carbon_min']) and not pd.isna(crop_stats['organic_carbon_max']):
        if env.organic_carbon < crop_stats['organic_carbon_min']:
            recommendations.append(Recommendation(
                category="Organic Carbon",
                priority="high",
                message=f"Organic carbon ({env.organic_carbon}%) is below minimum ({crop_stats['organic_carbon_min']}%)",
                action="Add compost, farmyard manure, or green manure. Apply 10-15 tons/hectare of well-decomposed organic matter."
            ))
        elif env.organic_carbon > crop_stats['organic_carbon_max']:
            recommendations.append(Recommendation(
                category="Organic Carbon",
                priority="low",
                message=f"Organic carbon ({env.organic_carbon}%) is above maximum ({crop_stats['organic_carbon_max']}%)",
                action="Excellent organic matter content. Maintain current practices."
            ))
    
    # Nitrogen recommendations based on input
    if env.nitrogen < 2:
        recommendations.append(Recommendation(
            category="Nitrogen (N)",
            priority="high",
            message=f"Nitrogen content is low ({env.nitrogen}g/kg)",
            action="Apply nitrogen fertilizers: Urea, Ammonium Sulfate, or organic sources like compost. Split application recommended."
        ))
    
    # Soil texture class recommendation
    recommendations.append(Recommendation(
        category="Soil Texture",
        priority="low",
        message=f"Ideal soil texture for {crop_name}: {crop_stats['texture_class']}",
        action=f"Ensure soil matches this texture class for optimal growth."
    ))
    
    # Drainage recommendation
    recommendations.append(Recommendation(
        category="Drainage",
        priority="medium",
        message=f"Drainage requirement: {crop_stats['drainage']}",
        action="Ensure proper drainage system matches crop requirements to prevent waterlogging or drought stress."
    ))
    
    # If everything is good
    if len([r for r in recommendations if r.priority == "high"]) == 0:
        recommendations.insert(0, Recommendation(
            category="General",
            priority="low",
            message=f"Conditions are favorable for {crop_name}!",
            action="Continue current management practices. Monitor regularly and maintain soil health."
        ))
    
    return recommendations

@app.get("/health")
async def health_check():
    return {"status": "healthy", "dataset_loaded": crop_df is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
