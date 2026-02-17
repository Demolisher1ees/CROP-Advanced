# Docker Setup Guide for Smart Crop Advisor

## 🐳 Complete System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Browser                          │
│              (http://localhost:3001)                     │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼─────┐          ┌─────▼──────┐
    │ Frontend │          │  Backend   │
    │ Next.js  │◄────────►│  FastAPI   │
    │  :3001   │          │   :8000    │
    └────┬─────┘          └─────┬──────┘
         │                      │
         │                      │
         └──────────┬───────────┘
                    │
              ┌─────▼──────┐
              │ ML Service │
              │  FastAPI   │
              │   :8001    │
              └─────┬──────┘
                    │
              ┌─────▼──────┐
              │ CSV Dataset│
              │ crop_data  │
              └────────────┘
```

## 📋 Prerequisites

1. **Docker Desktop** installed
2. **Docker Compose** installed
3. **Your crop dataset CSV** file

## 🗂️ Prepare Your Dataset

### Step 1: Create Data Directory

```bash
mkdir -p smart-crop-advisor/data
```

### Step 2: Place Your CSV File

Copy your crop dataset CSV to:
```
smart-crop-advisor/data/crop_data.csv
```

### Step 3: CSV Format Requirements

Your CSV should have these columns (adjust column names in `ml-service/main.py` if different):

```csv
crop,optimal_temp_min,optimal_temp_max,optimal_humidity_min,optimal_humidity_max,optimal_ph_min,optimal_ph_max,nitrogen_requirement,water_requirement
Rice,20,35,60,80,5.5,7.0,120,High
Wheat,15,25,50,70,6.0,7.5,100,Medium
Corn,18,30,55,75,5.8,7.0,150,Medium
```

**Required Columns:**
- `crop`: Crop name
- `optimal_temp_min`: Minimum temperature (°C)
- `optimal_temp_max`: Maximum temperature (°C)
- `optimal_humidity_min`: Minimum humidity (%)
- `optimal_humidity_max`: Maximum humidity (%)
- `optimal_ph_min`: Minimum soil pH
- `optimal_ph_max`: Maximum soil pH
- `nitrogen_requirement`: Nitrogen needed (kg/ha)
- `water_requirement`: High/Medium/Low

## 🚀 Quick Start

### Option 1: Run Everything with Docker Compose

```bash
# Navigate to project root
cd smart-crop-advisor

# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### Option 2: Run ML Service Only

```bash
# Build ML service
docker-compose build ml-service

# Start ML service
docker-compose up ml-service

# Access at http://localhost:8001
```

## 🔧 Service URLs

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8000
- **ML Service**: http://localhost:8001
- **ML Service Docs**: http://localhost:8001/docs

## 📊 How It Works

### 1. User Interaction Flow

```
1. User clicks "Detect Location"
   ↓
2. Frontend gets GPS coordinates
   ↓
3. Fetches Weather Data (OpenWeather API)
   ↓
4. Fetches Soil Data (SoilGrids API)
   ↓
5. User selects crop from dropdown
   ↓
6. Clicks "Get Recommendations"
   ↓
7. Frontend sends data to ML Service
   ↓
8. ML Service analyzes conditions vs crop requirements
   ↓
9. Returns suitability score + recommendations
   ↓
10. Frontend displays results
```

### 2. Data Flow

```javascript
// Frontend collects:
{
  crop: "Rice",
  weather: {
    temperature: 28.5,
    humidity: 75,
    precipitation: 2.5
  },
  soil: {
    ph: 6.2,
    nitrogen: 2.8,
    clay: 30,
    sand: 40,
    organicCarbon: 1.5
  }
}

// ML Service responds:
{
  crop: "Rice",
  suitability_score: 85.5,
  recommendations: [
    {
      category: "Temperature",
      priority: "low",
      message: "Temperature is optimal",
      action: "Continue current practices"
    },
    {
      category: "Soil pH",
      priority: "medium",
      message: "pH is slightly below optimal",
      action: "Apply lime at 1-2 tons/hectare"
    }
  ]
}
```

## 🛠️ Development Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f ml-service
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Stop Services

```bash
# Stop all
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Rebuild After Changes

```bash
# Rebuild specific service
docker-compose build ml-service

# Rebuild and restart
docker-compose up -d --build ml-service
```

### Access Container Shell

```bash
# ML Service
docker exec -it crop-ml-service bash

# Frontend
docker exec -it crop-frontend sh

# Backend
docker exec -it crop-backend bash
```

## 🧪 Testing the ML Service

### Test with curl

```bash
# Get available crops
curl http://localhost:8001/crops

# Analyze crop
curl -X POST http://localhost:8001/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "crop_name": "Rice",
    "environment": {
      "temperature": 28.5,
      "humidity": 75,
      "precipitation": 2.5,
      "ph": 6.2,
      "nitrogen": 2.8,
      "clay": 30,
      "sand": 40,
      "organic_carbon": 1.5
    }
  }'
```

### Test with Python

```python
import requests

# Analyze crop
response = requests.post('http://localhost:8001/analyze', json={
    'crop_name': 'Rice',
    'environment': {
        'temperature': 28.5,
        'humidity': 75,
        'precipitation': 2.5,
        'ph': 6.2,
        'nitrogen': 2.8,
        'clay': 30,
        'sand': 40,
        'organic_carbon': 1.5
    }
})

print(response.json())
```

## 📝 Customizing the ML Service

### Add More Crops

Edit `data/crop_data.csv` and add rows:

```csv
Tomato,18,30,60,80,6.0,7.0,100,Medium
Potato,15,25,70,90,5.0,6.5,120,High
```

### Modify Recommendation Logic

Edit `ml-service/main.py`:
- `calculate_suitability_score()` - Adjust scoring algorithm
- `generate_recommendations()` - Add/modify recommendations

### Add New Features

```python
# In ml-service/main.py

# Add pest risk assessment
def assess_pest_risk(crop_info, env):
    if env.humidity > 80 and env.temperature > 25:
        return "High risk of fungal diseases"
    return "Low pest risk"

# Add to recommendations
recommendations.append(Recommendation(
    category="Pest Management",
    priority="medium",
    message=assess_pest_risk(crop_info, env),
    action="Monitor regularly and apply preventive measures"
))
```

## 🐛 Troubleshooting

### ML Service Won't Start

```bash
# Check logs
docker-compose logs ml-service

# Common issues:
# 1. Port 8001 already in use
# 2. Dataset file not found
# 3. Python dependencies failed to install
```

### Dataset Not Loading

```bash
# Check if file exists
ls -la data/crop_data.csv

# Check file permissions
chmod 644 data/crop_data.csv

# View ML service logs
docker-compose logs ml-service | grep "dataset"
```

### Frontend Can't Connect to ML Service

```bash
# Check if ML service is running
curl http://localhost:8001/health

# Check network
docker network ls
docker network inspect crop-network

# Restart services
docker-compose restart
```

## 🔒 Production Deployment

### Environment Variables

Create `.env` file:

```env
# ML Service
ML_SERVICE_PORT=8001
DATASET_PATH=/app/data/crop_data.csv

# Frontend
NEXT_PUBLIC_ML_SERVICE_URL=https://your-ml-service.com

# Backend
ML_SERVICE_URL=http://ml-service:8001
```

### Security

1. Add authentication to ML service
2. Use HTTPS in production
3. Implement rate limiting
4. Validate all inputs
5. Use secrets management

## 📚 Next Steps

1. ✅ Set up Docker environment
2. ✅ Prepare your CSV dataset
3. ✅ Start services with docker-compose
4. ✅ Test ML service endpoints
5. ✅ Integrate with frontend
6. 🔄 Add more crops to dataset
7. 🔄 Customize recommendations
8. 🔄 Deploy to production
