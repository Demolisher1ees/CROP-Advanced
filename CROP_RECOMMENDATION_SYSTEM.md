# 🌾 FarmIQ - AI-Powered Crop Intelligence System

## Complete Implementation Guide

### 📦 What I've Built For You

A complete Docker-based crop recommendation system that:
1. ✅ Collects location, weather, and soil data from user
2. ✅ Compares against your CSV crop dataset
3. ✅ Calculates suitability scores
4. ✅ Provides actionable recommendations
5. ✅ Suggests improvements for better yield

---

## 🏗️ System Components

### 1. ML Service (Port 8001)
- **Technology**: Python FastAPI
- **Purpose**: Crop analysis and recommendations
- **Input**: Crop name + environmental data
- **Output**: Suitability score + recommendations

### 2. Frontend (Port 3001)
- **Technology**: Next.js + React
- **Purpose**: User interface
- **Features**: Location detection, data collection, results display

### 3. Backend (Port 8000)
- **Technology**: FastAPI
- **Purpose**: API gateway and data management

### 4. Dataset
- **Format**: CSV file
- **Location**: `data/crop_data.csv`
- **Contains**: 26 Indian crops with comprehensive growing conditions
- **Columns**: Temperature ranges, rainfall, humidity, pH, soil texture (sand/clay/silt %), organic carbon, NPK requirements, drainage needs

---

## 🚀 Quick Start (3 Steps)

### Step 1: Prepare Your Dataset

```bash
# Your CSV is already created at:
farmiq/data/crop_data.csv

# Or replace with your own dataset
cp /path/to/your/crop_data.csv farmiq/data/
```

### Step 2: Start Docker Services

```bash
cd farmiq

# Start all services
docker-compose up --build

# Wait for:
# ✅ ML Service ready on http://localhost:8001
# ✅ Frontend ready on http://localhost:3001
```

### Step 3: Use the System

1. Open http://localhost:3001
2. Click "Detect Location"
3. Select a crop from dropdown
4. Click "Get Recommendations"
5. View suitability score and recommendations!

---

## 📊 How It Works

### Data Collection

```
User Action: Click "Detect Location"
    ↓
GPS Coordinates: 19.0760, 72.8777
    ↓
Weather API: Temperature, Humidity, Precipitation
    ↓
Soil API: pH, Nitrogen, Clay, Sand
    ↓
User Selects: "Rice"
    ↓
Click: "Get Recommendations"
```

### Analysis Process

```python
# 1. Load crop requirements from CSV
crop_data = {
    'min_temp': 18, 'opt_temp': 27, 'max_temp': 35,
    'min_humidity': 70, 'max_humidity': 90,
    'min_ph': 5, 'max_ph': 7.5,
    'sand_min': 20, 'sand_max': 40,
    'clay_min': 30, 'clay_max': 50,
    'organic_carbon_min': 1, 'organic_carbon_max': 2.5,
    'texture_class': 'clay loam to silty clay',
    'drainage': 'poor to imperfect drainage; puddled'
}

# 2. Compare with current conditions
current = {
    'temperature': 28.5,  # ✅ Within range (18-35°C)
    'humidity': 75,       # ✅ Within range (70-90%)
    'ph': 6.2,           # ✅ Within range (5-7.5)
    'sand': 25,          # ✅ Within range (20-40%)
    'clay': 35,          # ✅ Within range (30-50%)
    'organic_carbon': 1.5 # ✅ Within range (1-2.5%)
}

# 3. Calculate suitability score
score = (temp_score + humidity_score + ph_score + sand_score + clay_score + oc_score) / 6
# Result: 92.3% suitable

# 4. Generate recommendations
recommendations = [
    "Conditions are favorable for Rice (Paddy)!",
    "Ensure proper drainage system matches crop requirements",
    "Ideal soil texture: clay loam to silty clay"
]
```

### Output Example

```json
{
  "crop": "Rice",
  "suitability_score": 85.5,
  "recommendations": [
    {
      "category": "Nutrients",
      "priority": "high",
      "message": "Nitrogen levels are below crop requirements",
      "action": "Apply nitrogen fertilizer. Recommended: 120kg/ha"
    },
    {
      "category": "Temperature",
      "priority": "low",
      "message": "Temperature is optimal for this crop",
      "action": "Continue current management practices"
    }
  ],
  "optimal_conditions": {
    "temperature": "20-35°C",
    "humidity": "60-80%",
    "ph": "5.5-7.0",
    "nitrogen": "120kg/ha",
    "water": "High"
  },
  "current_conditions": {
    "temperature": "28.5°C",
    "humidity": "75%",
    "ph": "6.2",
    "nitrogen": "2.8g/kg"
  }
}
```

---

## 🎯 Recommendation Categories

### 1. Temperature Management
- **Too Cold**: Mulching, row covers, delay planting
- **Too Hot**: Increase irrigation, shade nets, mulch

### 2. Humidity Control
- **Too Dry**: Drip irrigation, misting systems
- **Too Humid**: Improve air circulation, reduce irrigation

### 3. Soil pH Adjustment
- **Too Acidic**: Apply lime (2-4 tons/hectare)
- **Too Alkaline**: Apply sulfur or organic matter

### 4. Nutrient Management
- **Low Nitrogen**: Apply urea or ammonium nitrate
- **High Nitrogen**: Reduce fertilizer to prevent lodging

### 5. Water Management
- **High Water Crops**: Implement irrigation schedule
- **Low Rainfall**: Drip or sprinkler systems

---

## 🔧 Customization

### Add Your Own Crops

Edit `data/crop_data.csv` with the following columns:

```csv
Crop,Min_Temp_C,Opt_Temp_C,Max_Temp_C,Min_Rainfall_mm,Opt_Rainfall_mm,Max_Rainfall_mm,Min_Humidity_pct,Max_Humidity_pct,Wind_Tolerance,Soil_pH_Min,Soil_pH_Max,Sand_pct_Min,Sand_pct_Max,Clay_pct_Min,Clay_pct_Max,Silt_pct_Min,Silt_pct_Max,Organic_Carbon_Min_pct,Organic_Carbon_Max_pct,Available_N_kg_ha,Available_P_kg_ha,Available_K_kg_ha,Texture_Class,Drainage_Requirement

Mango,24,30,40,800,1200,2000,60,80,moderate,5.5,7.5,40,60,15,30,15,35,0.8,2,100-150 kg/ha,40-60 kg/ha,80-120 kg/ha,sandy loam to loam,well-drained
```

### Modify Scoring Algorithm

Edit `ml-service/main.py`:

```python
def calculate_suitability_score(crop_info, env):
    # Adjust weights
    temp_weight = 0.3
    humidity_weight = 0.2
    ph_weight = 0.3
    nitrogen_weight = 0.2
    
    # Your custom logic here
    return weighted_score
```

### Add New Recommendation Types

```python
# Add pest risk assessment
if env.humidity > 80 and env.temperature > 25:
    recommendations.append({
        "category": "Pest Management",
        "priority": "high",
        "message": "High risk of fungal diseases",
        "action": "Apply preventive fungicides"
    })
```

---

## 📈 Scaling Up

### Add Machine Learning

```python
# Train a model on historical data
from sklearn.ensemble import RandomForestRegressor

model = RandomForestRegressor()
model.fit(X_train, y_train)

# Predict yield
predicted_yield = model.predict(current_conditions)
```

### Add More Data Sources

- Satellite imagery for crop health
- Historical yield data
- Market prices
- Pest/disease databases
- Weather forecasts

### Add Advanced Features

- Multi-crop rotation recommendations
- Seasonal planning
- Cost-benefit analysis
- Yield predictions
- Disease detection

---

## 🎓 Understanding the Code

### Frontend Integration

```typescript
// In HeroSection.tsx
import { analyzeCrop } from '@/lib/recommendationService'

const handleGetRecommendations = async () => {
  const analysis = await analyzeCrop(
    selectedCrop,
    weatherData,
    soilData
  )
  
  // Display results
  setRecommendations(analysis.recommendations)
  setSuitabilityScore(analysis.suitability_score)
}
```

### ML Service API

```python
# POST /analyze
@app.post("/analyze")
async def analyze_crop(input_data: CropInput):
    # 1. Find crop in dataset
    crop_data = crop_df[crop_df['crop'] == input_data.crop_name]
    
    # 2. Calculate suitability
    score = calculate_suitability_score(crop_data, input_data.environment)
    
    # 3. Generate recommendations
    recommendations = generate_recommendations(crop_data, input_data.environment)
    
    # 4. Return analysis
    return CropAnalysisResponse(...)
```

---

## 🎉 You're Ready!

Your complete crop recommendation system is ready to use. Just run:

```bash
docker-compose up --build
```

Then visit http://localhost:3001 and start getting intelligent crop recommendations!

---

## 📞 Support

Check these files for more details:
- `DOCKER_SETUP.md` - Complete Docker guide
- `ml-service/main.py` - ML service code
- `frontend/src/lib/recommendationService.ts` - Frontend integration
- `data/crop_data.csv` - Your crop dataset

Happy farming! 🌾🚜
