// Crop Recommendation Service

export interface Recommendation {
  category: string
  priority: 'high' | 'medium' | 'low'
  message: string
  action: string
}

export interface CropAnalysis {
  crop: string
  suitability_score: number
  recommendations: Recommendation[]
  optimal_conditions: {
    temperature: string
    humidity: string
    ph: string
    nitrogen: string
    water: string
  }
  current_conditions: {
    temperature: string
    humidity: string
    ph: string
    nitrogen: string
    precipitation: string
  }
}

const ML_SERVICE_URL = process.env.NEXT_PUBLIC_ML_SERVICE_URL || 'http://localhost:8001'

/**
 * Get list of available crops from ML service
 */
export async function getAvailableCrops(): Promise<string[]> {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/crops`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch crops')
    }
    
    const data = await response.json()
    return data.crops || []
  } catch (error) {
    console.error('Error fetching crops:', error)
    // Return default crops if service is unavailable
    return [
      'Rice', 'Wheat', 'Corn', 'Cotton', 'Soybean',
      'Bajra (Pearl Millet)', 'Barley', 'Chickpea (Chana)',
      'Potato', 'Tomato', 'Sugarcane', 'Sunflower'
    ]
  }
}

/**
 * Analyze crop suitability and get recommendations
 */
export async function analyzeCrop(
  cropName: string,
  weatherData: {
    temperature: number
    humidity: number
    precipitation: number
  },
  soilData: {
    ph: number
    nitrogen: number
    clay: number
    sand: number
    organicCarbon: number
  }
): Promise<CropAnalysis> {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        crop_name: cropName,
        environment: {
          temperature: weatherData.temperature,
          humidity: weatherData.humidity,
          precipitation: weatherData.precipitation,
          ph: soilData.ph,
          nitrogen: soilData.nitrogen,
          clay: soilData.clay,
          sand: soilData.sand,
          organic_carbon: soilData.organicCarbon
        }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to analyze crop')
    }

    const analysis: CropAnalysis = await response.json()
    return analysis
  } catch (error: any) {
    console.error('Error analyzing crop:', error)
    throw new Error(error.message || 'Failed to get crop recommendations')
  }
}

/**
 * Check if ML service is available
 */
export async function checkMLServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/health`)
    return response.ok
  } catch (error) {
    console.error('ML service health check failed:', error)
    return false
  }
}
