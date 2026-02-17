# OpenWeather API Setup Guide

## 🌤️ OpenWeather API Configuration

### Step 1: Create OpenWeather Account

1. Go to [OpenWeather](https://openweathermap.org/)
2. Click **Sign Up** and create a free account
3. Verify your email address

### Step 2: Generate API Key

1. Log in to your OpenWeather account
2. Go to **API keys** section
3. Your default API key will be shown
4. Or click **Generate** to create a new API key
5. Copy the API key

**Note:** It may take up to 2 hours for a new API key to become active.

### Step 3: Configure Environment Variables

Add your API key to `.env.local`:
```env
NEXT_PUBLIC_OPENWEATHER_API_KEY=your-actual-api-key-here
```

### Step 4: Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3001`
3. Click "Detect Location"
4. Allow location access
5. You should see:
   - Location name
   - Weather data (temperature, humidity, precipitation, wind)
   - Soil data (pH, nitrogen, clay, sand content)

## 📊 Data Collected

### Weather Data (OpenWeather API):
- **Temperature**: Current temperature in °C
- **Humidity**: Relative humidity in %
- **Precipitation**: Rainfall in last hour (mm)
- **Pressure**: Atmospheric pressure (hPa)
- **Wind Speed**: Wind speed in m/s
- **Description**: Weather condition description
- **Feels Like**: Perceived temperature
- **Min/Max Temp**: Temperature range

### Soil Data (SoilGrids API):
- **pH**: Soil pH level (0-14 scale)
- **Nitrogen**: Nitrogen content (g/kg)
- **Organic Carbon**: Soil organic carbon (g/kg)
- **Bulk Density**: Soil bulk density (g/cm³)
- **Clay Content**: Clay percentage (%)
- **Sand Content**: Sand percentage (%)
- **Silt Content**: Silt percentage (%)

## 💾 Data Storage

All location, weather, and soil data is stored in:
- **localStorage**: Browser local storage
- **Key**: `locationHistory`
- **Limit**: Last 10 locations
- **Format**: JSON array with timestamps

### Accessing Stored Data:

```typescript
import { getLocationHistory, getLastLocationData } from '@/lib/weatherService'

// Get all history
const history = getLocationHistory()

// Get most recent
const lastLocation = getLastLocationData()
```

## 🔒 API Limits

### OpenWeather Free Tier:
- **Calls**: 1,000 calls/day
- **Rate**: 60 calls/minute
- **Data**: Current weather data
- **Cost**: Free

### SoilGrids API:
- **Calls**: Unlimited (free)
- **Rate**: No strict limits
- **Data**: Global soil properties
- **Cost**: Free

## 🚨 Troubleshooting

**"API key not configured" error:**
- Check that `NEXT_PUBLIC_OPENWEATHER_API_KEY` is set in `.env.local`
- Restart the development server

**"Failed to fetch weather data" error:**
- Wait 2 hours after creating new API key
- Check API key is correct
- Verify you haven't exceeded rate limits

**"Failed to fetch soil data" error:**
- Check internet connection
- SoilGrids API might be temporarily down
- Coordinates might be in ocean (no soil data)

**No data displayed:**
- Check browser console for errors
- Verify location permissions are granted
- Check API keys are properly configured

## 📖 API Documentation

- **OpenWeather API**: https://openweathermap.org/api
- **SoilGrids API**: https://www.isric.org/explore/soilgrids
- **SoilGrids REST API**: https://rest.isric.org/soilgrids/v2.0/docs
