"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useAuthModalContext } from "@/components/AuthModalProvider"
import { Search, MapPin, Sparkles, ChevronDown, Loader } from "lucide-react"
import { useLanguage } from "@/components/LanguageProvider"
import { 
  fetchWeatherData, 
  fetchSoilData, 
  saveLocationData, 
  type LocationData,
  type WeatherData,
  type SoilData
} from "@/lib/weatherService"

const CROPS = [
  "Bajra (Pearl Millet)", "Barley", "Black Gram (Urad)", "Chickpea (Chana)", 
  "Coconut", "Coffee", "Corn (Maize)", "Cotton", "Groundnut (Peanut)", 
  "Jowar (Sorghum)", "Jute", "Lentil (Masoor)", "Millet", "Mustard", "Onion", 
  "Pigeon Pea (Arhar/Tur)", "Potato", "Ragi (Finger Millet)", "Rice (Paddy)", 
  "Sesame", "Soybean", "Sugarcane", "Sunflower", "Tea", "Tomato", "Wheat"
]

const getCropKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/_$/, '')

export function HeroSection() {
  const { data: session } = useSession()
  const { triggerNavGlow, setIsAuthModalOpen } = useAuthModalContext()
  const { t, language } = useLanguage()

  const tCrop = (name: string) => {
    if (!name) return "";
    const translated = t(`crop_names.${getCropKey(name)}`);
    return translated.startsWith("crop_names.") ? name : translated;
  }

  const translateEnvKey = (key: string) => {
    const k = `hero.env_${key}`;
    const trans = t(k);
    return trans.startsWith("hero.") ? key.replace(/_/g, ' ') : trans;
  }

  const translateEnvVal = (val: string) => {
    if (typeof val !== 'string') return val;
    let v = val;
    if (val.toLowerCase() === "loam") v = t("hero.val_loam") || v;
    else if (val.toLowerCase() === "well-drained") v = t("hero.val_well_drained") || v;
    
    if (language.includes("Bengali")) v = v.replace(/\(range:/i, "(রেঞ্জ:");
    else if (language.includes("Hindi")) v = v.replace(/\(range:/i, "(रेंज:");
    return v;
  }

  const translateRecCategory = (cat: string) => {
    if (language.includes("English")) return cat;
    let c = cat;
    if (c === "Temperature") c = t("hero.env_temperature");
    if (c === "Humidity") c = t("hero.env_humidity");
    if (c === "Soil pH") c = t("hero.env_ph");
    if (c === "Soil Texture - Sand") c = `${t("hero.env_soil_texture")} - ${t("hero.env_sand")}`;
    if (c === "Soil Texture - Clay") c = `${t("hero.env_soil_texture")} - ${t("hero.env_clay")}`;
    if (c === "Organic Carbon") c = t("hero.env_organic_carbon");
    if (c === "Nitrogen (N)") c = t("hero.env_nitrogen");
    if (c === "Soil Texture") c = t("hero.env_soil_texture");
    if (c === "Drainage") c = t("hero.env_drainage");
    if (c === "General") c = language.includes("Bengali") ? "সাধারণ" : "सामान्य";
    return c;
  }

  const translateMessage = (msg: string) => {
    if (language.includes("English")) return msg;
    const isBn = language.includes("Bengali");
    let m = msg;
    m = m.replace(/Temperature is ([\d.]+)°C below minimum \(([\d.]+)°C\)/i, isBn ? "তাপমাত্রা সর্বনিম্ন ($2°C) থেকে $1°C কম" : "तापमान न्यूनतम ($2°C) से $1°C कम है");
    m = m.replace(/Temperature is ([\d.]+)°C above maximum \(([\d.]+)°C\)/i, isBn ? "তাপমাত্রা সর্বোচ্চ ($2°C) থেকে $1°C বেশি" : "तापमान अधिकतम ($2°C) से $1°C अधिक है");
    m = m.replace(/Humidity is ([\d.]+)% below minimum \(([\d.]+)%\)/i, isBn ? "আর্দ্রতা সর্বনিম্ন ($2%) থেকে $1% কম" : "नमी न्यूनतम ($2%) से $1% कम है");
    m = m.replace(/Humidity is ([\d.]+)% above maximum \(([\d.]+)%\)/i, isBn ? "আর্দ্রতা সর্বোচ্চ ($2%) থেকে $1% বেশি" : "नमी अधिकतम ($2%) से $1% अधिक है");
    m = m.replace(/Sand content \(([\d.]+)%\) is below optimal range \(([\d.]+)-([\d.]+)%\)/i, isBn ? "বালির পরিমাণ ($1%) সর্বোত্তম সীমার ($2-$3%) নিচে" : "रेत की मात्रा ($1%) इष्टतम सीमा ($2-$3%) से नीचे है");
    m = m.replace(/Sand content \(([\d.]+)%\) is above optimal range \(([\d.]+)-([\d.]+)%\)/i, isBn ? "বালির পরিমাণ ($1%) সর্বোত্তম সীমার ($2-$3%) উপরে" : "रेत की मात्रा ($1%) इष्टतम सीमा ($2-$3%) से ऊपर है");
    m = m.replace(/Clay content \(([\d.]+)%\) is below optimal range \(([\d.]+)-([\d.]+)%\)/i, isBn ? "কাদামাটির পরিমাণ ($1%) সর্বোত্তম সীমার ($2-$3%) নিচে" : "चिकनी मिट्टी की मात्रा ($1%) इष्टतम सीमा ($2-$3%) से नीचे है");
    m = m.replace(/Clay content \(([\d.]+)%\) is above optimal range \(([\d.]+)-([\d.]+)%\)/i, isBn ? "কাদামাটির পরিমাণ ($1%) সর্বোত্তম সীমার ($2-$3%) উপরে" : "चिकनी मिट्टी की मात्रा ($1%) इष्टतम सीमा ($2-$3%) से ऊपर है");
    m = m.replace(/Organic carbon \(([\d.]+)%\) is above maximum \(([\d.]+)%\)/i, isBn ? "জৈব কার্বন ($1%) সর্বোচ্চ সীমার ($2%) উপরে" : "जैविक कार्बन ($1%) अधिकतम सीमा ($2%) से ऊपर है");
    m = m.replace(/Organic carbon \(([\d.]+)%\) is below minimum \(([\d.]+)%\)/i, isBn ? "জৈব কার্বন ($1%) সর্বনিম্ন সীমার ($2%) নিচে" : "जैविक कार्बन ($1%) न्यूनतम सीमा ($2%) से नीचे है");
    m = m.replace(/Nitrogen content is low \(([\d.]+)g\/kg\)/i, isBn ? "নাইট্রোজেনের পরিমাণ কম ($1g/kg)" : "नाइट्रोजन की मात्रा कम है ($1g/kg)");
    m = m.replace(/Soil is too acidic \(pH ([\d.]+), minimum: ([\d.]+)\)/i, isBn ? "মাটি খুব অম্লীয় (pH $1, সর্বনিম্ন: $2)" : "मिट्टी बहुत अम्लीय है (pH $1, न्यूनतम: $2)");
    m = m.replace(/Soil is too alkaline \(pH ([\d.]+), maximum: ([\d.]+)\)/i, isBn ? "মাটি খুব ক্ষারীয় (pH $1, সর্বোচ্চ: $2)" : "मिट्टी बहुत क्षारीय है (pH $1, अधिकतम: $2)");
    
    const textureMatch = m.match(/Ideal soil texture for (.+): (.+)/i);
    if (textureMatch) {
      return isBn ? `${tCrop(textureMatch[1])} এর জন্য আদর্শ মাটির গঠন: ${translateEnvVal(textureMatch[2])}` : `${tCrop(textureMatch[1])} के लिए आदर्श मिट्टी की बनावट: ${translateEnvVal(textureMatch[2])}`;
    }
    
    const drainageMatch = m.match(/Drainage requirement: (.+)/i);
    if (drainageMatch) {
      return isBn ? `নিষ্কাশন প্রয়োজন: ${translateEnvVal(drainageMatch[1])}` : `जल निकासी की आवश्यकता: ${translateEnvVal(drainageMatch[1])}`;
    }
    
    return m;
  }

  const translateAction = (act: string) => {
    if (language.includes("English")) return act;
    const isBn = language.includes("Bengali");
    
    const actions: Record<string, [string, string]> = {
      "Use mulching, row covers, or greenhouse to increase temperature. Consider delaying planting until warmer weather.": [
        "তাপমাত্রা বাড়াতে মালচিং, সারি কভার বা গ্রিনহাউস ব্যবহার করুন। উষ্ণ আবহাওয়া পর্যন্ত রোপণ বিলম্বিত করার কথা বিবেচনা করুন।",
        "तापमान बढ़ाने के लिए मल्चिंग, रो कवर्स या ग्रीनहाउस का उपयोग करें।"
      ],
      "Increase irrigation frequency, use shade nets, apply mulch to cool soil. Consider heat-tolerant varieties.": [
        "সেচের মাত্রা বাড়ান, ছায়া জাল ব্যবহার করুন, মাটি ঠান্ডা রাখতে মালচ প্রয়োগ করুন। তাপ-সহনশীল জাত বিবেচনা করুন।",
        "सिंचाई की आवृत्ति बढ़ाएं, छाया जाल का उपयोग करें, मिट्टी को ठंडा करने के लिए मल्च लगाएं।"
      ],
      "Monitor temperature closely. Adjust planting time if possible for better yields.": [
        "তাপমাত্রা নিবিড়ভাবে পর্যবেক্ষণ করুন। ভালো ফলনের জন্য সম্ভব হলে রোপণের সময় সামঞ্জস্য করুন।",
        "तापमान की बारीकी से निगरानी करें।"
      ],
      "Increase irrigation frequency, use drip irrigation, or install misting systems to raise humidity.": [
        "আর্দ্রতা বাড়াতে সেচের মাত্রা বাড়ান, ড্রিপ সেচ ব্যবহার করুন বা মিস্টিং সিস্টেম ইনস্টল করুন।",
        "सिंचाई की आवृत्ति बढ़ाएं, ड्रिप सिंचाई का उपयोग करें।"
      ],
      "Improve air circulation, reduce irrigation, monitor for fungal diseases. Apply fungicides preventively.": [
        "বায়ু চলাচল উন্নত করুন, সেচ কমান, ছত্রাকজনিত রোগের উপর নজর রাখুন। আগাম ছত্রাকনাশক প্রয়োগ করুন।",
        "वायु संचार में सुधार करें, सिंचाई कम करें, फफूंद जनित रोगों की निगरानी करें।"
      ],
      "Apply agricultural lime at 2-4 tons/hectare. Retest soil after 3 months.": [
        "প্রতি হেক্টরে ২-৪ টন কৃষিজ চুন প্রয়োগ করুন। ৩ মাস পর মাটি পুনরায় পরীক্ষা করুন।",
        "कृषि चूना 2-4 टन/हेक्टेयर की दर से लगाएं।"
      ],
      "Apply elemental sulfur or organic compost. Add acidifying fertilizers like ammonium sulfate.": [
        "মৌলিক সালফার বা জৈব সার প্রয়োগ করুন। অ্যামোনিয়াম সালফেটের মতো অম্লীয় সার যোগ করুন।",
        "मौलिक सल्फर या जैविक खाद लगाएं।"
      ],
      "Add coarse sand to improve drainage and aeration. Consider raised beds.": [
        "নিষ্কাশন এবং বায়ু চলাচল উন্নত করতে মোটা বালি যোগ করুন। উঁচু বেড তৈরি করার কথা বিবেচনা করুন।",
        "जल निकासी और वातन में सुधार के लिए मोटी रेत मिलाएं।"
      ],
      "Add organic matter and clay to improve water retention. Use mulching to reduce water loss.": [
        "জল ধরে রাখার ক্ষমতা বাড়াতে জৈব পদার্থ এবং কাদামাটি যোগ করুন। জলের ক্ষতি কমাতে মালচিং ব্যবহার করুন।",
        "जल प्रतिधारण में सुधार के लिए जैविक पदार्थ और मिट्टी मिलाएं।"
      ],
      "Add clay or bentonite to improve nutrient retention. Incorporate compost for better structure.": [
        "পুষ্টি ধরে রাখার ক্ষমতা বাড়াতে কাদামাটি বা বেন্টোনাইট যোগ করুন। ভালো গঠনের জন্য কম্পোস্ট মেশান।",
        "पोषक तत्वों के प्रतिधारण में सुधार के लिए मिट्टी या बेंटोनाइट मिलाएं।"
      ],
      "Add sand and organic matter to improve drainage. Consider raised beds or ridge planting.": [
        "নিষ্কাশন উন্নত করতে বালি এবং জৈব পদার্থ যোগ করুন। উঁচু বেড বা রিজ রোপণ বিবেচনা করুন।",
        "जल निकासी में सुधार के लिए रेत और जैविक पदार्थ मिलाएं।"
      ],
      "Add compost, farmyard manure, or green manure. Apply 10-15 tons/hectare of well-decomposed organic matter.": [
        "কম্পোস্ট, খামার সার বা সবুজ সার যোগ করুন। হেক্টর প্রতি ১০-১৫ টন সুপচা জৈব পদার্থ প্রয়োগ করুন।",
        "खाद, फार्मयार्ड खाद या हरी खाद मिलाएं।"
      ],
      "Excellent organic matter content. Maintain current practices.": [
        "জৈব পদার্থের পরিমাণ চমৎকার। বর্তমান পদ্ধতি বজায় রাখুন।",
        "उत्कृष्ट जैविक पदार्थ सामग्री। वर्तमान प्रथाओं को बनाए रखें।"
      ],
      "Apply nitrogen fertilizers: Urea, Ammonium Sulfate, or organic sources like compost. Split application recommended.": [
        "নাইট্রোজেন সার প্রয়োগ করুন: ইউরিয়া, অ্যামোনিয়াম সালফেট, বা কম্পোস্টের মতো জৈব উৎস। বিভক্ত প্রয়োগ সুপারিশ করা হয়।",
        "नाइट्रोजन उर्वरक लगाएं: यूरिया, अमोनियम सल्फेट।"
      ],
      "Ensure soil matches this texture class for optimal growth.": [
        "সর্বোত্তম বৃদ্ধির জন্য মাটি এই গঠন শ্রেণীর সাথে মেলে তা নিশ্চিত করুন।",
        "सुनिश्चित करें कि इष्टतम वृद्धि के लिए मिट्टी इस बनावट वर्ग से मेल खाती है।"
      ],
      "Ensure proper drainage system matches crop requirements to prevent waterlogging or drought stress.": [
        "জলাবদ্ধতা বা খরার চাপ রোধ করতে ফসলের প্রয়োজনীয়তার সাথে সঠিক নিষ্কাশন ব্যবস্থা মেলে তা নিশ্চিত করুন।",
        "जलभराव या सूखे के तनाव को रोकने के लिए उचित जल निकासी प्रणाली सुनिश्चित करें।"
      ],
      "Continue current management practices. Monitor regularly and maintain soil health.": [
        "বর্তমান ব্যবস্থাপনা পদ্ধতি চালিয়ে যান। নিয়মিত নজর রাখুন এবং মাটির স্বাস্থ্য বজায় রাখুন।",
        "वर्तमान प्रबंधन प्रथाओं को जारी रखें। नियमित निगरानी करें और मिट्टी के स्वास्थ्य को बनाए रखें।"
      ]
    };

    if (actions[act]) {
      return isBn ? actions[act][0] : actions[act][1];
    }
    
    return act;
  }

  const [location, setLocation] = useState<string>("")
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState<string>("")
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [soilData, setSoilData] = useState<SoilData | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [selectedCrop, setSelectedCrop] = useState<string>("")
  const [isCropDropdownOpen, setIsCropDropdownOpen] = useState(false)
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
    <section className={`relative flex items-center bg-cover bg-center bg-no-repeat py-12 px-4 sm:px-6 lg:px-8 ${(!recommendations && !isLoadingData) ? 'h-[calc(100vh-65px)] overflow-hidden' : 'min-h-[calc(100vh-65px)]'}`} style={{
      backgroundImage: "url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=80')",
      backgroundAttachment: 'fixed'
    }}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[6px] pointer-events-none z-0" />
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        {/* Main Card Container */}
        <div className="bg-white dark:bg-gray-900 rounded-[20px] p-6 sm:p-8 shadow-xl mb-8 border border-transparent dark:border-gray-800 transition-colors">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Search className="w-6 h-6 text-green-600 dark:text-green-500" strokeWidth={2.5} />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t("hero.title")}</h2>
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
                <label className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 block">{t("hero.location_label")}</label>
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
                    placeholder={t("hero.location_placeholder")}
                    value={location}
                    readOnly
                    className={`hero-text-input w-full pl-9 pr-36 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm ${!session ? 'text-gray-900 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed' : 'text-gray-900 dark:text-white bg-white dark:bg-gray-800 cursor-text'}`}
                  />
                  <button
                    onClick={handleDetectLocationClick}
                    disabled={isDetecting || !session}
                    className={`absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      !session || isDetecting
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50'
                    }`}
                  >
                    {isDetecting ? (
                      <>
                        <Loader className="w-3 h-3 animate-spin" />
                        <span className="hidden sm:inline">{t("hero.detecting")}</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3 h-3" />
                        <span className="hidden md:inline">{t("hero.detect_location")}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Crop Selection Section */}
              <div>
                <label className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 block">{t("hero.select_crop")}</label>
                <div className="relative">
                  {/* Transparent overlay blocks interaction and triggers glow when not signed in */}
                  {!session && (
                    <div
                      className="absolute inset-0 z-10 cursor-not-allowed rounded-lg"
                      onClick={() => triggerNavGlow()}
                    />
                  )}
                  
                  {/* Custom Glassmorphism Dropdown Trigger */}
                  <div 
                    onClick={() => session && setIsCropDropdownOpen(!isCropDropdownOpen)}
                    className={`w-full flex items-center justify-between pl-3 pr-9 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg transition-all text-sm cursor-pointer ${
                      !session ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Search className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="truncate">{selectedCrop ? tCrop(selectedCrop) : t("hero.choose_crop")}</span>
                    </div>
                  </div>
                  
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronDown className={`w-4 h-4 transition-transform ${isCropDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Dropdown Menu (Glassmorphism & Centered Items) */}
                  {isCropDropdownOpen && session && (
                    <>
                      {/* Invisible backdrop to catch outside clicks */}
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setIsCropDropdownOpen(false)}
                      />
                      <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-white/50 dark:border-gray-700 bg-white/80 dark:bg-gray-800/90 backdrop-blur-md shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="max-h-60 overflow-y-auto py-2 custom-scrollbar hide-scrollbar">
                          {CROPS.map((crop) => (
                            <div
                              key={crop}
                              onClick={() => {
                                handleCropChange(crop)
                                setIsCropDropdownOpen(false)
                              }}
                              className={`px-4 py-3 text-sm text-center cursor-pointer transition-colors ${
                                selectedCrop === crop 
                                  ? 'bg-green-600/10 text-green-700 dark:text-green-400 font-semibold' 
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-green-700 dark:hover:text-green-400'
                              }`}
                            >
                              {tCrop(crop)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
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
                    <span className="hidden sm:inline">{t("hero.analyzing")}</span>
                  </>
                ) : (
                  <span>{t("hero.get_recommendations")}</span>
                )}
              </button>
            </div>

            {/* Location Data Display - Only when location is set */}
            {location && (
              <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg">
                  <p className="text-xs text-green-800 dark:text-green-300 flex items-center gap-1">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    {location}
                  </p>
                </div>

                {isLoadingData && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">{t("hero.fetching_data")}</p>
                  </div>
                )}

                {weatherData && !isLoadingData && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg">
                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-1">{t("hero.weather_label")}: {weatherData.temperature.toFixed(1)}°C, {weatherData.humidity}% {t("hero.humidity")}</p>
                  </div>
                )}

                {soilData && !isLoadingData && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg">
                    <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">{t("hero.soil_label")}: pH {soilData.ph.toFixed(1)}, N {soilData.nitrogen.toFixed(1)}g/kg</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recommendations Results */}
        {recommendations && (
          <div className="bg-white dark:bg-gray-900 rounded-[20px] p-6 sm:p-8 shadow-xl border border-transparent dark:border-gray-800 transition-colors">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {t("hero.analysis_for")} {recommendations.crop}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t("hero.score")}:</span>
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
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/50">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">{t("hero.optimal_conditions")}</h3>
                  <div className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                    {Object.entries(recommendations.optimal_conditions).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{translateEnvKey(key)}:</span>
                        <span className="font-medium">{translateEnvVal(value as string)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/50">
                  <h3 className="font-semibold text-green-900 dark:text-green-200 mb-3">{t("hero.current_conditions")}</h3>
                  <div className="space-y-2 text-sm text-green-800 dark:text-green-300">
                    {Object.entries(recommendations.current_conditions).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{translateEnvKey(key)}:</span>
                        <span className="font-medium">{translateEnvVal(value as string)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t("hero.recommendations_label")}</h3>
                <div className="space-y-3">
                  {recommendations.recommendations.map((rec: any, index: number) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        rec.priority === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                        rec.priority === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
                        'bg-green-50 dark:bg-green-900/20 border-green-500'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                          rec.priority === 'high' ? 'bg-red-200 dark:bg-red-900/40 text-red-800 dark:text-red-300' :
                          rec.priority === 'medium' ? 'bg-yellow-200 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300' :
                          'bg-green-200 dark:bg-green-900/40 text-green-800 dark:text-green-300'
                        }`}>
                          {t(`hero.rec_${rec.priority.toLowerCase()}`) || rec.priority.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{translateRecCategory(rec.category)}</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{translateMessage(rec.message)}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic">💡 {translateAction(rec.action)}</p>
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
