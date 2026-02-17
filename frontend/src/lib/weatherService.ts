// Weather and Soil Data Service

export interface WeatherData {
  temperature: number
  humidity: number
  precipitation: number
  pressure: number
  windSpeed: number
  description: string
  icon: string
  feelsLike: number
  tempMin: number
  tempMax: number
}

export interface SoilData {
  ph: number
  nitrogen: number
  phosphorus: number
  potassium: number
  organicCarbon: number
  bulkDensity: number
  clayContent: number
  sandContent: number
  siltContent: number
}

export interface LocationData {
  latitude: number
  longitude: number
  city: string
  country: string
  timestamp: Date
  weather: WeatherData | null
  soil: SoilData | null
}

/**
 * Fetch weather data from OpenWeather API
 */
export async function fetchWeatherData(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
  console.log('OpenWeather API Key exists:', !!apiKey)

  if (!apiKey || apiKey === 'your-openweather-api-key-here') {
    throw new Error('OpenWeather API key not configured')
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
  console.log('Fetching weather from:', url.replace(apiKey, 'API_KEY'))

  const response = await fetch(url)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Weather API error:', response.status, errorText)
    throw new Error(`Weather API error: ${response.status}`)
  }

  const data = await response.json()
  console.log('Weather API response:', data)

  return {
    temperature: data.main.temp,
    humidity: data.main.humidity,
    precipitation: data.rain?.['1h'] || 0, // Precipitation in last hour
    pressure: data.main.pressure,
    windSpeed: data.wind.speed,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    feelsLike: data.main.feels_like,
    tempMin: data.main.temp_min,
    tempMax: data.main.temp_max,
  }
}

/**
 * Fetch soil data from SoilGrids API
 */
export async function fetchSoilData(
  latitude: number,
  longitude: number
): Promise<SoilData> {
  // SoilGrids REST API endpoint
  const properties = [
    'phh2o',      // pH
    'nitrogen',   // Nitrogen
    'soc',        // Soil Organic Carbon
    'bdod',       // Bulk Density
    'clay',       // Clay content
    'sand',       // Sand content
    'silt',       // Silt content
  ]

  const depth = '0-5cm' // Top soil layer
  const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${longitude}&lat=${latitude}&property=${properties.join('&property=')}&depth=${depth}&value=mean`
  console.log('Fetching soil data from:', url)

  const response = await fetch(url)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Soil API error:', response.status, errorText)
    throw new Error(`Soil API error: ${response.status}`)
  }

  const data = await response.json()
  console.log('Soil API response:', data)

  // Check if we have valid data
  if (!data.properties || !data.properties.layers) {
    console.error('Invalid soil data structure:', data)
    throw new Error('Invalid soil data received from API')
  }

  // Log the structure to debug
  console.log('Soil data layers:', data.properties?.layers)
  
  // Extract values from the response
  const getValue = (property: string) => {
    try {
      const layer = data.properties.layers.find((l: any) => l.name === property)
      console.log(`Layer for ${property}:`, layer)
      
      if (!layer || !layer.depths || layer.depths.length === 0) {
        console.warn(`No depth data for ${property}`)
        return 0
      }
      
      const depth = layer.depths[0]
      console.log(`Depth data for ${property}:`, depth)
      
      const value = depth?.values?.mean
      console.log(`Value for ${property}:`, value)
      
      return value !== undefined && value !== null ? value : 0
    } catch (e) {
      console.error(`Failed to get value for ${property}:`, e)
      return 0
    }
  }

  const rawValues = {
    phh2o: getValue('phh2o'),
    nitrogen: getValue('nitrogen'),
    soc: getValue('soc'),
    bdod: getValue('bdod'),
    clay: getValue('clay'),
    sand: getValue('sand'),
    silt: getValue('silt')
  }
  
  console.log('Raw soil values:', rawValues)

  const soilData = {
    ph: rawValues.phh2o > 0 ? rawValues.phh2o / 10 : 6.5, // pH is returned in pH*10
    nitrogen: rawValues.nitrogen > 0 ? rawValues.nitrogen / 100 : 2.5, // Convert from cg/kg to g/kg
    phosphorus: 15, // SoilGrids doesn't provide P directly - use typical value
    potassium: 180, // SoilGrids doesn't provide K directly - use typical value
    organicCarbon: rawValues.soc > 0 ? rawValues.soc / 10 : 1.2, // Convert from dg/kg to g/kg
    bulkDensity: rawValues.bdod > 0 ? rawValues.bdod / 100 : 1.4, // Convert from cg/cm³ to g/cm³
    clayContent: rawValues.clay > 0 ? rawValues.clay / 10 : 25, // Convert from g/kg to %
    sandContent: rawValues.sand > 0 ? rawValues.sand / 10 : 45, // Convert from g/kg to %
    siltContent: rawValues.silt > 0 ? rawValues.silt / 10 : 30, // Convert from g/kg to %
  }

  console.log('Processed soil data:', soilData)
  return soilData
}

/**
 * Save location data to localStorage
 */
export function saveLocationData(data: LocationData): void {
  try {
    const existingData = getLocationHistory()
    const newData = [data, ...existingData].slice(0, 10) // Keep last 10 locations
    localStorage.setItem('locationHistory', JSON.stringify(newData))
  } catch (error) {
    console.error('Error saving location data:', error)
  }
}

/**
 * Get location history from localStorage
 */
export function getLocationHistory(): LocationData[] {
  try {
    const data = localStorage.getItem('locationHistory')
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error reading location history:', error)
    return []
  }
}

/**
 * Get the most recent location data
 */
export function getLastLocationData(): LocationData | null {
  const history = getLocationHistory()
  return history.length > 0 ? history[0] : null
}

/**
 * Clear location history
 */
export function clearLocationHistory(): void {
  try {
    localStorage.removeItem('locationHistory')
  } catch (error) {
    console.error('Error clearing location history:', error)
  }
}
