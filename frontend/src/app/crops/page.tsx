"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { clearAllCookies } from "@/lib/clearCookies"
import {
  Leaf, Sprout, CloudSun, BarChart3, MapPin, Thermometer,
  Droplets, AlertTriangle, CheckCircle, Clock, Plus, TrendingUp,
  Wind, Activity, ArrowRight, RefreshCw
} from "lucide-react"

interface Crop {
  id: number
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
  forecast: { day: string; temp: number; conditions: string }[]
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function CropsOverviewPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [crops, setCrops] = useState<Crop[]>([])
  const [weather, setWeather] = useState<WeatherInfo | null>(null)
  const [isLoadingCrops, setIsLoadingCrops] = useState(true)
  const [isLoadingWeather, setIsLoadingWeather] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (status === "authenticated") {
      fetchCrops()
      fetchWeather()
    }
  }, [status])

  const fetchCrops = async () => {
    try {
      setIsLoadingCrops(true)
      const res = await fetch(`${API_URL}/api/crops`)
      if (res.ok) setCrops(await res.json())
    } catch (e) {
      console.error("Failed to fetch crops", e)
    } finally {
      setIsLoadingCrops(false)
    }
  }

  const fetchWeather = async () => {
    try {
      setIsLoadingWeather(true)
      const res = await fetch(`${API_URL}/api/weather/kolkata`)
      if (res.ok) setWeather(await res.json())
    } catch (e) {
      console.error("Failed to fetch weather", e)
    } finally {
      setIsLoadingWeather(false)
    }
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    clearAllCookies()
    await signOut({ callbackUrl: "/", redirect: true })
  }

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
    if (h < 12) return "Good morning"
    if (h < 17) return "Good afternoon"
    return "Good evening"
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    )
  }

  if (!session) return null

  const firstName = session.user?.name?.split(" ")[0] || "Farmer"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-600">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C11.5 2 11 2.19 10.59 2.59L10 3.17L9.41 2.59C9 2.19 8.5 2 8 2C6.89 2 6 2.89 6 4C6 4.5 6.19 5 6.59 5.41L11.29 10.11C11.68 10.5 12.32 10.5 12.71 10.11L17.41 5.41C17.81 5 18 4.5 18 4C18 2.89 17.11 2 16 2C15.5 2 15 2.19 14.59 2.59L14 3.17L13.41 2.59C13 2.19 12.5 2 12 2M12 12C11.45 12 11 12.45 11 13V21C11 21.55 11.45 22 12 22C12.55 22 13 21.55 13 21V13C13 12.45 12.55 12 12 12Z"/>
                </svg>
              </div>
              <span className="text-xl font-semibold text-gray-900">FarmIQ</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-700 hover:text-green-600 transition-colors font-medium">Home</Link>
              <Link href="/crops" className="text-green-600 font-medium">Crops</Link>
              <Link href="/about" className="text-gray-700 hover:text-green-600 transition-colors font-medium">About</Link>
              <Link href="/contact" className="text-gray-700 hover:text-green-600 transition-colors font-medium">Contact</Link>
            </div>
            <div className="flex items-center gap-4">
              {session.user?.image && (
                <img src={session.user.image} alt={session.user.name || ""} className="w-8 h-8 rounded-full ring-2 ring-green-100" />
              )}
              <span className="text-sm font-medium text-gray-900">{session.user?.name}</span>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSigningOut ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                )}
                <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{greeting()}, {firstName}! 👋</h1>
            <p className="text-gray-500 text-sm mt-1">
              {currentTime.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
                <Sprout size={16} className="text-green-600" /> Get Recommendations
              </button>
            </Link>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium text-white transition-all shadow-sm"
            >
              <Plus size={16} /> Add Crop
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Crops", value: stats.total, icon: Sprout, color: "text-green-600", bg: "bg-green-50" },
            { label: "Healthy", value: stats.healthy, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Needs Attention", value: stats.warning, icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50" },
            { label: "Critical", value: stats.critical, icon: Activity, color: "text-red-600", bg: "bg-red-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className={`${bg} p-3 rounded-xl`}><Icon className={`${color} w-6 h-6`} /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{isLoadingCrops ? "—" : value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Crops List */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Sprout size={18} className="text-green-600" /> My Crops
              </h2>
              <button onClick={() => setIsAddModalOpen(true)} className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                Add new <ArrowRight size={14} />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {isLoadingCrops ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                </div>
              ) : crops.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <Sprout className="mx-auto mb-3 text-gray-300" size={48} />
                  <p className="text-gray-500 font-medium">No crops added yet</p>
                  <p className="text-gray-400 text-sm mt-1 mb-4">Start monitoring your crops by adding them</p>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all"
                  >
                    <Plus size={16} /> Add Your First Crop
                  </button>
                </div>
              ) : (
                crops.slice(0, 6).map((crop) => (
                  <div key={crop.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <Leaf size={16} className="text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{crop.crop_name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} /> {crop.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 ml-4">
                      {crop.temperature && (
                        <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
                          <Thermometer size={13} className="text-orange-500" />{crop.temperature}°C
                        </div>
                      )}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getRiskColor(crop.risk_level)}`}>
                        {getRiskIcon(crop.risk_level)} {crop.risk_level}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Weather Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm text-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2"><CloudSun size={18} /> Weather</h2>
                <button onClick={fetchWeather} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"><RefreshCw size={14} /></button>
              </div>
              {isLoadingWeather ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/60" />
                </div>
              ) : weather ? (
                <>
                  <div className="mb-4">
                    <p className="text-4xl font-bold">{weather.temperature}°C</p>
                    <p className="text-blue-100 text-sm mt-1">{weather.conditions}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/15 rounded-lg p-3">
                      <Droplets size={16} className="mb-1 text-blue-100" />
                      <p className="text-xs text-blue-100">Humidity</p>
                      <p className="font-semibold">{weather.humidity}%</p>
                    </div>
                    <div className="bg-white/15 rounded-lg p-3">
                      <Wind size={16} className="mb-1 text-blue-100" />
                      <p className="text-xs text-blue-100">Wind</p>
                      <p className="font-semibold">{weather.wind_speed} km/h</p>
                    </div>
                  </div>
                  {weather.forecast && (
                    <div className="space-y-2">
                      {weather.forecast.map((f) => (
                        <div key={f.day} className="flex items-center justify-between text-sm bg-white/10 rounded-lg px-3 py-2">
                          <span className="text-blue-100">{f.day}</span>
                          <span className="font-medium">{f.temp}°C</span>
                          <span className="text-blue-200 text-xs">{f.conditions}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-blue-100 text-sm py-4 text-center">Weather data unavailable</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-green-600" /> Quick Actions
              </h2>
              <div className="space-y-2">
                {[
                  { label: "Get Crop Recommendations", href: "/", icon: Sprout, color: "text-green-600 bg-green-50" },
                  { label: "Manage My Crops", href: "/crops", icon: Leaf, color: "text-emerald-600 bg-emerald-50" },
                  { label: "About FarmIQ", href: "/about", icon: BarChart3, color: "text-blue-600 bg-blue-50" },
                  { label: "Contact Support", href: "/contact", icon: Activity, color: "text-purple-600 bg-purple-50" },
                ].map(({ label, href, icon: Icon, color }) => (
                  <Link key={label} href={href}>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                      <div className={`p-2 rounded-lg ${color}`}><Icon size={16} /></div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
                      <ArrowRight size={14} className="ml-auto text-gray-400 group-hover:text-gray-600" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Farm Health Overview */}
        {crops.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Activity size={18} className="text-green-600" /> Crop Status Overview
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Overall Farm Health</span>
                <span className="font-medium text-gray-900">
                  {Math.round((stats.healthy / stats.total) * 100)}% Healthy
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden flex">
                {stats.healthy > 0 && <div className="bg-green-500 h-3 transition-all" style={{ width: `${(stats.healthy / stats.total) * 100}%` }} />}
                {stats.warning > 0 && <div className="bg-yellow-400 h-3 transition-all" style={{ width: `${(stats.warning / stats.total) * 100}%` }} />}
                {stats.critical > 0 && <div className="bg-red-500 h-3 transition-all" style={{ width: `${(stats.critical / stats.total) * 100}%` }} />}
              </div>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Healthy ({stats.healthy})</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Warning ({stats.warning})</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Critical ({stats.critical})</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
