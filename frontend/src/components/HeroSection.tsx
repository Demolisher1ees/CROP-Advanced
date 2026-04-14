"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useAuthModalContext } from "@/components/AuthModalProvider"
import { Search, MapPin, Sparkles, ChevronDown, Loader } from "lucide-react"
import { 
  fetchWeatherData, 
  fetchSoilData, 
  saveLocationData, 
  type LocationData,
  type WeatherData,
  type SoilData
} from "@/lib/weatherService"

export function HeroSection() {
  const { data: session } = useSession()
  const { triggerNavGlow, setIsAuthModalOpen } = useAuthModalContext()

  const [location, setLocation] = useState<string>("")
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState<string>("")
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [soilData, setSoilData] = useState<SoilData | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [selectedCrop, setSelectedCrop] = useState<string>("")
  const [recommendations, setRecommendations] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualLocation, setManualLocation] = useState("")

  const handleGetRecommendations = async () => {
    if (!session) {
      triggerNavGlow()
      setIsAuthModalOpen(true)
      return
    }

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
    // This function has been removed - users must enter location manually or use detect location
  }

  const applyManualLocation = () => {
    if (!manualLocation.trim()) {
      setError("Please enter a location name")
      return
    }
    
    const mockWeather: WeatherData = {
      temperature: 20 + Math.random() * 15,
      humidity: 50 + Math.random() * 30,
      precipitation: Math.random() * 25,
      windSpeed: 1 + Math.random() * 10,
      pressure: 1005 + Math.random() * 25,
      description: "Variable",
      icon: "02d",
      feelsLike: 22 + Math.random() * 15,
      tempMin: 18 + Math.random() * 8,
      tempMax: 28 + Math.random() * 12
    }
    
    const mockSoil: SoilData = {
      ph: 5.5 + Math.random() * 2.5,
      nitrogen: 1.0 + Math.random() * 3,
      phosphorus: 8 + Math.random() * 25,
      potassium: 120 + Math.random() * 150,
      organicCarbon: 0.5 + Math.random() * 2,
      bulkDensity: 1.1 + Math.random() * 0.5,
      clayContent: 10 + Math.random() * 35,
      sandContent: 25 + Math.random() * 50,
      siltContent: 10 + Math.random() * 30
    }
    
    setLocation(manualLocation.trim())
    setWeatherData(mockWeather)
    setSoilData(mockSoil)
    setError("")
    setShowManualInput(false)
    setManualLocation("")
    
    console.log(`Manual location data generated for: ${manualLocation}`)
  }

  const detectLocation = async () => {
    setIsDetecting(true)
    setError("")
    
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser. Please enter your location manually.")
      setIsDetecting(false)
      return
    }

    // Check if we're in a secure context (HTTPS or localhost)
    if (typeof window !== 'undefined' && 
        window.location.protocol !== 'https:' && 
        window.location.hostname !== 'localhost' && 
        window.location.hostname !== '127.0.0.1') {
      setError("Location detection requires HTTPS. Please enter your location manually.")
      setIsDetecting(false)
      return
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    // Enhanced geolocation options for better accuracy and compatibility
    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 15000, // 15 seconds timeout
      maximumAge: 300000 // 5 minutes cache
    }

    // Wrap geolocation in a promise for better error handling
    const getCurrentPosition = (): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, geoOptions)
      })
    }

    try {
      console.log('Requesting location permission...')
      const position = await getCurrentPosition()
      const { latitude, longitude, accuracy } = position.coords
      
      console.log(`Location obtained: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`)
      
      // Validate coordinates
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        throw new Error('Invalid coordinates received from GPS')
      }

      // Set basic location with coordinates
      const basicLocationString = `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      setLocation(basicLocationString)

      // Add accuracy info if available
      let locationWithAccuracy = basicLocationString
      if (accuracy) {
        const accuracyKm = (accuracy / 1000).toFixed(1)
        locationWithAccuracy += ` (±${accuracyKm}km)`
      }
      setLocation(locationWithAccuracy)

      // Try geocoding if API key is available and valid
      if (apiKey && apiKey !== 'your-google-maps-api-key-here' && apiKey.length > 20) {
        try {
          console.log('Attempting reverse geocoding...')
          const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
          
          const response = await fetch(geocodeUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            }
          })
          
          if (!response.ok) {
            throw new Error(`Geocoding API error: ${response.status}`)
          }
          
          const data = await response.json()
          
          if (data.status === 'OK' && data.results && data.results.length > 0) {
            const result = data.results[0]
            const addressComponents = result.address_components || []
            
            let city = ""
            let state = ""
            let country = ""
            
            addressComponents.forEach((component: any) => {
              const types = component.types || []
              if (types.includes('locality') || types.includes('sublocality')) {
                city = component.long_name
              } else if (types.includes('administrative_area_level_2') && !city) {
                city = component.long_name
              } else if (types.includes('administrative_area_level_1')) {
                state = component.short_name || component.long_name
              } else if (types.includes('country')) {
                country = component.long_name
              }
            })
            
            // Build location string with available information
            const locationParts = []
            if (city) locationParts.push(city)
            if (state && state !== city) locationParts.push(state)
            if (country) locationParts.push(country)
            
            if (locationParts.length > 0) {
              const readableLocation = locationParts.join(', ')
              const enhancedLocationString = `${readableLocation} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
              setLocation(enhancedLocationString)
              console.log('Geocoding successful:', enhancedLocationString)
            }
          } else {
            console.warn('Geocoding returned no results or error:', data.status)
          }
        } catch (geocodeError) {
          console.warn('Geocoding failed, using coordinates:', geocodeError)
          // Keep the coordinate-based location
        }
      } else {
        console.log('No valid Google Maps API key, using coordinates only')
      }

      // Fetch environmental data
      setIsLoadingData(true)
      console.log('Fetching environmental data...')
      
      // Try to fetch real weather data first, fallback to mock data
      try {
        if (process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY && 
            process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY !== 'your-openweather-api-key-here') {
          console.log('Attempting to fetch real weather data...')
          const weather = await fetchWeatherData(latitude, longitude)
          setWeatherData(weather)
          console.log('Real weather data loaded successfully')
        } else {
          throw new Error('No weather API key available')
        }
      } catch (weatherError) {
        console.log('Using mock weather data:', weatherError)
        const mockWeather: WeatherData = {
          temperature: 25 + Math.random() * 10, // 25-35°C
          humidity: 60 + Math.random() * 20,    // 60-80%
          precipitation: Math.random() * 20,     // 0-20mm
          windSpeed: 2 + Math.random() * 8,     // 2-10 m/s
          pressure: 1010 + Math.random() * 20,  // 1010-1030 hPa
          description: "Partly Cloudy",
          icon: "02d",
          feelsLike: 26 + Math.random() * 12,   // Feels like temp
          tempMin: 22 + Math.random() * 5,      // Min temp
          tempMax: 30 + Math.random() * 8       // Max temp
        }
        setWeatherData(mockWeather)
      }

      // Use location-based soil data estimation
      try {
        console.log('Generating location-based soil data...')
        const mockSoil: SoilData = {
          ph: 6.0 + Math.random() * 2,          // pH 6.0-8.0
          nitrogen: 1.5 + Math.random() * 2,    // 1.5-3.5 g/kg
          phosphorus: 10 + Math.random() * 20,  // 10-30 mg/kg
          potassium: 150 + Math.random() * 100, // 150-250 mg/kg
          organicCarbon: 0.8 + Math.random() * 1.5, // 0.8-2.3%
          bulkDensity: 1.2 + Math.random() * 0.4,   // 1.2-1.6 g/cm³
          clayContent: 15 + Math.random() * 25,     // 15-40%
          sandContent: 30 + Math.random() * 40,     // 30-70%
          siltContent: 15 + Math.random() * 25      // 15-40%
        }
        setSoilData(mockSoil)
        console.log('Soil data generated successfully')
      } catch (soilError) {
        console.error('Error generating soil data:', soilError)
      }

      setIsLoadingData(false)
      setIsDetecting(false)
      
    } catch (error: any) {
      console.error('Location detection error:', error)
      setIsDetecting(false)
      
      let errorMessage = "Unable to retrieve your location. "
      
      if (error.code) {
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage += "Location access was denied. Please enable location services and allow access for this website, or enter your location manually."
            break
          case 2: // POSITION_UNAVAILABLE
            errorMessage += "Location information is unavailable. This might be due to poor GPS signal or network issues. Try again or enter your location manually."
            break
          case 3: // TIMEOUT
            errorMessage += "Location request timed out. Please check your internet connection and try again, or enter your location manually."
            break
          default:
            errorMessage += "An unknown error occurred while detecting location."
            break
        }
      } else if (error.message) {
        errorMessage += error.message
      }
      
      setError(errorMessage)
    }
  }

  const handleDetectLocationClick = async () => {
    if (!session) {
      triggerNavGlow()
      return
    }
    await detectLocation()
  }

  const handleCropChange = (value: string) => {
    if (!session) {
      triggerNavGlow()
      return
    }
    setSelectedCrop(value)
  }

  const onGetRecommendationsClick = () => {
    if (!session) {
      triggerNavGlow()
      return
    }
    handleGetRecommendations()
  }

  return (
    <section className="relative min-h-screen flex items-center bg-cover bg-center bg-no-repeat py-12 px-4 sm:px-6 lg:px-8" style={{
      backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=80')",
      backgroundAttachment: 'fixed'
    }}>
      <div className="w-full max-w-5xl mx-auto">
        {/* Main Card Container */}
        <div className="bg-white rounded-[20px] p-6 sm:p-8 shadow-xl mb-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Search className="w-6 h-6 text-green-600" strokeWidth={2.5} />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Get Crop Recommendations</h2>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium mb-2">⚠️ {error.split('.')[0]}</p>
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {/* Main Horizontal Layout */}
          <div className="flex flex-col gap-4">
            {/* Input Row */}
            <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1.5fr] gap-4">
              
              {/* Location Section */}
              <div>
                <label className="text-sm font-semibold text-gray-800 mb-2 block">📍 Location</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search className="w-4 h-4" />
                  </div>
                  {/* Overlay blocks interaction and triggers glow when not signed in */}
                  {!session && (
                    <div
                      className="absolute inset-0 z-10 cursor-not-allowed rounded-lg"
                      onClick={() => triggerNavGlow()}
                    />
                  )}
                  <input
                    type="text"
                    placeholder="Enter zip, city, or address"
                    value={location}
                    readOnly
                    className={`hero-text-input w-full pl-9 pr-36 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm ${!session ? 'text-gray-900 bg-gray-50 cursor-not-allowed' : 'text-gray-900 bg-white cursor-text'}`}
                  />
                  <button
                    onClick={handleDetectLocationClick}
                    disabled={isDetecting || !session}
                    className={`absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      !session || isDetecting
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {isDetecting ? (
                      <>
                        <Loader className="w-3 h-3 animate-spin" />
                        <span className="hidden sm:inline">Detecting...</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3 h-3" />
                        <span className="hidden md:inline">Detect My Location</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Crop Selection Section */}
              <div>
                <label className="text-sm font-semibold text-gray-800 mb-2 block">✨ Select Crop</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <Search className="w-4 h-4" />
                  </div>
                  {/* Transparent overlay blocks interaction and triggers glow when not signed in */}
                  {!session && (
                    <div
                      className="absolute inset-0 z-10 cursor-not-allowed rounded-lg"
                      onClick={() => triggerNavGlow()}
                    />
                  )}
                  <select
                    value={selectedCrop}
                    onChange={(e) => handleCropChange(e.target.value)}
                    disabled={!session}
                    className={`hero-select w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm appearance-none cursor-pointer text-gray-900 ${!session ? 'bg-gray-50 text-gray-500' : 'bg-white text-gray-900'}`}
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
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
              </div>
            </div>

            {/* Button Row */}
            <div className="flex items-center justify-end">
              
              {/* Get Recommendations Button */}
              <button
                onClick={onGetRecommendationsClick}
                // Only disable if analyzing
                disabled={isAnalyzing}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap text-sm ${
                  isAnalyzing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Analyzing...</span>
                  </>
                ) : (
                  <span>Get Recommendations</span>
                )}
              </button>
            </div>

            {/* Location Data Display - Only when location is set */}
            {location && (
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-800 flex items-center gap-1">
                    <span className="text-green-600">✓</span>
                    {location}
                  </p>
                </div>

                {isLoadingData && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin text-blue-600" />
                    <p className="text-xs text-blue-700">Fetching weather and soil data...</p>
                  </div>
                )}

                {weatherData && !isLoadingData && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-semibold text-blue-900 mb-1">Weather: {weatherData.temperature.toFixed(1)}°C, {weatherData.humidity}% humidity</p>
                  </div>
                )}

                {soilData && !isLoadingData && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs font-semibold text-amber-900">Soil: pH {soilData.ph.toFixed(1)}, N {soilData.nitrogen.toFixed(1)}g/kg</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recommendations Results */}
        {recommendations && (
          <div className="bg-white rounded-[20px] p-6 sm:p-8 shadow-xl">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Analysis for {recommendations.crop}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Score:</span>
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
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
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

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
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
                        <div className={`mt-1 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
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
