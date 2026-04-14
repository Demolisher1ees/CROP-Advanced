"use client"

import { useEffect, useState } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useAuthModalContext } from "@/components/AuthModalProvider"

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen } = useAuthModalContext()
  const { data: session, status } = useSession()
  const router = useRouter()

  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (session && isAuthModalOpen) {
      setIsAuthModalOpen(false)
    }
  }, [session, isAuthModalOpen, setIsAuthModalOpen])

  useEffect(() => {
    if (!isAuthModalOpen) {
      setError("")
      setLoading(false)
    }
  }, [isAuthModalOpen])

  if (!isAuthModalOpen) {
    return null
  }

  const closeModal = () => setIsAuthModalOpen(false)

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError("")
      await signIn("google", { callbackUrl: "/crops" })
    } catch (err) {
      console.error("Google sign-in error:", err)
      setError("Failed to sign in with Google. Please try again.")
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError(`Login failed: ${result.error}`)
    } else {
      setIsAuthModalOpen(false)
      router.push("/crops")
      setError("Passwords do not match")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Signup failed")
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Account created but login failed. Please try logging in.")
      } else {
        setIsAuthModalOpen(false)
        router.push("/crops")
      }
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.")
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (isLogin) {
        if (!email || !password) {
          setError("Please enter email and password")
          return
        }
        await handleLogin()
      } else {
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
          setError("Please fill in all fields")
          return
        }

        await handleSignup()
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 overflow-hidden">
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={closeModal} 
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(4px)'
        }}
      />
      <div
        className="relative bg-white rounded-3xl shadow-2xl border border-green-100 w-full max-w-md z-10 flex flex-col"
        style={{ 
          animation: "slideDown 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
          maxHeight: '80vh',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        <div className="p-6 pb-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{isLogin ? "Sign In" : "Sign Up"}</h2>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          {error && (
            <div className="mb-3 p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}

          <div className="mb-4 rounded-full bg-gray-100 p-1 flex relative">
            <div 
              className="absolute top-1 bottom-1 rounded-full bg-white shadow-sm transition-all duration-500 ease-in-out"
              style={{
                width: '50%',
                left: isLogin ? '0.25rem' : 'calc(50% + 0.25rem)',
              }}
            />
            <button
              onClick={() => setIsLogin(true)}
              className="flex-1 py-2 rounded-full text-sm font-medium transition-colors duration-300 relative z-10"
              style={{
                color: isLogin ? '#111827' : '#6B7280',
                fontWeight: isLogin ? '500' : '500',
              }}
            >
              Sign in
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className="flex-1 py-2 rounded-full text-sm font-medium transition-colors duration-300 relative z-10"
              style={{
                color: !isLogin ? '#111827' : '#6B7280',
                fontWeight: !isLogin ? '500' : '500',
              }}
            >
              Sign Up
            </button>
          </div>
        </div>

        <div className="p-6 pt-4 overflow-y-auto" style={{ flex: 1 }}>
          <form onSubmit={handleSubmit} className="space-y-3" style={{ animation: isLogin ? "slideInRight 0.3s ease-in-out" : "slideInLeft 0.3s ease-in-out" }}>
            {!isLogin && (
              <div className="grid grid-cols-2 gap-2">
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 font-normal" />
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 font-normal" />
              </div>
            )}
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 font-normal" required />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 font-normal" required />
            {!isLogin && (
              <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="Confirm password" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 font-normal" required />
            )}
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50">
              {loading ? "Processing..." : isLogin ? "Sign In" : "Create account"}
            </button>
          </form>

          <div className="mt-4 py-2 border-t border-gray-200 text-center text-xs text-gray-500">Or continue with</div>
                
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="mt-2 w-full py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-800 flex items-center justify-center gap-2 hover:bg-gray-50 hover:shadow-sm transition disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{isLogin ? "Sign in" : "Sign up"} with Google</span>
          </button>

          <p className="mt-3 text-center text-xs text-gray-500">By continuing, you agree to our terms.</p>
        </div>
      </div>
    </div>
  )
}
