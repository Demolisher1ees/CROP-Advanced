"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState, useMemo, useRef } from "react"
import { clearAllCookies } from "@/lib/clearCookies"
import {
  Leaf, Sprout, CloudSun, BarChart3, MapPin, Thermometer,
  Droplets, AlertTriangle, CheckCircle, Clock, Plus, TrendingUp,
  Wind, Activity, ArrowRight, RefreshCw, Search, X, Bug,
  FlaskConical, Wheat, Calculator, ChevronDown, User, Trash2
} from "lucide-react"
import { useLanguage } from "@/components/LanguageProvider"

/* ─── Types ─── */
interface Crop {
  id: string
  crop_name: string
  location: string
  temperature?: number
  soil_moisture?: string
  status: string
  risk_level: string
  last_checked: string
}
interface WeatherInfo {
  temperature: number
  humidity: number
  conditions: string
  wind_speed: number
  location?: string
  forecast: { dt: number; temp: number; conditions: string }[]
}
interface FertResult {
  urea: number; dap: number; mop: number
  nDeficit: number; pDeficit: number; kDeficit: number
  totalCost: string
}
interface YieldResult { crop: string; estYield: number; unit: string; grade: string }

/* ─── Static Data ─── */
const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s
const getCropKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/_$/, '')
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const CROPS = [
  "Bajra (Pearl Millet)", "Barley", "Black Gram (Urad)", "Chickpea (Chana)",
  "Coconut", "Coffee", "Corn (Maize)", "Cotton", "Groundnut (Peanut)",
  "Jowar (Sorghum)", "Jute", "Lentil (Masoor)", "Millet", "Mustard", "Onion",
  "Pigeon Pea (Arhar/Tur)", "Potato", "Ragi (Finger Millet)", "Rice (Paddy)",
  "Sesame", "Soybean", "Sugarcane", "Sunflower", "Tea", "Tomato", "Wheat",
  "Kidney Beans (Rajma)", "Moth Beans", "Mung Bean", "Pomegranate", "Banana",
  "Mango", "Grapes", "Watermelon", "Muskmelon", "Apple", "Orange", "Papaya"
]

// N, P, K requirements in kg/hectare
const NPK: Record<string, [number, number, number]> = {
  "bajra (pearl millet)": [80, 40, 40], "barley": [80, 40, 40],
  "black gram (urad)": [20, 40, 40], "chickpea (chana)": [20, 60, 30],
  "coconut": [100, 60, 200], "coffee": [100, 30, 100],
  "corn (maize)": [180, 80, 80], "cotton": [120, 60, 60],
  "groundnut (peanut)": [25, 60, 30], "jowar (sorghum)": [80, 40, 30],
  "jute": [100, 60, 60], "lentil (masoor)": [20, 40, 20],
  "millet": [60, 30, 30], "mustard": [100, 40, 40],
  "onion": [100, 60, 100], "pigeon pea (arhar/tur)": [20, 60, 30],
  "potato": [150, 80, 150], "ragi (finger millet)": [60, 30, 30],
  "rice (paddy)": [120, 60, 60], "sesame": [30, 30, 30],
  "soybean": [20, 60, 40], "sugarcane": [200, 100, 200],
  "sunflower": [90, 60, 60], "tea": [120, 30, 80],
  "tomato": [150, 60, 200], "wheat": [120, 60, 40],
  "kidney beans (rajma)": [22, 67, 20], "moth beans": [22, 49, 20],
  "mung bean": [22, 47, 20], "pomegranate": [18, 20, 40],
  "banana": [101, 81, 50], "mango": [21, 28, 30],
  "grapes": [24, 133, 201], "watermelon": [99, 18, 51],
  "muskmelon": [100, 18, 50], "apple": [24, 137, 200],
  "orange": [19, 16, 10], "papaya": [49, 60, 50]
}

// Tonnes per hectare (good conditions)
const YIELDS: Record<string, number> = {
  "bajra (pearl millet)": 1.8, "barley": 2.8, "black gram (urad)": 0.8,
  "chickpea (chana)": 1.2, "coconut": 8.0, "coffee": 1.2,
  "corn (maize)": 5.8, "cotton": 1.8, "groundnut (peanut)": 1.8,
  "jowar (sorghum)": 2.0, "jute": 2.1, "lentil (masoor)": 1.0,
  "millet": 1.5, "mustard": 1.5, "onion": 20.0,
  "pigeon pea (arhar/tur)": 1.0, "potato": 20.0, "ragi (finger millet)": 1.8,
  "rice (paddy)": 4.5, "sesame": 0.8, "soybean": 2.5,
  "sugarcane": 70.0, "sunflower": 1.5, "tea": 2.0,
  "tomato": 35.0, "wheat": 3.2,
  "kidney beans (rajma)": 2.0, "moth beans": 0.8, "mung bean": 1.0,
  "pomegranate": 15.0, "banana": 35.0, "mango": 12.0,
  "grapes": 15.0, "watermelon": 35.0, "muskmelon": 20.0,
  "apple": 20.0, "orange": 25.0, "papaya": 50.0
}

/* ─── Component ─── */
export default function CropsOverviewPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, language } = useLanguage()
  const dateLocale = language.includes("Bengali") ? "bn-IN" : language.includes("Hindi") ? "hi-IN" : "en-US"

  const tCrop = (name: string) => {
    if (!name) return "";
    const translated = t(`crop_names.${getCropKey(name)}`);
    return translated.startsWith("crop_names.") ? name : translated;
  }

  // core state
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [crops, setCrops] = useState<Crop[]>([])
  const [weather, setWeather] = useState<WeatherInfo | null>(null)
  const [isLoadingCrops, setIsLoadingCrops] = useState(true)
  const [isLoadingWeather, setIsLoadingWeather] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isPestAlertClosed, setIsPestAlertClosed] = useState(false)
  const [isEditingWeatherLocation, setIsEditingWeatherLocation] = useState(false)
  const [tempWeatherLocation, setTempWeatherLocation] = useState("")

  // search & filter
  const [searchQuery, setSearchQuery] = useState("")
  const [riskFilter, setRiskFilter] = useState<"all" | "low" | "medium" | "high">("all")

  // Add Crop modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newCropName, setNewCropName] = useState("")
  const [isAddCropNameOpen, setIsAddCropNameOpen] = useState(false)
  const addCropNameTriggerRef = useRef<HTMLDivElement>(null)
  const [newCropLocation, setNewCropLocation] = useState("")
  const [isAddingCrop, setIsAddingCrop] = useState(false)

  // Fertilizer Calculator modal
  const [fertOpen, setFertOpen] = useState(false)
  const [fertCrop, setFertCrop] = useState("")
  const [isFertCropOpen, setIsFertCropOpen] = useState(false)
  const fertCropTriggerRef = useRef<HTMLDivElement>(null)
  const [fertDropdownPos, setFertDropdownPos] = useState({ top: 0, left: 0, width: 0 })
  const [fertSize, setFertSize] = useState("")
  const [fertUnit, setFertUnit] = useState<"acres" | "hectares">("hectares")
  const [isFertUnitOpen, setIsFertUnitOpen] = useState(false)
  const fertUnitTriggerRef = useRef<HTMLDivElement>(null)
  const [fertUnitDropdownPos, setFertUnitDropdownPos] = useState({ top: 0, left: 0, width: 0 })
  const [fertN, setFertN] = useState("")  // current soil N g/kg
  const [fertP, setFertP] = useState("")  // current soil P mg/kg
  const [fertK, setFertK] = useState("")  // current soil K mg/kg
  const [fertResult, setFertResult] = useState<FertResult | null>(null)

  // Yield Estimator
  const [yieldCrop, setYieldCrop] = useState("")
  const [isYieldCropOpen, setIsYieldCropOpen] = useState(false)
  const yieldCropTriggerRef = useRef<HTMLDivElement>(null)
  const [yieldCropDropdownPos, setYieldCropDropdownPos] = useState({ top: 0, left: 0, width: 0 })
  const [yieldSize, setYieldSize] = useState("")
  const [yieldUnit, setYieldUnit] = useState<"acres" | "hectares">("hectares")
  const [isYieldUnitOpen, setIsYieldUnitOpen] = useState(false)
  const yieldUnitTriggerRef = useRef<HTMLDivElement>(null)
  const [yieldUnitDropdownPos, setYieldUnitDropdownPos] = useState({ top: 0, left: 0, width: 0 })
  const [yieldResult, setYieldResult] = useState<YieldResult | null>(null)

  useEffect(() => { if (status === "unauthenticated") router.push("/") }, [status, router])
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Lock body scroll when modals are open
  useEffect(() => {
    if (isAddModalOpen || fertOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => { document.body.style.overflow = "unset" }
  }, [isAddModalOpen, fertOpen])

  useEffect(() => {
    if (status === "authenticated") { fetchCrops(); fetchWeather() }
  }, [status])

  useEffect(() => {
    if (status === "authenticated" && !isLoadingCrops) { fetchWeather() }
  }, [language])

  /* ─── Data fetching ─── */
  const fetchCrops = async () => {
    try {
      setIsLoadingCrops(true)
      const res = await fetch(`${API_URL}/api/crops`)
      if (res.ok) setCrops(await res.json())
    } catch (e) { console.error("Failed to fetch crops", e) }
    finally { setIsLoadingCrops(false) }
  }

  const fetchWeather = async () => {
    try {
      setIsLoadingWeather(true)
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
      if (!apiKey) throw new Error("No OpenWeather API key")
      
      let lat = 28.6139, lon = 77.2090
      let customLocUsed = false

      // Check localStorage for custom weather location
      const savedLoc = typeof window !== 'undefined' ? localStorage.getItem("dashboard_location") : null
      if (savedLoc) {
        try {
          const parsed = JSON.parse(savedLoc)
          if (parsed.lat && parsed.lon) {
            lat = parsed.lat
            lon = parsed.lon
            customLocUsed = true
            console.log(`Using saved custom location coordinates: ${lat}, ${lon}`)
          }
        } catch (e) {
          console.error("Error parsing saved location", e)
        }
      }

      // If no custom location, try using coordinates from the first crop that has them
      if (!customLocUsed) {
        const cropWithCoords = crops.find(c => (c as any).latitude && (c as any).longitude)
        if (cropWithCoords) {
          lat = (cropWithCoords as any).latitude
          lon = (cropWithCoords as any).longitude
          customLocUsed = true
          console.log(`Using coordinates from crop ${cropWithCoords.crop_name}: ${lat}, ${lon}`)
        }
      }

      // If still no location, try browser geolocation
      if (!customLocUsed) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000, maximumAge: 0 })
          )
          lat = pos.coords.latitude; lon = pos.coords.longitude
        } catch { console.warn("Geolocation unavailable, using default") }
      }

      const langParam = language.includes("Bengali") ? "bn" : language.includes("Hindi") ? "hi" : "en";
      const base = `https://api.openweathermap.org/data/2.5`
      const params = `lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=${langParam}`
      const [curRes, fcastRes] = await Promise.all([
        fetch(`${base}/weather?${params}`), fetch(`${base}/forecast?${params}`)
      ])
      if (!curRes.ok) throw new Error(`Weather API error: ${curRes.status}`)
      const cur = await curRes.json()
      const forecast: { dt: number; temp: number; conditions: string }[] = []
      if (fcastRes.ok) {
        const fdata = await fcastRes.json()
        const todayStr = new Date().toDateString(); const seen = new Set<string>()
        for (const item of fdata.list as any[]) {
          const date = new Date(item.dt * 1000); const dayStr = date.toDateString()
          if (dayStr === todayStr || seen.has(dayStr)) continue
          seen.add(dayStr)
          forecast.push({ dt: item.dt * 1000, temp: Math.round(item.main.temp * 10) / 10, conditions: capitalize(item.weather[0].description) })
          if (seen.size >= 3) break
        }
      }
      setWeather({ temperature: Math.round(cur.main.temp * 10) / 10, humidity: cur.main.humidity, conditions: capitalize(cur.weather[0].description), wind_speed: Math.round(cur.wind.speed * 3.6 * 10) / 10, location: cur.name, forecast })
    } catch (e) { console.error("Failed to fetch weather", e) }
    finally { setIsLoadingWeather(false) }
  }

  const handleUpdateWeatherLocation = async () => {
    if (!tempWeatherLocation.trim()) return
    setIsLoadingWeather(true)
    try {
      let lat: number | null = null
      let lon: number | null = null
      let displayName = tempWeatherLocation.trim()

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      
      // Try Google Maps Geocoding API if key is present
      if (apiKey && apiKey !== 'your-google-maps-api-key-here' && apiKey.length > 20) {
        try {
          const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(tempWeatherLocation)}&key=${apiKey}`)
          if (response.ok) {
            const data = await response.json()
            if (data.status === 'OK' && data.results && data.results.length > 0) {
              lat = data.results[0].geometry.location.lat
              lon = data.results[0].geometry.location.lng
              displayName = data.results[0].formatted_address
            }
          }
        } catch (err) {
          console.warn("Google geocoding failed for custom weather location:", err)
        }
      }

      // Fallback to Nominatim keyless geocoding
      if (lat === null || lon === null) {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(tempWeatherLocation)}&format=json&limit=1`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'FarmIQ-Crop-Recommendation-App'
          }
        })
        if (response.ok) {
          const data = await response.json()
          if (data && data.length > 0) {
            lat = parseFloat(data[0].lat)
            lon = parseFloat(data[0].lon)
            displayName = data[0].display_name.split(',')[0] // short name
          }
        }
      }

      if (lat !== null && lon !== null) {
        localStorage.setItem("dashboard_location", JSON.stringify({ name: displayName, lat, lon }))
        console.log(`Saved custom location "${displayName}" with coordinates: ${lat}, ${lon}`)
        setIsEditingWeatherLocation(false)
        setTempWeatherLocation("")
        await fetchWeather()
      } else {
        alert("Location not found. Please try another query.")
      }
    } catch (e) {
      console.error("Error setting custom location", e)
    } finally {
      setIsLoadingWeather(false)
    }
  }

  const handleSignOut = async () => {
    setIsSigningOut(true); clearAllCookies()
    await signOut({ callbackUrl: "/", redirect: true })
  }

  /* ─── Add Crop ─── */
  const handleAddCrop = async () => {
    if (!newCropName || !newCropLocation) return
    setIsAddingCrop(true)

    let lat: number | null = null
    let lon: number | null = null

    try {
      console.log(`Geocoding crop location: "${newCropLocation}"`)
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      
      // Try Google Maps Geocoding API if key is present
      if (apiKey && apiKey !== 'your-google-maps-api-key-here' && apiKey.length > 20) {
        try {
          const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(newCropLocation)}&key=${apiKey}`)
          if (response.ok) {
            const data = await response.json()
            if (data.status === 'OK' && data.results && data.results.length > 0) {
              lat = data.results[0].geometry.location.lat
              lon = data.results[0].geometry.location.lng
            }
          }
        } catch (err) {
          console.warn("Google geocoding failed for crop:", err)
        }
      }

      // Fallback to Nominatim keyless geocoding
      if (lat === null || lon === null) {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(newCropLocation)}&format=json&limit=1`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'FarmIQ-Crop-Recommendation-App'
          }
        })
        if (response.ok) {
          const data = await response.json()
          if (data && data.length > 0) {
            lat = parseFloat(data[0].lat)
            lon = parseFloat(data[0].lon)
          }
        }
      }
    } catch (e) {
      console.warn("Geocoding failed, sending null coordinates:", e)
    }

    try {
      const res = await fetch(`${API_URL}/api/crops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          crop_name: newCropName, 
          location: newCropLocation, 
          latitude: lat, 
          longitude: lon 
        })
      })
      if (res.ok) {
        await fetchCrops()
        setIsAddModalOpen(false); setNewCropName(""); setNewCropLocation("")
      }
    } catch (e) { console.error("Failed to add crop", e) }
    finally { setIsAddingCrop(false) }
  }

  /* ─── Delete Crop ─── */
  const handleDeleteCrop = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/crops/${id}`, { method: "DELETE" })
      if (res.ok) {
        setCrops(prev => prev.filter(crop => crop.id !== id))
      }
    } catch (e) {
      console.error("Failed to delete crop", e)
    }
  }

  /* ─── Fertilizer Calculator ─── */
  const calcFertilizer = () => {
    const key = fertCrop.toLowerCase()
    const [reqN, reqP, reqK] = NPK[key] ?? [100, 50, 50]
    const ha = fertUnit === "acres" ? parseFloat(fertSize || "1") * 0.4047 : parseFloat(fertSize || "1")
    const curN = parseFloat(fertN || "0") * 10   // g/kg → kg/ha approx conversion
    const curP = parseFloat(fertP || "0") * 0.5  // mg/kg → kg/ha approx
    const curK = parseFloat(fertK || "0") * 0.5

    const nDeficit = Math.max(0, reqN - curN) * ha
    const pDeficit = Math.max(0, reqP - curP) * ha
    const kDeficit = Math.max(0, reqK - curK) * ha

    // Urea = 46% N, DAP = 18%N + 46%P₂O₅, MOP = 60%K₂O
    const urea = Math.round((nDeficit / 0.46) * 10) / 10
    const dap = Math.round((pDeficit / 0.46) * 10) / 10
    const mop = Math.round((kDeficit / 0.60) * 10) / 10
    const cost = ((urea * 6) + (dap * 30) + (mop * 20)).toFixed(0)
    setFertResult({ urea, dap, mop, nDeficit: Math.round(nDeficit), pDeficit: Math.round(pDeficit), kDeficit: Math.round(kDeficit), totalCost: cost })
  }

  /* ─── Yield Estimator ─── */
  const calcYield = () => {
    if (!yieldCrop || !yieldSize) return
    const ha = yieldUnit === "acres" ? parseFloat(yieldSize) * 0.4047 : parseFloat(yieldSize)
    const base = YIELDS[yieldCrop.toLowerCase()] ?? 2.0
    const est = Math.round(base * ha * 10) / 10
    const grade = base >= 10 ? "High-value crop" : base >= 3 ? "Good yield potential" : "Moderate yield"
    setYieldResult({ crop: yieldCrop, estYield: est, unit: "tonnes", grade })
  }

  /* ─── Pest Alerts ─── */
  const pestAlerts = useMemo(() => {
    if (!weather) return []
    const a: { title: string; level: "high" | "medium"; icon: string; desc: string; action: string }[] = []
    if (weather.humidity > 70 && weather.temperature > 20)
      a.push({ title: "Fungal Disease Risk", level: "high", icon: "🍄", desc: `High humidity (${weather.humidity}%) + warm temp (${weather.temperature}°C) — ideal for blight, mildew, and rust.`, action: "Apply preventive fungicide. Improve air circulation between plants." })
    if (weather.humidity < 45 && weather.temperature > 30)
      a.push({ title: "Spider Mite Risk", level: "high", icon: "🕷️", desc: `Hot (${weather.temperature}°C) + dry (${weather.humidity}%) conditions favour mite infestations.`, action: "Spray neem oil or miticide. Increase irrigation frequency." })
    if (weather.temperature > 38)
      a.push({ title: "Extreme Heat Stress", level: "high", icon: "🌡️", desc: `Temperature ${weather.temperature}°C exceeds safe limits for most crops.`, action: "Mulch soil surface. Irrigate in early morning or evening. Use shade nets." })
    if (weather.humidity > 75 && weather.temperature < 18)
      a.push({ title: "Bacterial Leaf Spot Risk", level: "medium", icon: "🦠", desc: `Cool (${weather.temperature}°C), moist (${weather.humidity}%) conditions promote bacterial infections.`, action: "Avoid overhead watering. Ensure good field drainage. Apply copper-based spray." })
    if (weather.wind_speed > 50)
      a.push({ title: "High Wind — Physical Damage", level: "medium", icon: "💨", desc: `Wind speed ${weather.wind_speed} km/h may lodge or snap plants.`, action: "Stake tall crops. Delay spraying operations. Check for lodging." })
    return a
  }, [weather])

  /* ─── Helpers ─── */
  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "low": return "text-green-700 bg-green-100 border-green-200"
      case "medium": return "text-yellow-700 bg-yellow-100 border-yellow-200"
      case "high": return "text-red-700 bg-red-100 border-red-200"
      default: return "text-gray-700 bg-gray-100 border-gray-200"
    }
  }
  const getRiskIcon = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "low": return <CheckCircle size={14} />
      case "medium": return <AlertTriangle size={14} />
      case "high": return <AlertTriangle size={14} />
      default: return <Clock size={14} />
    }
  }
  const stats = {
    total: crops.length,
    healthy: crops.filter(c => c.risk_level?.toLowerCase() === "low").length,
    warning: crops.filter(c => c.risk_level?.toLowerCase() === "medium").length,
    critical: crops.filter(c => c.risk_level?.toLowerCase() === "high").length,
  }
  const greeting = () => {
    const h = currentTime.getHours()
    if (h < 12) return t("crops.good_morning"); if (h < 17) return t("crops.good_afternoon"); return t("crops.good_evening")
  }

  // Filtered crops
  const filteredCrops = useMemo(() => crops.filter(crop => {
    const q = searchQuery.toLowerCase()
    const matchSearch = !q || crop.crop_name.toLowerCase().includes(q) || crop.location.toLowerCase().includes(q)
    const matchRisk = riskFilter === "all" || crop.risk_level?.toLowerCase() === riskFilter
    return matchSearch && matchRisk
  }), [crops, searchQuery, riskFilter])

  if (status === "loading") return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
    </div>
  )
  if (!session) return null
  const firstName = session.user?.name?.split(" ")[0] || "Farmer"

  return (
    <div className="relative min-h-[calc(100vh-4rem)] transition-colors duration-300 overflow-x-hidden">
      {/* Fixed Background Layer */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat bg-gray-50 dark:bg-gray-950 z-[-2]"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=80')" }}
      />
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[6px] pointer-events-none z-[-1]" />
      <div className="relative z-10">


        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{greeting()}, {firstName}! 👋</h1>
              <p className="text-white/80 text-sm mt-1">
                {currentTime.toLocaleDateString(dateLocale, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link href="/">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm">
                  <Sprout size={16} className="text-green-600" /> {t("crops.get_recommendations") || "Get Recommendations"}
                </button>
              </Link>
              <button onClick={() => setFertOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-sm font-medium text-white transition-all shadow-sm">
                <FlaskConical size={16} /> {t("crops.fertilizer_calc")}
              </button>
              <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium text-white transition-all shadow-sm">
                <Plus size={16} /> {t("crops.add_crop")}
              </button>
            </div>
          </div>

          {/* ── Pest/Disease Alert Banner ── */}
          {pestAlerts.length > 0 && (
            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                isPestAlertClosed ? "max-h-0 opacity-0 !m-0" : "max-h-[800px] opacity-100"
              }`}
            >
              <div className="rounded-xl overflow-hidden border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/40 relative group">
                <button
                  onClick={() => setIsPestAlertClosed(true)}
                  className="absolute top-3 right-3 p-1 rounded-full bg-orange-200/50 dark:bg-orange-800/50 text-orange-800 dark:text-orange-200 opacity-0 group-hover:opacity-100 transition-all hover:bg-orange-300/50 dark:hover:bg-orange-700/50 z-10"
                  aria-label="Close Alert"
                >
                  <X size={16} />
                </button>
                <div className="px-5 py-3 bg-orange-100 dark:bg-orange-900/40 flex items-center gap-2 pr-10">
                  <Bug size={16} className="text-orange-700 dark:text-orange-400" />
                  <span className="font-semibold text-orange-800 dark:text-orange-300 text-sm">
                    {pestAlerts.length} Pest &amp; Disease Alert{pestAlerts.length > 1 ? "s" : ""} — Based on current weather conditions
                  </span>
                </div>
                <div>
                  {pestAlerts.map((alert, i) => (
                    <div key={i} className="px-5 py-3 flex items-start gap-3">
                      <span className="text-xl mt-0.5">{alert.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-sm text-gray-900 dark:text-white">{alert.title}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${alert.level === "high" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
                            {alert.level.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{alert.desc}</p>
                        <p className="text-xs text-green-700 dark:text-green-400 mt-1 font-medium">💡 {alert.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Stats Row ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: t("crops.total_crops"), value: stats.total, icon: Sprout, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
              { label: t("crops.healthy"), value: stats.healthy, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
              { label: t("crops.needs_attention"), value: stats.warning, icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
              { label: t("crops.critical"), value: stats.critical, icon: Activity, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-center gap-4">
                <div className={`${bg} p-3 rounded-xl`}><Icon className={`${color} w-6 h-6`} /></div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{isLoadingCrops ? "—" : value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left: Crops List ── */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                {/* Card header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Sprout size={18} className="text-green-600" /> {t("crops.my_crops")}
                    </h2>
                  </div>
                  {/* ── Search & Filter ── */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder={t("crops.search_placeholder")}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {(["all", "low", "medium", "high"] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => setRiskFilter(f)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${riskFilter === f
                              ? f === "all" ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                                : f === "low" ? "bg-green-600 text-white"
                                  : f === "medium" ? "bg-yellow-500 text-white"
                                    : "bg-red-600 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            }`}
                        >
                          {t(`crops.filter_${f}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Crops List */}
                <div className="divide-y divide-gray-50 dark:divide-gray-800 h-[350px] overflow-y-auto hide-scrollbar">
                  {isLoadingCrops ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                    </div>
                  ) : filteredCrops.length === 0 ? (
                    <div className="text-center py-14 px-6">
                      <Sprout className="mx-auto mb-3 text-gray-300 dark:text-gray-600" size={44} />
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        {crops.length === 0 ? t("crops.no_crops") : "No crops match your search"}
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm mt-1 mb-4">
                        {crops.length === 0 ? t("crops.add_first_crop") : "Try adjusting your search or filter"}
                      </p>
                      {crops.length === 0 && (
                        <button onClick={() => setIsAddModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all">
                          <Plus size={16} /> {t("crops.add_crop")}
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredCrops.map((crop) => (
                      <div key={crop.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                            <Leaf size={16} className="text-green-600 dark:text-green-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">{tCrop(crop.crop_name)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                              <MapPin size={11} /> {crop.location}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0 ml-4">
                          {crop.temperature && (
                            <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Thermometer size={13} className="text-orange-500" />{crop.temperature}°C
                            </div>
                          )}
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getRiskColor(crop.risk_level)}`}>
                            {getRiskIcon(crop.risk_level)} {t(`crops.risk_${crop.risk_level?.toLowerCase() || 'low'}`)}
                          </span>
                          <button className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-full transition-all duration-200" title="Delete Crop" onClick={(e) => { e.stopPropagation(); handleDeleteCrop(crop.id); }}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* ── Yield Estimator Card ── */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                  <Wheat size={18} className="text-amber-500" />
                  <h2 className="font-semibold text-gray-900 dark:text-white">{t("crops.yield_estimator")}</h2>
                </div>
                <div className="p-6">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    {t("crops.yield_estimator_desc")}
                  </p>
                  {/* Row 1: Crop + Field size + Unit */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-3">
                    {/* Custom Crop dropdown */}
                    <div className="relative flex-1 min-w-0" ref={yieldCropTriggerRef}>
                      <div
                        onClick={() => setIsYieldCropOpen(!isYieldCropOpen)}
                        className="w-full flex items-center justify-between pl-3 pr-9 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm cursor-pointer select-none transition-colors hover:border-amber-400"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Search size={14} className="text-gray-400 shrink-0" />
                          <span className={`truncate ${yieldCrop ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                            {yieldCrop ? tCrop(yieldCrop) : t("crops.select_crop")}
                          </span>
                        </div>
                      </div>
                      <ChevronDown
                        size={13}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform duration-200 ${isYieldCropOpen ? 'rotate-180' : ''}`}
                      />

                      {/* Dropdown panel */}
                      {isYieldCropOpen && (
                        <>
                          <div className="fixed inset-0 z-[60]" onClick={() => setIsYieldCropOpen(false)} />
                           <div
                            className="absolute z-[61] bottom-full mb-1.5 left-0 w-full rounded-2xl border border-white/60 dark:border-gray-700 bg-white/90 dark:bg-gray-800/95 backdrop-blur-md shadow-2xl overflow-hidden"
                          >
                            <div className="max-h-60 overflow-y-auto py-1.5 hide-scrollbar">
                              {CROPS.map((crop) => (
                                <div
                                  key={crop}
                                  onClick={() => { setYieldCrop(crop); setYieldResult(null); setIsYieldCropOpen(false) }}
                                  className={`px-4 py-2.5 text-sm text-center cursor-pointer transition-colors ${yieldCrop === crop
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

                    {/* Field size + Unit */}
                    <div className="flex gap-2 shrink-0">
                      <div className="relative w-32 shrink-0">
                        <input
                          type="number" min="0.1" step="0.1"
                          placeholder={t("crops.field_size")}
                          value={yieldSize}
                          onChange={e => { setYieldSize(e.target.value); setYieldResult(null) }}
                          className="fert-input w-full pl-3 pr-8 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-amber-400"
                        />
                        <div className="absolute right-2 inset-y-0 flex flex-col items-center justify-center gap-0.5 pointer-events-none">
                          <button type="button" className="pointer-events-auto text-gray-400 hover:text-gray-200 transition-colors leading-none" onClick={() => setYieldSize(v => String(Math.round((parseFloat(v || '0') + 0.1) * 10) / 10))}>
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor"><path d="M5 0L10 6H0L5 0Z" /></svg>
                          </button>
                          <button type="button" className="pointer-events-auto text-gray-400 hover:text-gray-200 transition-colors leading-none" onClick={() => setYieldSize(v => String(Math.max(0.1, Math.round((parseFloat(v || '0.1') - 0.1) * 10) / 10)))}>
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor"><path d="M5 6L0 0H10L5 6Z" /></svg>
                          </button>
                        </div>
                      </div>
                      <div className="relative shrink-0 w-16" ref={yieldUnitTriggerRef}>
                        <div
                          onClick={() => setIsYieldUnitOpen(!isYieldUnitOpen)}
                          className="w-full flex items-center justify-between pl-3 pr-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm cursor-pointer select-none transition-colors hover:border-amber-400"
                        >
                          <span className="text-gray-900 dark:text-white font-medium">
                            {yieldUnit === "hectares" ? "ha" : "ac"}
                          </span>
                          <ChevronDown
                            size={12}
                            className={`text-gray-400 transition-transform duration-200 ${isYieldUnitOpen ? 'rotate-180' : ''}`}
                          />
                        </div>

                        {isYieldUnitOpen && (
                          <>
                            <div className="fixed inset-0 z-[60]" onClick={() => setIsYieldUnitOpen(false)} />
                            <div
                              className="absolute z-[61] top-full mt-1.5 left-0 w-full rounded-2xl border border-white/60 dark:border-gray-700 bg-white/90 dark:bg-gray-800/95 backdrop-blur-md shadow-2xl overflow-hidden"
                            >
                              <div className="py-1.5 hide-scrollbar">
                                {(["hectares", "acres"] as const).map(unit => (
                                  <div
                                    key={unit}
                                    onClick={() => { setYieldUnit(unit); setIsYieldUnitOpen(false) }}
                                    className={`px-4 py-2.5 text-sm text-center cursor-pointer transition-colors ${yieldUnit === unit
                                        ? 'bg-green-600/10 text-green-700 dark:text-green-400 font-semibold'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-green-700 dark:hover:text-green-400'
                                      }`}
                                  >
                                    {unit === "hectares" ? "ha" : "ac"}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Calculate button — full width */}
                  <button
                    onClick={calcYield}
                    disabled={!yieldCrop || !yieldSize}
                    className="w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed mb-4"
                  >
                    {t("crops.calculate_yield")}
                  </button>
                  {yieldResult && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-amber-900 dark:text-amber-200">{tCrop(yieldResult.crop)}</p>
                        <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">{yieldResult.grade}</span>
                      </div>
                      <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">{yieldResult.estYield} <span className="text-lg font-normal">{yieldResult.unit}</span></p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{yieldUnit === "hectares" ? t("crops.estimated_yield_for_ha") : t("crops.estimated_yield_for_ac")}{yieldSize} {yieldUnit === "hectares" ? t("crops.hectares") : t("crops.acres")}{t("crops.estimated_yield_under_good_conditions")}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Right Sidebar ── */}
            <div className="space-y-6">
              {/* Weather Card */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm text-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold flex items-center gap-2 flex-1 mr-2">
                    <CloudSun size={18} className="shrink-0" />
                    {isEditingWeatherLocation ? (
                      <input
                        type="text"
                        value={tempWeatherLocation}
                        onChange={(e) => setTempWeatherLocation(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdateWeatherLocation()
                          if (e.key === 'Escape') setIsEditingWeatherLocation(false)
                        }}
                        placeholder="Search location..."
                        className="text-xs px-2 py-1 rounded bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-1 focus:ring-white w-full max-w-[130px]"
                        autoFocus
                      />
                    ) : (
                      <span 
                        onClick={() => {
                          setTempWeatherLocation(weather?.location || "")
                          setIsEditingWeatherLocation(true)
                        }}
                        className="text-xs font-normal text-blue-200 hover:text-white flex items-center gap-1 cursor-pointer transition-colors bg-white/10 px-2 py-1 rounded-md"
                        title="Click to edit location"
                      >
                        <MapPin size={11} />
                        <span className="max-w-[100px] truncate">{weather?.location || "Detecting..."}</span>
                        <span className="text-[10px] text-blue-300">✎</span>
                      </span>
                    )}
                  </h2>
                  <button onClick={fetchWeather} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors shrink-0"><RefreshCw size={14} /></button>
                </div>
                {isLoadingWeather ? (
                  <div className="flex items-center justify-center py-6"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/60" /></div>
                ) : weather ? (
                  <>
                    <div className="mb-4">
                      <p className="text-4xl font-bold">{weather.temperature}°C</p>
                      <p className="text-blue-100 text-sm mt-1">{weather.conditions}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white/15 rounded-lg p-3">
                        <Droplets size={16} className="mb-1 text-blue-100" />
                        <p className="text-xs text-blue-100">{t("crops.humidity")}</p>
                        <p className="font-semibold">{weather.humidity}%</p>
                      </div>
                      <div className="bg-white/15 rounded-lg p-3">
                        <Wind size={16} className="mb-1 text-blue-100" />
                        <p className="text-xs text-blue-100">{t("crops.wind")}</p>
                        <p className="font-semibold">{weather.wind_speed} km/h</p>
                      </div>
                    </div>
                    {weather.forecast && (
                      <div className="space-y-2">
                        {weather.forecast.map((f, i) => (
                          <div key={f.dt} className="flex items-center justify-between text-sm bg-white/10 rounded-lg px-3 py-2">
                            <span className="text-blue-100">{i === 0 ? t("crops.tomorrow") : new Date(f.dt).toLocaleDateString(dateLocale, { weekday: "short" })}</span>
                            <span className="font-medium">{f.temp}°C</span>
                            <span className="text-blue-200 text-xs">{f.conditions}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-blue-100 text-sm py-4 text-center">{t("crops.weather_unavailable")}</p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-green-600" /> {t("crops.quick_actions")}
                </h2>
                <div className="space-y-2">
                  {[
                    { label: t("crops.qa_get_recs"), href: "/", icon: Sprout, color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
                    { label: t("crops.qa_profile"), href: "/profile", icon: User, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" },
                    { label: t("crops.qa_about"), href: "/about", icon: BarChart3, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
                    { label: t("crops.qa_contact"), href: "/contact", icon: Activity, color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20" },
                  ].map(({ label, href, icon: Icon, color }) => (
                    <Link key={label} href={href}>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
                        <div className={`p-2 rounded-lg ${color}`}><Icon size={16} /></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{label}</span>
                        <ArrowRight size={14} className="ml-auto text-gray-400 group-hover:text-gray-600" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Farm Health Overview ── */}
          {crops.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity size={18} className="text-green-600" /> {t("crops.crop_status_overview")}
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>{t("crops.overall_farm_health")}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.round((stats.healthy / stats.total) * 100)}{t("crops.percent_healthy")}
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden flex">
                  {stats.healthy > 0 && <div className="bg-green-500 h-3 transition-all" style={{ width: `${(stats.healthy / stats.total) * 100}%` }} />}
                  {stats.warning > 0 && <div className="bg-yellow-400 h-3 transition-all" style={{ width: `${(stats.warning / stats.total) * 100}%` }} />}
                  {stats.critical > 0 && <div className="bg-red-500 h-3 transition-all" style={{ width: `${(stats.critical / stats.total) * 100}%` }} />}
                </div>
                <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> {t("crops.healthy_label")} ({stats.healthy})</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> {t("crops.warning_label")} ({stats.warning})</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> {t("crops.critical_label")} ({stats.critical})</span>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ══════════════════════════════════════════════════
          ADD CROP MODAL
      ══════════════════════════════════════════════════ */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-sm" onClick={() => { setIsAddModalOpen(false); setIsAddCropNameOpen(false); }}>
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><Plus size={18} className="text-green-600" /> {t("crops.add_crop")}</h2>
                <button onClick={() => { setIsAddModalOpen(false); setIsAddCropNameOpen(false); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("crops.crop_name")}</label>
                  {/* Custom dropdown */}
                  <div className="relative" ref={addCropNameTriggerRef}>
                    <div
                      onClick={() => setIsAddCropNameOpen(!isAddCropNameOpen)}
                      className="w-full flex items-center justify-between pl-3 pr-8 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm cursor-pointer select-none transition-colors hover:border-green-500"
                    >
                      <span className={`truncate ${newCropName ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                        {newCropName ? tCrop(newCropName) : t("crops.select_a_crop") || "Select a crop..."}
                      </span>
                    </div>
                    <ChevronDown
                      size={14}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform duration-200 ${isAddCropNameOpen ? 'rotate-180' : ''}`}
                    />

                    {isAddCropNameOpen && (
                      <>
                        <div className="fixed inset-0 z-[60]" onClick={() => setIsAddCropNameOpen(false)} />
                        <div
                          className="absolute z-[61] top-full mt-1.5 left-0 w-full rounded-2xl border border-white/60 dark:border-gray-700 bg-white/90 dark:bg-gray-800/95 backdrop-blur-md shadow-2xl overflow-hidden"
                        >
                          <div className="max-h-60 overflow-y-auto py-1.5 hide-scrollbar">
                            {CROPS.map((crop) => (
                              <div
                                key={crop}
                                onClick={() => { setNewCropName(crop); setIsAddCropNameOpen(false) }}
                                className={`px-4 py-2.5 text-sm text-center cursor-pointer transition-colors ${newCropName === crop
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("crops.location")}</label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="e.g. North Field, Punjab" value={newCropLocation} onChange={e => setNewCropLocation(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddCrop()} className="w-full pl-9 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => { setIsAddModalOpen(false); setIsAddCropNameOpen(false); }} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">{t("crops.cancel")}</button>
                <button onClick={handleAddCrop} disabled={!newCropName || !newCropLocation || isAddingCrop} className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {isAddingCrop ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> {t("crops.saving")}</> : <><Plus size={16} /> {t("crops.save_crop")}</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
          FERTILIZER CALCULATOR MODAL
      ══════════════════════════════════════════════════ */}
        {fertOpen && (
          <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 overflow-y-auto bg-black/60 backdrop-blur-sm" onClick={() => { setFertOpen(false); setFertResult(null) }}>
            <div className="relative bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <FlaskConical size={18} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    {t("crops.fertilizer_calc")}
                  </h2>
                </div>
                <button onClick={() => { setFertOpen(false); setFertResult(null) }} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Crop + Field Size */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="min-w-0">
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">{t("crops.crop_label")}</label>

                    {/* Custom glassmorphism dropdown — fixed-positioned to escape modal overflow */}
                    <div className="relative" ref={fertCropTriggerRef}>
                      {/* Trigger */}
                      <div
                        onClick={() => setIsFertCropOpen(!isFertCropOpen)}
                        className="w-full flex items-center justify-between pl-3 pr-8 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs cursor-pointer select-none transition-colors hover:border-amber-400"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Search size={14} className="text-gray-400 shrink-0" />
                          <span className={`truncate ${fertCrop ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                            {fertCrop ? tCrop(fertCrop) : t("crops.select_crop") || "Select crop…"}
                          </span>
                        </div>
                      </div>
                      <ChevronDown
                        size={13}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform duration-200 ${isFertCropOpen ? 'rotate-180' : ''}`}
                      />

                      {/* Dropdown panel — fixed so it escapes modal clipping */}
                      {isFertCropOpen && (
                        <>
                          <div className="fixed inset-0 z-[60]" onClick={() => setIsFertCropOpen(false)} />
                          <div
                            className="absolute z-[61] top-full mt-1.5 left-0 w-full rounded-2xl border border-white/60 dark:border-gray-700 bg-white/90 dark:bg-gray-800/95 backdrop-blur-md shadow-2xl overflow-hidden"
                          >
                            <div className="max-h-72 overflow-y-auto py-1.5 hide-scrollbar">
                              {CROPS.map((crop) => (
                                <div
                                  key={crop}
                                  onClick={() => { setFertCrop(crop); setFertResult(null); setIsFertCropOpen(false) }}
                                  className={`px-4 py-2.5 text-sm text-center cursor-pointer transition-colors ${fertCrop === crop
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

                  <div className="min-w-0">
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">{t("crops.field_size")}</label>
                    <div className="flex gap-1">
                      <div className="relative flex-1 min-w-0 w-0">
                        <input
                          type="number" min="0.1" step="0.1" placeholder={t("crops.size_placeholder")}
                          value={fertSize}
                          onChange={e => { setFertSize(e.target.value); setFertResult(null) }}
                          className="fert-input w-full pl-2 pr-6 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-xs"
                        />
                        <div className="absolute right-1.5 inset-y-0 flex flex-col items-center justify-center gap-0.5 pointer-events-none">
                          <button type="button" className="pointer-events-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors leading-none" onClick={() => setFertSize(v => String(Math.round((parseFloat(v || '0') + 0.1) * 10) / 10))}>
                            <svg width="8" height="5" viewBox="0 0 10 6" fill="currentColor"><path d="M5 0L10 6H0L5 0Z" /></svg>
                          </button>
                          <button type="button" className="pointer-events-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors leading-none" onClick={() => setFertSize(v => String(Math.max(0.1, Math.round((parseFloat(v || '0.1') - 0.1) * 10) / 10)))}>
                            <svg width="8" height="5" viewBox="0 0 10 6" fill="currentColor"><path d="M5 6L0 0H10L5 6Z" /></svg>
                          </button>
                        </div>
                      </div>

                      {/* Custom unit dropdown */}
                      <div className="relative shrink-0 w-16" ref={fertUnitTriggerRef}>
                        <div
                          onClick={() => setIsFertUnitOpen(!isFertUnitOpen)}
                          className="w-full flex items-center justify-between pl-2 pr-0.5 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs cursor-pointer select-none transition-colors hover:border-amber-400"
                        >
                          <span className="text-gray-900 dark:text-white font-medium">
                            {fertUnit === "hectares" ? "ha" : "ac"}
                          </span>
                          <ChevronDown
                            size={11}
                            className={`text-gray-400 transition-transform duration-200 ${isFertUnitOpen ? 'rotate-180' : ''}`}
                          />
                        </div>

                        {isFertUnitOpen && (
                          <>
                            <div className="fixed inset-0 z-[60]" onClick={() => setIsFertUnitOpen(false)} />
                            <div
                              className="absolute z-[61] top-full mt-1.5 left-0 w-full rounded-2xl border border-white/60 dark:border-gray-700 bg-white/90 dark:bg-gray-800/95 backdrop-blur-md shadow-2xl overflow-hidden"
                            >
                              <div className="py-1.5 hide-scrollbar">
                                {(["hectares", "acres"] as const).map(unit => (
                                  <div
                                    key={unit}
                                    onClick={() => { setFertUnit(unit); setIsFertUnitOpen(false) }}
                                    className={`px-4 py-2.5 text-sm text-center cursor-pointer transition-colors ${fertUnit === unit
                                        ? 'bg-green-600/10 text-green-700 dark:text-green-400 font-semibold'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-green-700 dark:hover:text-green-400'
                                      }`}
                                  >
                                    {unit === "hectares" ? "ha" : "ac"}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Soil NPK */}
                <div>
                  <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    {t("crops.current_soil_nutrients")} <span className="font-normal text-gray-400 text-[10px]">{t("crops.leave_blank_defaults")}</span>
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: t("crops.nitrogen_label"), hint: "g/kg", val: fertN, set: setFertN },
                      { label: t("crops.phosphorus_label"), hint: "mg/kg", val: fertP, set: setFertP },
                      { label: t("crops.potassium_label"), hint: "mg/kg", val: fertK, set: setFertK },
                    ].map(({ label, hint, val, set }) => (
                      <div key={label} className="min-w-0">
                        <div className="flex flex-col justify-end min-h-[36px] mb-1">
                          <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 leading-tight">
                            {label}
                          </span>
                          <span className="text-[9px] text-gray-400 leading-none mt-0.5">
                            ({hint})
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            type="number" min="0" step="0.1" placeholder="0"
                            value={val}
                            onChange={e => { set(e.target.value); setFertResult(null) }}
                            className="fert-input w-full pl-2 pr-6 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                          <div className="absolute right-1.5 inset-y-0 flex flex-col items-center justify-center gap-0.5 pointer-events-none">
                            <button type="button" className="pointer-events-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors leading-none" onClick={() => set(v => String(Math.round((parseFloat(v || '0') + 0.1) * 10) / 10))}>
                              <svg width="8" height="5" viewBox="0 0 10 6" fill="currentColor"><path d="M5 0L10 6H0L5 0Z" /></svg>
                            </button>
                            <button type="button" className="pointer-events-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors leading-none" onClick={() => set(v => String(Math.max(0, Math.round((parseFloat(v || '0') - 0.1) * 10) / 10)))}>
                              <svg width="8" height="5" viewBox="0 0 10 6" fill="currentColor"><path d="M5 6L0 0H10L5 6Z" /></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={calcFertilizer} disabled={!fertCrop || !fertSize} className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  <Calculator size={14} /> {t("crops.calc_fert_req")}
                </button>

                {/* Results */}
                {fertResult && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                      <CheckCircle size={16} className="text-green-500" />
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">{t("crops.recommended_fert")} {tCrop(fertCrop)}</span>
                    </div>

                    {/* Fertilizer amounts */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { name: "Urea", amount: fertResult.urea, desc: "46% N", color: "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300" },
                        { name: "DAP", amount: fertResult.dap, desc: "46% P₂O₅", color: "bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800 text-purple-700 dark:text-purple-300" },
                        { name: "MOP", amount: fertResult.mop, desc: "60% K₂O", color: "bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800 text-orange-700 dark:text-orange-300" },
                      ].map(({ name, amount, desc, color }) => (
                        <div key={name} className={`p-2 rounded-lg border ${color}`}>
                          <p className="text-[10px] font-medium opacity-75">{name}</p>
                          <p className="text-lg font-bold mt-0.5">{amount} <span className="text-[10px] font-normal">kg</span></p>
                        </div>
                      ))}
                    </div>

                    {/* Nutrient deficits */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">{t("crops.nutrient_deficit")}</p>
                      <p>🔵 {t("crops.n_deficit")}: <span className="font-semibold text-gray-900 dark:text-white">{fertResult.nDeficit} kg</span></p>
                      <p>🟣 {t("crops.p_deficit")}: <span className="font-semibold text-gray-900 dark:text-white">{fertResult.pDeficit} kg</span></p>
                      <p>🟠 {t("crops.k_deficit")}: <span className="font-semibold text-gray-900 dark:text-white">{fertResult.kDeficit} kg</span></p>
                    </div>

                    <p className="text-[10px] text-gray-400 dark:text-gray-500 italic">
                      {t("crops.fert_disclaimer")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
