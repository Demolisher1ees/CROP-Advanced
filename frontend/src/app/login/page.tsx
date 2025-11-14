"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [loading, setLoading] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push("/dashboard")
    }
  }, [session, router])

  const handleGoogleSignIn = () => {
    console.log("Google sign in button clicked")
    signIn("google", { callbackUrl: "/dashboard" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Handle regular email/password login/signup here
    console.log(isLogin ? { email, password } : { firstName, lastName, email, password })
    setLoading(false)
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-green-600">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        </div>

        <h1 className="text-xl font-semibold text-center text-gray-900 mb-1">Welcome to FarmIQ</h1>
        <p className="text-center text-sm text-gray-600 mb-6">Login to your account or create a new one</p>

        <div className="flex bg-gray-100 rounded-full p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${isLogin ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${!isLogin ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"}`}
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
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John" 
                  className="w-full px-3 py-2 text-sm bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">Last Name</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe" 
                  className="w-full px-3 py-2 text-sm bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
                  required 
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="farmer@example.com" 
              className="w-full px-3 py-2 text-sm bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full px-3 py-2 text-sm bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
              required 
            />
          </div>

          {isLogin && (
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-3.5 h-3.5 text-green-600 border-gray-300 rounded" />
                <span className="ml-2 text-xs text-gray-700">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-xs text-green-600 hover:text-green-700">Forgot password?</Link>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Loading..." : (isLogin ? "Login" : "Sign Up")}
          </button>
        </form>

        {isLogin && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button 
              type="button" 
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? "Signing in..." : "Continue with Google"}
            </button>
          </>
        )}
      </div>

      <button className="fixed bottom-8 right-8 w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors shadow-lg">
        <span className="text-xl">?</span>
      </button>
    </div>
  )
}
