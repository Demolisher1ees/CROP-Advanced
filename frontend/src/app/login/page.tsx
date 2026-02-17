"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleGoogleSignIn = () => {
    setError("Google Sign-In requires OAuth configuration. Please use demo login or skip to homepage.")
    console.log("Google OAuth not configured. Redirecting to setup instructions...")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    // Demo authentication - in production, this would call your backend API
    try {
      if (isLogin) {
        // Demo login - accept any email/password for testing
        if (email && password) {
          console.log("Demo login successful:", { email })
          // Store demo session
          localStorage.setItem('demo_user', JSON.stringify({ 
            email, 
            name: email.split('@')[0],
            loginTime: new Date().toISOString()
          }))
          router.push("/dashboard")
        } else {
          setError("Please enter email and password")
        }
      } else {
        // Demo signup
        if (firstName && lastName && email && password) {
          console.log("Demo signup successful:", { firstName, lastName, email })
          // Store demo session
          localStorage.setItem('demo_user', JSON.stringify({ 
            email, 
            name: `${firstName} ${lastName}`,
            loginTime: new Date().toISOString()
          }))
          router.push("/dashboard")
        } else {
          setError("Please fill in all fields")
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error("Login error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSkipLogin = () => {
    // Allow users to skip login and go directly to homepage
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-green-600">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C11.5 2 11 2.19 10.59 2.59L10 3.17L9.41 2.59C9 2.19 8.5 2 8 2C6.89 2 6 2.89 6 4C6 4.5 6.19 5 6.59 5.41L11.29 10.11C11.68 10.5 12.32 10.5 12.71 10.11L17.41 5.41C17.81 5 18 4.5 18 4C18 2.89 17.11 2 16 2C15.5 2 15 2.19 14.59 2.59L14 3.17L13.41 2.59C13 2.19 12.5 2 12 2M12 12C11.45 12 11 12.45 11 13V21C11 21.55 11.45 22 12 22C12.55 22 13 21.55 13 21V13C13 12.45 12.55 12 12 12Z"/>
            </svg>
          </div>
        </div>

        <h1 className="text-xl font-semibold text-center text-gray-900 mb-1">Welcome to FarmIQ</h1>
        <p className="text-center text-sm text-gray-600 mb-6">Demo Mode - Login with any credentials</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="relative flex bg-gray-100 rounded-full p-1 mb-6 overflow-hidden">
          {/* Sliding background */}
          <div 
            className={`absolute top-1 bottom-1 w-1/2 bg-white rounded-full shadow-sm transition-all duration-300 ease-in-out ${
              isLogin ? 'translate-x-0' : 'translate-x-full'
            }`}
          />
          
          <button
            onClick={() => setIsLogin(true)}
            className={`relative flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors duration-300 z-10 ${
              isLogin ? "text-gray-900" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`relative flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors duration-300 z-10 ${
              !isLogin ? "text-gray-900" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">First Name</label>
                <input 
                  type="text" 
                  name="firstName"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John" 
                  className="w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-300 placeholder:opacity-35" 
                  style={{
                    WebkitTextFillColor: '#111827',
                    WebkitBoxShadow: '0 0 0px 1000px #F9FAFB inset',
                  }}
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">Last Name</label>
                <input 
                  type="text" 
                  name="lastName"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe" 
                  className="w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-300 placeholder:opacity-35" 
                  style={{
                    WebkitTextFillColor: '#111827',
                    WebkitBoxShadow: '0 0 0px 1000px #F9FAFB inset',
                  }}
                  required 
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Email</label>
            <input 
              type="email" 
              name="email"
              autoComplete={isLogin ? "email" : "email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="farmer@example.com" 
              className="w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-300 placeholder:opacity-35" 
              style={{
                WebkitTextFillColor: '#111827',
                WebkitBoxShadow: '0 0 0px 1000px #F9FAFB inset',
              }}
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Password</label>
            <input 
              type="password" 
              name="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-300 placeholder:opacity-35" 
              style={{
                WebkitTextFillColor: '#111827',
                WebkitBoxShadow: '0 0 0px 1000px #F9FAFB inset',
              }}
              required 
            />
          </div>

          {isLogin && (
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-3.5 h-3.5 text-green-600 border-gray-300 rounded" />
                <span className="ml-2 text-xs text-gray-700">Remember me</span>
              </label>
              <button type="button" className="text-xs text-green-600 hover:text-green-700">Forgot password?</button>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full text-white py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none btn-3d btn-3d-primary"
          >
            {loading ? "Loading..." : (isLogin ? "Login (Demo)" : "Sign Up (Demo)")}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        <button 
          type="button" 
          onClick={handleSkipLogin}
          className="w-full flex items-center justify-center gap-2 text-gray-700 py-2.5 rounded-lg text-sm font-medium transition-all btn-3d btn-3d-secondary mb-3"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          Skip Login & Go to Homepage
        </button>

        <button 
          type="button" 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 text-gray-700 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none btn-3d btn-3d-secondary opacity-50 cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google Sign-In (Requires Setup)
        </button>

        <p className="mt-4 text-center text-xs text-gray-500">
          Demo Mode: Use any email/password to test the system
        </p>
      </div>


    </div>
  )
}
