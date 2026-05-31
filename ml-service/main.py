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
    possible_model_paths = [
        MODEL_PATH,
        Path("../backend/app/models/crop_model.joblib"),
        Path("crop_model.joblib")
    ]
    for path in possible_model_paths:
        if path.exists():
            import joblib
            model = joblib.load(path)
            print(f"Loaded ML model from {path}")
            break
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
    latitude: Optional[float] = None
    longitude: Optional[float] = None

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

import re

def get_regional_climate_defaults(latitude: Optional[float], longitude: Optional[float]):
    if latitude is None or longitude is None:
        return 1000.0, 65.0
    
    # Distance helper
    def distance(lat1, lon1, lat2, lon2):
        return ((lat1 - lat2)**2 + (lon1 - lon2)**2)**0.5
        
    # Standard agricultural regions in India
    regions = [
        {"name": "Kolkata/West Bengal", "lat": 22.57, "lon": 88.36, "rainfall": 1600.0, "humidity": 75.0},
        {"name": "Sikkim", "lat": 27.33, "lon": 88.61, "rainfall": 2500.0, "humidity": 80.0},
        {"name": "Uttar Pradesh", "lat": 26.85, "lon": 80.94, "rainfall": 950.0, "humidity": 60.0},
        {"name": "Kashmir", "lat": 34.08, "lon": 74.80, "rainfall": 750.0, "humidity": 55.0}
    ]
    
    # Find closest region if within 3.5 degrees
    closest_region = min(regions, key=lambda r: distance(latitude, longitude, r["lat"], r["lon"]))
    if distance(latitude, longitude, closest_region["lat"], closest_region["lon"]) < 3.5:
        return closest_region["rainfall"], closest_region["humidity"]
        
    # General latitude-based heuristic
    if latitude > 30.0:
        return 750.0, 55.0
    elif latitude > 20.0 and longitude > 85.0:
        return 1600.0, 75.0
    else:
        return 900.0, 60.0

def parse_nutrient(val_str, default=50.0):
    if pd.isna(val_str) or not isinstance(val_str, str):
        try:
            val = float(val_str)
            return default if pd.isna(val) or np.isnan(val) else val
        except (ValueError, TypeError):
            return default
            
    nums = [float(x) for x in re.findall(r'\d+\.?\d*', val_str)]
    if len(nums) == 2:
        return sum(nums) / 2.0
    elif len(nums) == 1:
        return nums[0]
    return default

def calculate_membership(val, min_val, opt_val, max_val):
    if pd.isna(min_val) or pd.isna(max_val) or pd.isna(opt_val):
        return 1.0
    if val < min_val or val > max_val:
        return 0.0
    if val < opt_val:
        if opt_val == min_val:
            return 1.0
        return (val - min_val) / (opt_val - min_val)
    else:
        if max_val == opt_val:
            return 1.0
        return (max_val - val) / (max_val - opt_val)

def calculate_membership_trapezoidal(val, min_val, max_val, tolerance_fraction=0.25):
    if pd.isna(min_val) or pd.isna(max_val):
        return 1.0
    if val < min_val or val > max_val:
        return 0.0
    
    range_width = max_val - min_val
    if range_width <= 0:
        return 1.0
        
    opt_min = min_val + range_width * tolerance_fraction
    opt_max = max_val - range_width * tolerance_fraction
    
    if opt_min > opt_max:
        opt_min = opt_max = (min_val + max_val) / 2.0
        
    if val < opt_min:
        return (val - min_val) / (opt_min - min_val)
    elif val > opt_max:
        return (max_val - val) / (max_val - opt_max)
    else:
        return 1.0

def calculate_suitability_score(crop_stats, env: EnvironmentData) -> float:
    est_rainfall, est_humidity = get_regional_climate_defaults(env.latitude, env.longitude)
    eff_humidity = (env.humidity + est_humidity) / 2.0
    
    temp_mult = calculate_membership(env.temperature, crop_stats['min_temp'], crop_stats['temperature'], crop_stats['max_temp'])
    hum_mult = calculate_membership_trapezoidal(eff_humidity, crop_stats['min_humidity'], crop_stats['max_humidity'])
    rain_mult = calculate_membership_trapezoidal(est_rainfall, crop_stats['min_rainfall'], crop_stats['max_rainfall'])
    ph_mult = calculate_membership_trapezoidal(env.ph, crop_stats['min_ph'], crop_stats['max_ph'])
    
    # Zero-kill rule: crop cannot survive/grow if critical conditions are totally off
    if temp_mult == 0.0 or hum_mult == 0.0 or rain_mult == 0.0 or ph_mult == 0.0:
        return 0.0
        
    sand_mult = 1.0
    if not pd.isna(crop_stats['sand_min']) and not pd.isna(crop_stats['sand_max']):
        sand_mult = calculate_membership_trapezoidal(env.sand, crop_stats['sand_min'], crop_stats['sand_max'])
        sand_mult = max(0.5, sand_mult)
        
    clay_mult = 1.0
    if not pd.isna(crop_stats['clay_min']) and not pd.isna(crop_stats['clay_max']):
        clay_mult = calculate_membership_trapezoidal(env.clay, crop_stats['clay_min'], crop_stats['clay_max'])
        clay_mult = max(0.5, clay_mult)
        
    oc_mult = 1.0
    if not pd.isna(crop_stats['organic_carbon_min']) and not pd.isna(crop_stats['organic_carbon_max']):
        oc_mult = calculate_membership_trapezoidal(env.organic_carbon, crop_stats['organic_carbon_min'], crop_stats['organic_carbon_max'])
        oc_mult = max(0.5, oc_mult)
        
    climate_score = 0.4 * temp_mult + 0.3 * hum_mult + 0.3 * rain_mult
    soil_score = ph_mult * (0.4 + 0.2 * sand_mult + 0.2 * clay_mult + 0.2 * oc_mult)
    
    final_rule_score = 100.0 * (0.7 * climate_score + 0.3 * soil_score)
    return max(0.0, min(100.0, final_rule_score))

def generate_recommendations(crop_stats, env: EnvironmentData, crop_name: str) -> List[Recommendation]:
    """Generate actionable recommendations based on conditions"""
    recommendations = []
    
    # Resolve regional defaults for warnings
    est_rainfall, est_humidity = get_regional_climate_defaults(env.latitude, env.longitude)
    eff_humidity = (env.humidity + est_humidity) / 2.0
    
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
    if eff_humidity < crop_stats['min_humidity']:
        hum_diff = crop_stats['min_humidity'] - eff_humidity
        recommendations.append(Recommendation(
            category="Humidity",
            priority="high",
            message=f"Humidity is {hum_diff:.1f}% below minimum ({crop_stats['min_humidity']:.1f}%)",
            action="Increase irrigation frequency, use drip irrigation, or install misting systems to raise humidity."
        ))
    elif eff_humidity > crop_stats['max_humidity']:
        hum_diff = eff_humidity - crop_stats['max_humidity']
        recommendations.append(Recommendation(
            category="Humidity",
            priority="high",
            message=f"Humidity is {hum_diff:.1f}% above maximum ({crop_stats['max_humidity']:.1f}%)",
            action="Improve air circulation, reduce irrigation, monitor for fungal diseases. Apply fungicides preventively."
        ))
        
    # Rainfall recommendations
    if est_rainfall < crop_stats['min_rainfall']:
        rain_diff = crop_stats['min_rainfall'] - est_rainfall
        recommendations.append(Recommendation(
            category="Rainfall",
            priority="high",
            message=f"Estimated regional rainfall ({est_rainfall:.0f}mm) is below minimum ({crop_stats['min_rainfall']:.0f}mm)",
            action="Implement supplementary irrigation, rainwater harvesting, or drip systems. Select drought-tolerant varieties."
        ))
    elif est_rainfall > crop_stats['max_rainfall']:
        rain_diff = est_rainfall - crop_stats['max_rainfall']
        recommendations.append(Recommendation(
            category="Rainfall",
            priority="high",
            message=f"Estimated regional rainfall ({est_rainfall:.0f}mm) is above maximum ({crop_stats['max_rainfall']:.0f}mm)",
            action="Ensure excellent field drainage. Build raised beds or plant on ridges to prevent waterlogging."
        ))
    
    # pH recommendations
    if env.ph < crop_stats['min_ph']:
        recommendations.append(Recommendation(
            category="Soil pH",
            priority="high",
            message=f"Soil is too acidic (pH {env.ph:.1f}, minimum: {crop_stats['min_ph']:.1f})",
            action="Apply agricultural lime at 2-4 tons/hectare. Retest soil after 3 months."
        ))
    elif env.ph > crop_stats['max_ph']:
        recommendations.append(Recommendation(
            category="Soil pH",
            priority="high",
            message=f"Soil is too alkaline (pH {env.ph:.1f}, maximum: {crop_stats['max_ph']:.1f})",
            action="Apply elemental sulfur or organic compost. Add acidifying fertilizers like ammonium sulfate."
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
    if env.nitrogen < 2.0:
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
        action="Ensure soil matches this texture class for optimal growth."
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
    
    # Calculate rule-based suitability score
    rule_score = calculate_suitability_score(crop_stats, env)
    
    # If a trained model was loaded at startup, use it to refine the score
    score = rule_score
    if model is not None and rule_score > 0.0:
        try:
            # Fetch regional climate defaults to smooth out inputs for ML model
            est_rainfall, est_humidity = get_regional_climate_defaults(env.latitude, env.longitude)
            eff_humidity = (env.humidity + est_humidity) / 2.0
            
            # Construct feature dict in exact order matching the model training
            feature_dict = {
                # Place parameters
                'env_temp': env.temperature,
                'env_hum': eff_humidity,
                'env_ph': env.ph,
                'env_rain': est_rainfall,
                'env_n': env.nitrogen,
                'env_sand': env.sand,
                'env_clay': env.clay,
                'env_oc': env.organic_carbon,
                # Crop parameters
                'crop_min_temp': crop_stats['min_temp'],
                'crop_opt_temp': crop_stats['temperature'],
                'crop_max_temp': crop_stats['max_temp'],
                'crop_min_rain': crop_stats['min_rainfall'],
                'crop_opt_rain': crop_stats['rainfall'],
                'crop_max_rain': crop_stats['max_rainfall'],
                'crop_min_hum': crop_stats['min_humidity'],
                'crop_max_hum': crop_stats['max_humidity'],
                'crop_min_ph': crop_stats['min_ph'],
                'crop_max_ph': crop_stats['max_ph'],
                'crop_sand_min': crop_stats['sand_min'] if not pd.isna(crop_stats['sand_min']) else 0.0,
                'crop_sand_max': crop_stats['sand_max'] if not pd.isna(crop_stats['sand_max']) else 0.0,
                'crop_clay_min': crop_stats['clay_min'] if not pd.isna(crop_stats['clay_min']) else 0.0,
                'crop_clay_max': crop_stats['clay_max'] if not pd.isna(crop_stats['clay_max']) else 0.0,
                'crop_oc_min': crop_stats['organic_carbon_min'] if not pd.isna(crop_stats['organic_carbon_min']) else 0.0,
                'crop_oc_max': crop_stats['organic_carbon_max'] if not pd.isna(crop_stats['organic_carbon_max']) else 0.0,
            }
            
            df = pd.DataFrame([feature_dict])
            feature_cols = [
                'env_temp', 'env_hum', 'env_ph', 'env_rain', 'env_n', 'env_sand', 'env_clay', 'env_oc',
                'crop_min_temp', 'crop_opt_temp', 'crop_max_temp',
                'crop_min_rain', 'crop_opt_rain', 'crop_max_rain',
                'crop_min_hum', 'crop_max_hum',
                'crop_min_ph', 'crop_max_ph',
                'crop_sand_min', 'crop_sand_max',
                'crop_clay_min', 'crop_clay_max',
                'crop_oc_min', 'crop_oc_max'
            ]
            df = df[feature_cols]
            
            # Predict suitability score using the regressor model
            model_score = float(model.predict(df)[0])
            
            # Average rule-based and ML model prediction
            score = (rule_score + model_score) / 2.0
        except Exception as e:
            # fallback to rule-based if model prediction fails
            print(f"Regressor inference error: {e}")
            score = rule_score

    # Generate recommendations
    recommendations = generate_recommendations(crop_stats, env, input_data.crop_name)
    
    # Ensure score is valid
    if pd.isna(score) or np.isnan(score) or np.isinf(score):
        score = 0.0
    
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

@app.get("/health")
async def health_check():
    return {"status": "healthy", "dataset_loaded": crop_df is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
