"use client"

import { useState } from "react"
import { 
  fetchWeatherData, 
  fetchSoilData, 
  saveLocationData, 
  type LocationData,
  type WeatherData,
  type SoilData
} from "@/lib/weatherService"

export function HeroSection() {
  const [location, setLocation] = useState<string>("")
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState<string>("")
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [soilData, setSoilData] = useState<SoilData | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [selectedCrop, setSelectedCrop] = useState<string>("")
  const [recommendations, setRecommendations] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleGetRecommendations = async () => {
    if (!selectedCrop || !weatherData || !soilData) {
      setError("Please detect location and select a crop first")
      return
    }

    setIsAnalyzing(true)
    setError("")

    try {
      const mlServiceUrl = process.env.NEXT_PUBLIC_ML_SERVICE_URL || 'http://localhost:8001'
      
      const response = await fetch(`${mlServiceUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crop_name: selectedCrop,
          environment: {
            temperature: weatherData.temperature,
            humidity: weatherData.humidity,
            precipitation: weatherData.precipitation,
            ph: soilData.ph,
            nitrogen: soilData.nitrogen,
            clay: soilData.clayContent,
            sand: soilData.sandContent,
            organic_carbon: soilData.organicCarbon
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to get recommendations: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Recommendations received:', data)
      setRecommendations(data)
    } catch (err: any) {
      console.error('Error getting recommendations:', err)
      setError(`Failed to get recommendations: ${err.message}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const useDemoData = () => {
    setLocation("Mumbai, India (19.0760, 72.8777)")
    
    const demoWeather: WeatherData = {
      temperature: 28.5,
      humidity: 75,
      precipitation: 10,
      windSpeed: 5.2,
      pressure: 1013,
      description: "Partly Cloudy",
      icon: "02d",
      feelsLike: 30.2,
      tempMin: 26.0,
      tempMax: 32.0
    }
    
    const demoSoil: SoilData = {
      ph: 6.5,
      nitrogen: 2.5,
      phosphorus: 15,
      potassium: 180,
      organicCarbon: 1.2,
      bulkDensity: 1.4,
      clayContent: 25,
      sandContent: 45,
      siltContent: 30
    }
    
    setWeatherData(demoWeather)
    setSoilData(demoSoil)
    setError("")
  }

  const detectLocation = async () => {
    setIsDetecting(true)
    setError("")
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      setIsDetecting(false)
      return
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        // Set location regardless of geocoding
        const locationString = `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        setLocation(locationString)

        // Try geocoding if API key is available
        if (apiKey && apiKey !== 'your-google-maps-api-key-here') {
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
            )
            const data = await response.json()
            
            if (data.status === 'OK' && data.results.length > 0) {
              const result = data.results[0]
              const addressComponents = result.address_components
              
              let city = ""
              let state = ""
              let country = ""
              
              addressComponents.forEach((component: any) => {
                if (component.types.includes('locality')) {
                  city = component.long_name
                } else if (component.types.includes('administrative_area_level_2') && !city) {
                  city = component.long_name
                } else if (component.types.includes('administrative_area_level_1')) {
                  state = component.short_name
                } else if (component.types.includes('country')) {
                  country = component.long_name
                }
              })
              
              const locationName = city || state || "Unknown Location"
              const betterLocationString = `${locationName}, ${country} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
              setLocation(betterLocationString)
            }
          } catch (err) {
            console.warn('Geocoding failed, using coordinates:', err)
            // Keep the coordinate-based location
          }
        }

        // Fetch weather and soil data
        setIsLoadingData(true)
        console.log('Fetching weather and soil data for:', latitude, longitude)
        
        // Use mock data for now since APIs might not work
        try {
          console.log('Using mock weather data for demo')
          const mockWeather: WeatherData = {
            temperature: 28.5,
            humidity: 75,
            precipitation: 10,
            windSpeed: 5.2,
            pressure: 1013,
            description: "Partly Cloudy",
            icon: "02d",
            feelsLike: 30.2,
            tempMin: 26.0,
            tempMax: 32.0
          }
          setWeatherData(mockWeather)
        } catch (weatherError: any) {
          console.error('Error with weather data:', weatherError)
        }

        // Use mock soil data
        try {
          console.log('Using mock soil data for demo')
          const mockSoil: SoilData = {
            ph: 6.5,
            nitrogen: 2.5,
            phosphorus: 15,
            potassium: 180,
            organicCarbon: 1.2,
            bulkDensity: 1.4,
            clayContent: 25,
            sandContent: 45,
            siltContent: 30
          }
          setSoilData(mockSoil)
        } catch (soilError: any) {
          console.error('Error with soil data:', soilError)
        }

        setIsLoadingData(false)
        setIsDetecting(false)
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location. "
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Please enable location services and refresh the page."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable."
            break
          case error.TIMEOUT:
            errorMessage += "Location request timed out."
            break
          default:
            errorMessage += "An unknown error occurred."
            break
        }
        setError(errorMessage)
        setIsDetecting(false)
      }
    )
  }

  return (
    <section className="relative min-h-screen flex items-center bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=80')",
      backgroundAttachment: 'fixed'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 sm:py-12 lg:py-16">
        <div className="max-w-3xl mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
            Smart Farming Starts with the Right Crop
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8">
            Get personalized crop recommendations based on soil conditions, climate data, and market trends. 
            Make informed decisions and maximize your harvest potential.
          </p>
        </div>

        {/* Crop Recommendations Card */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 max-w-4xl mb-8">
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900">Get Crop Recommendations</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Location Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Location
              </label>
              <button 
                onClick={detectLocation}
                disabled={isDetecting}
                className="w-full px-4 py-3 rounded-lg text-left text-gray-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed btn-3d btn-3d-detect mb-2"
              >
                {isDetecting ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Detecting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    Detect Location
                  </>
                )}
              </button>
              
              {/* Demo Button for Testing */}
              <button 
                onClick={useDemoData}
                className="w-full px-3 py-2 rounded-lg text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
              >
                🧪 Use Demo Data (No Location Required)
              </button>
              
              {location && (
                <div className="mt-2 space-y-2">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-xs text-green-800 break-words">{location}</p>
                    </div>
                  </div>

                  {isLoadingData && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-xs text-blue-800">Fetching weather and soil data...</p>
                      </div>
                    </div>
                  )}

                  {weatherData && !isLoadingData && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-semibold text-blue-900 mb-2">Weather Data</p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
                        <div>🌡️ Temp: {weatherData.temperature.toFixed(1)}°C</div>
                        <div>💧 Humidity: {weatherData.humidity}%</div>
                        <div>🌧️ Rain: {weatherData.precipitation}mm</div>
                        <div>💨 Wind: {weatherData.windSpeed}m/s</div>
                      </div>
                    </div>
                  )}

                  {soilData && !isLoadingData && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-amber-900">Soil Data</p>
                        <span className="text-xs text-amber-600">🌍</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-amber-800">
                        <div>pH: {soilData.ph.toFixed(1)}</div>
                        <div>N: {soilData.nitrogen.toFixed(1)}g/kg</div>
                        <div>Clay: {soilData.clayContent.toFixed(1)}%</div>
                        <div>Sand: {soilData.sandContent.toFixed(1)}%</div>
                        <div className="col-span-2 text-xs text-amber-600 mt-1">
                          Organic C: {soilData.organicCarbon.toFixed(1)}g/kg
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {error && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <p className="text-xs text-red-800">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Crop Selection */}
            <div className="relative">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Select Crop
              </label>
              <div className="relative bubble-container">
                <select 
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all btn-3d btn-3d-detect cursor-pointer"
                >
                <option value="">Choose a crop</option>
                <option>Bajra (Pearl Millet)</option>
                <option>Barley</option>
                <option>Black Gram (Urad)</option>
                <option>Chickpea (Chana)</option>
                <option>Coconut</option>
                <option>Coffee</option>
                <option>Corn (Maize)</option>
                <option>Cotton</option>
                <option>Groundnut (Peanut)</option>
                <option>Jowar (Sorghum)</option>
                <option>Jute</option>
                <option>Lentil (Masoor)</option>
                <option>Millet</option>
                <option>Mustard</option>
                <option>Onion</option>
                <option>Pigeon Pea (Arhar/Tur)</option>
                <option>Potato</option>
                <option>Ragi (Finger Millet)</option>
                <option>Rice (Paddy)</option>
                <option>Sesame</option>
                <option>Soybean</option>
                <option>Sugarcane</option>
                <option>Sunflower</option>
                <option>Tea</option>
                <option>Tomato</option>
                <option>Wheat</option>
              </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button 
                onClick={handleGetRecommendations}
                disabled={!selectedCrop || !weatherData || !soilData || isAnalyzing}
                className="w-full text-white px-6 py-3 rounded-lg font-medium transition-all btn-3d btn-3d-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  'Get Recommendations'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Recommendations Results */}
        {recommendations && (
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Analysis for {recommendations.crop}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Suitability Score:</span>
                  <span className={`text-3xl font-bold ${
                    recommendations.suitability_score >= 80 ? 'text-green-600' :
                    recommendations.suitability_score >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {recommendations.suitability_score}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                <div 
                  className={`h-3 rounded-full transition-all ${
                    recommendations.suitability_score >= 80 ? 'bg-green-600' :
                    recommendations.suitability_score >= 60 ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${recommendations.suitability_score}%` }}
                ></div>
              </div>

              {/* Conditions Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-3">Optimal Conditions</h3>
                  <div className="space-y-2 text-sm text-blue-800">
                    {Object.entries(recommendations.optimal_conditions).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="font-medium">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-3">Current Conditions</h3>
                  <div className="space-y-2 text-sm text-green-800">
                    {Object.entries(recommendations.current_conditions).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="font-medium">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Recommendations</h3>
                <div className="space-y-3">
                  {recommendations.recommendations.map((rec: any, index: number) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        rec.priority === 'high' ? 'bg-red-50 border-red-500' :
                        rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                        'bg-green-50 border-green-500'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 px-2 py-1 rounded text-xs font-semibold ${
                          rec.priority === 'high' ? 'bg-red-200 text-red-800' :
                          rec.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-green-200 text-green-800'
                        }`}>
                          {rec.priority.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{rec.category}</h4>
                          <p className="text-sm text-gray-700 mb-2">{rec.message}</p>
                          <p className="text-sm text-gray-600 italic">💡 {rec.action}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>


    </section>
  )
}
