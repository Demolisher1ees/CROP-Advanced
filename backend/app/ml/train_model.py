import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os
import re
from pathlib import Path

def parse_nutrient_range(val_str, default_min=20.0, default_max=80.0):
    if pd.isna(val_str) or not isinstance(val_str, str):
        try:
            val = float(val_str)
            return (val, val) if not pd.isna(val) else (default_min, default_max)
        except:
            return default_min, default_max
    nums = [float(x) for x in re.findall(r'\d+\.?\d*', val_str)]
    if len(nums) == 2:
        return nums[0], nums[1]
    elif len(nums) == 1:
        return nums[0]*0.8, nums[0]*1.2
    return default_min, default_max

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

def calculate_suitability_score_raw(crop_stats, temp, hum, ph, rain, sand, clay, oc):
    temp_mult = calculate_membership(temp, crop_stats['min_temp'], crop_stats['temperature'], crop_stats['max_temp'])
    hum_mult = calculate_membership_trapezoidal(hum, crop_stats['min_humidity'], crop_stats['max_humidity'])
    rain_mult = calculate_membership_trapezoidal(rain, crop_stats['min_rainfall'], crop_stats['max_rainfall'])
    ph_mult = calculate_membership_trapezoidal(ph, crop_stats['min_ph'], crop_stats['max_ph'])
    
    if temp_mult == 0.0 or hum_mult == 0.0 or rain_mult == 0.0 or ph_mult == 0.0:
        return 0.0
        
    sand_mult = 1.0
    if not pd.isna(crop_stats['sand_min']) and not pd.isna(crop_stats['sand_max']):
        sand_mult = calculate_membership_trapezoidal(sand, crop_stats['sand_min'], crop_stats['sand_max'])
        sand_mult = max(0.5, sand_mult)
        
    clay_mult = 1.0
    if not pd.isna(crop_stats['clay_min']) and not pd.isna(crop_stats['clay_max']):
        clay_mult = calculate_membership_trapezoidal(clay, crop_stats['clay_min'], crop_stats['clay_max'])
        clay_mult = max(0.5, clay_mult)
        
    oc_mult = 1.0
    if not pd.isna(crop_stats['organic_carbon_min']) and not pd.isna(crop_stats['organic_carbon_max']):
        oc_mult = calculate_membership_trapezoidal(oc, crop_stats['organic_carbon_min'], crop_stats['organic_carbon_max'])
        oc_mult = max(0.5, oc_mult)
        
    climate_score = 0.4 * temp_mult + 0.3 * hum_mult + 0.3 * rain_mult
    soil_score = ph_mult * (0.4 + 0.2 * sand_mult + 0.2 * clay_mult + 0.2 * oc_mult)
    
    final_score = 100.0 * (0.7 * climate_score + 0.3 * soil_score)
    return max(0.0, min(100.0, final_score))

def train_crop_model():
    """Train a crop suitability RandomForestRegressor model"""
    csv_path = Path(__file__).parent.parent.parent.parent / "ml-service" / "data" / "crop_data.csv"
    
    if not csv_path.exists():
        print(f"Error: crop_data.csv not found at {csv_path}")
        return None, 0.0
        
    print(f"Loading biological parameters from {csv_path}...")
    crop_df = pd.read_csv(csv_path)
    
    samples = []
    np.random.seed(42)
    
    def safe_float(value, default=0):
        try:
            val = float(value)
            return default if pd.isna(val) or np.isnan(val) or np.isinf(val) else val
        except (ValueError, TypeError):
            return default

    print("Generating synthetic comparison samples...")
    for _, row in crop_df.iterrows():
        crop_stats = {
            'temperature': safe_float(row['Opt_Temp_C'], 25),
            'min_temp': safe_float(row['Min_Temp_C'], 15),
            'max_temp': safe_float(row['Max_Temp_C'], 35),
            'humidity': safe_float((row['Min_Humidity_pct'] + row['Max_Humidity_pct']) / 2, 60),
            'min_humidity': safe_float(row['Min_Humidity_pct'], 40),
            'max_humidity': safe_float(row['Max_Humidity_pct'], 80),
            'ph': safe_float((row['Soil_pH_Min'] + row['Soil_pH_Max']) / 2, 6.5),
            'min_ph': safe_float(row['Soil_pH_Min'], 5.5),
            'max_ph': safe_float(row['Soil_pH_Max'], 7.5),
            'rainfall': safe_float(row['Opt_Rainfall_mm'], 800),
            'min_rainfall': safe_float(row['Min_Rainfall_mm'], 400),
            'max_rainfall': safe_float(row['Max_Rainfall_mm'], 1200),
            'sand_min': safe_float(row['Sand_pct_Min'], 20),
            'sand_max': safe_float(row['Sand_pct_Max'], 60),
            'clay_min': safe_float(row['Clay_pct_Min'], 15),
            'clay_max': safe_float(row['Clay_pct_Max'], 40),
            'organic_carbon_min': safe_float(row['Organic_Carbon_Min_pct'], 0.5),
            'organic_carbon_max': safe_float(row['Organic_Carbon_Max_pct'], 2.0)
        }
        
        # Generate 400 suitable samples
        for _ in range(400):
            temp = np.random.uniform(crop_stats['min_temp'], crop_stats['max_temp'])
            hum = np.random.uniform(crop_stats['min_humidity'], crop_stats['max_humidity'])
            ph = np.random.uniform(crop_stats['min_ph'], crop_stats['max_ph'])
            rain = np.random.uniform(crop_stats['min_rainfall'], crop_stats['max_rainfall'])
            sand = np.random.uniform(crop_stats['sand_min'] or 30.0, crop_stats['sand_max'] or 50.0)
            clay = np.random.uniform(crop_stats['clay_min'] or 20.0, crop_stats['clay_max'] or 35.0)
            oc = np.random.uniform(crop_stats['organic_carbon_min'] or 0.5, crop_stats['organic_carbon_max'] or 1.5)
            n = np.random.uniform(20.0, 80.0)
            
            score = calculate_suitability_score_raw(crop_stats, temp, hum, ph, rain, sand, clay, oc)
            
            samples.append({
                # Place parameters
                'env_temp': temp, 'env_hum': hum, 'env_ph': ph, 'env_rain': rain, 'env_n': n, 'env_sand': sand, 'env_clay': clay, 'env_oc': oc,
                # Crop parameters
                'crop_min_temp': crop_stats['min_temp'], 'crop_opt_temp': crop_stats['temperature'], 'crop_max_temp': crop_stats['max_temp'],
                'crop_min_rain': crop_stats['min_rainfall'], 'crop_opt_rain': crop_stats['rainfall'], 'crop_max_rain': crop_stats['max_rainfall'],
                'crop_min_hum': crop_stats['min_humidity'], 'crop_max_hum': crop_stats['max_humidity'],
                'crop_min_ph': crop_stats['min_ph'], 'crop_max_ph': crop_stats['max_ph'],
                'crop_sand_min': crop_stats['sand_min'], 'crop_sand_max': crop_stats['sand_max'],
                'crop_clay_min': crop_stats['clay_min'], 'crop_clay_max': crop_stats['clay_max'],
                'crop_oc_min': crop_stats['organic_carbon_min'], 'crop_oc_max': crop_stats['organic_carbon_max'],
                # Target
                'suitability_score': score
            })
            
        # Generate 400 unsuitable samples (violating one or more thresholds)
        for _ in range(400):
            # Introduce temperature, pH, humidity, or rain out of bounds with 25% probability each
            temp = np.random.uniform(crop_stats['min_temp'], crop_stats['max_temp'])
            if np.random.rand() < 0.25:
                temp = crop_stats['min_temp'] - np.random.uniform(1.0, 10.0) if np.random.rand() < 0.5 else crop_stats['max_temp'] + np.random.uniform(1.0, 10.0)
                
            hum = np.random.uniform(crop_stats['min_humidity'], crop_stats['max_humidity'])
            if np.random.rand() < 0.25:
                hum = crop_stats['min_humidity'] - np.random.uniform(5.0, 30.0) if np.random.rand() < 0.5 else crop_stats['max_humidity'] + np.random.uniform(5.0, 30.0)
                
            ph = np.random.uniform(crop_stats['min_ph'], crop_stats['max_ph'])
            if np.random.rand() < 0.25:
                ph = crop_stats['min_ph'] - np.random.uniform(0.5, 3.0) if np.random.rand() < 0.5 else crop_stats['max_ph'] + np.random.uniform(0.5, 3.0)
                
            rain = np.random.uniform(crop_stats['min_rainfall'], crop_stats['max_rainfall'])
            if np.random.rand() < 0.25:
                rain = crop_stats['min_rainfall'] - np.random.uniform(50.0, 300.0) if np.random.rand() < 0.5 else crop_stats['max_rainfall'] + np.random.uniform(50.0, 300.0)
                
            sand = np.random.uniform(crop_stats['sand_min'] or 10.0, crop_stats['sand_max'] or 90.0)
            clay = np.random.uniform(crop_stats['clay_min'] or 10.0, crop_stats['clay_max'] or 90.0)
            oc = np.random.uniform(crop_stats['organic_carbon_min'] or 0.1, crop_stats['organic_carbon_max'] or 4.0)
            n = np.random.uniform(20.0, 80.0)
            
            score = calculate_suitability_score_raw(crop_stats, temp, hum, ph, rain, sand, clay, oc)
            
            samples.append({
                # Place parameters
                'env_temp': temp, 'env_hum': hum, 'env_ph': ph, 'env_rain': rain, 'env_n': n, 'env_sand': sand, 'env_clay': clay, 'env_oc': oc,
                # Crop parameters
                'crop_min_temp': crop_stats['min_temp'], 'crop_opt_temp': crop_stats['temperature'], 'crop_max_temp': crop_stats['max_temp'],
                'crop_min_rain': crop_stats['min_rainfall'], 'crop_opt_rain': crop_stats['rainfall'], 'crop_max_rain': crop_stats['max_rainfall'],
                'crop_min_hum': crop_stats['min_humidity'], 'crop_max_hum': crop_stats['max_humidity'],
                'crop_min_ph': crop_stats['min_ph'], 'crop_max_ph': crop_stats['max_ph'],
                'crop_sand_min': crop_stats['sand_min'], 'crop_sand_max': crop_stats['sand_max'],
                'crop_clay_min': crop_stats['clay_min'], 'crop_clay_max': crop_stats['clay_max'],
                'crop_oc_min': crop_stats['organic_carbon_min'], 'crop_oc_max': crop_stats['organic_carbon_max'],
                # Target
                'suitability_score': score
            })

    df = pd.DataFrame(samples)
    print(f"Generated {len(df)} samples.")
    
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
    
    # Fill any NaNs in crop parameters
    df[feature_cols] = df[feature_cols].fillna(0.0)
    
    X = df[feature_cols]
    y = df['suitability_score']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training RandomForestRegressor...")
    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    print(f"Model Mean Absolute Error: {mae:.4f}")
    print(f"Model R2 Score: {r2:.4f}")
    
    # Save model
    model_dir = Path(__file__).parent.parent / 'models'
    model_dir.mkdir(exist_ok=True)
    model_path = model_dir / 'crop_model.joblib'
    joblib.dump(model, model_path)
    print(f"Regressor model saved to {model_path}")
    
    return model, mae

if __name__ == "__main__":
    train_crop_model()
