"use client"

import { useEffect, useState } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { useAuthModalContext } from "@/components/AuthModalProvider"
import { useLanguage } from "@/components/LanguageProvider"

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen } = useAuthModalContext()
  const { t } = useLanguage()
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login')
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  useEffect(() => {
    if (session && isAuthModalOpen) {
      setIsAuthModalOpen(false)
    }
  }, [session, isAuthModalOpen, setIsAuthModalOpen])

  useEffect(() => {
    if (isAuthModalOpen) {
      // Check for OAuth errors
      const urlError = searchParams.get("error")
      if (urlError === "EmailAlreadyRegistered") {
        setView('signup')
        setError("This email is already registered. Please sign in.")
      } else if (urlError === "AccountNotFound") {
        setView('login')
        setError("Account not found. Please sign up.")
      } else if (urlError) {
        setError(urlError)
      } else {
        setError("")
      }
      setSuccessMsg("")
      setLoading(false)
    }
  }, [isAuthModalOpen, searchParams])

  if (!isAuthModalOpen) {
    return null
  }

  const closeModal = () => setIsAuthModalOpen(false)

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError("")
      // Set a cookie so the NextAuth signIn callback knows if we're signing up or logging in
      document.cookie = `oauth_intent=${view === 'signup' ? 'signup' : 'login'}; path=/; max-age=60`
      await signIn("google", { callbackUrl: "/" })
    } catch (err) {
      console.error("Google sign-in error:", err)
      setError("Failed to authenticate with Google. Please try again.")
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    try {
      // Pre-validate credentials with the backend to get the exact error message
      // NextAuth v5 masks error messages as 'CredentialsSignin', so we check manually first.
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        let errorMsg = "Invalid credentials";
        try {
          const data = await response.json();
          errorMsg = data.detail || errorMsg;
        } catch (e) {}
        setError(errorMsg);
        return;
      }

      // If validation succeeds, sign in via NextAuth
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Failed to authenticate session.");
      } else {
        setIsAuthModalOpen(false);
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    }
  }

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/signup`, {
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
        let errorMsg = "Signup failed"
        if (data.detail) {
          errorMsg = Array.isArray(data.detail) ? data.detail[0].msg : data.detail
        }
        throw new Error(errorMsg)
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
        router.push("/")
      }
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.")
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address")
      return
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || "Request failed")
      }
      setSuccessMsg("If the email is registered, a password reset link has been sent.")
      setError("")
    } catch (err: any) {
      console.error("Forgot password error:", err)
      setError(err.message || "Failed to process request.")
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    setSuccessMsg("")

    try {
      if (view === 'login') {
        if (!email || !password) {
          setError("Please enter email and password")
          return
        }
        await handleLogin()
      } else if (view === 'signup') {
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
          setError("Please fill in all fields")
          return
        }
        await handleSignup()
      } else if (view === 'forgot') {
        await handleForgotPassword()
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
        className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-green-100 dark:border-gray-700 w-full max-w-md z-10 flex flex-col transition-colors duration-300"
        style={{ 
          animation: "slideDown 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
          maxHeight: '80vh',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        <div className="p-6 pb-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
              {view === 'login' ? t("auth.sign_in") : view === 'signup' ? t("auth.sign_up") : t("auth.reset_password")}
            </h2>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
          </div>

          {error && (
            <div className="mb-3 p-2 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-sm">{error}</div>
          )}
          {successMsg && (
            <div className="mb-3 p-2 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400 text-sm">{successMsg}</div>
          )}

          {view !== 'forgot' && (
            <div className="mb-4 rounded-full bg-gray-100 dark:bg-gray-700 p-1 flex relative transition-colors duration-300">
              <div 
                className="absolute top-1 bottom-1 rounded-full bg-white dark:bg-gray-600 shadow-sm transition-all duration-500 ease-in-out"
                style={{
                  width: 'calc(50% - 0.25rem)',
                  left: view === 'login' ? '0.25rem' : '50%',
                }}
              />
              <button
                onClick={() => setView('login')}
                className="flex-1 py-2 rounded-full text-sm font-medium transition-colors duration-300 relative z-10"
                style={{
                  color: view === 'login' ? 'var(--text-color, #111827)' : 'var(--text-muted, #6B7280)',
                  fontWeight: '500',
                }}
              >
                {t("auth.sign_in")}
              </button>
              <button
                onClick={() => setView('signup')}
                className="flex-1 py-2 rounded-full text-sm font-medium transition-colors duration-300 relative z-10"
                style={{
                  color: view === 'signup' ? 'var(--text-color, #111827)' : 'var(--text-muted, #6B7280)',
                  fontWeight: '500',
                }}
              >
                {t("auth.sign_up")}
              </button>
            </div>
          )}
        </div>

        <div className="p-6 pt-4 overflow-y-auto" style={{ flex: 1 }}>
          <form onSubmit={handleSubmit} className="space-y-3" style={{ animation: view === 'login' ? "slideInRight 0.3s ease-in-out" : "slideInLeft 0.3s ease-in-out" }}>
            {view === 'signup' && (
              <div className="grid grid-cols-2 gap-2">
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder={t("auth.first_name")} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 font-normal transition-colors duration-300" />
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder={t("auth.last_name")} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 font-normal transition-colors duration-300" />
              </div>
            )}
            
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder={t("auth.email")} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 font-normal transition-colors duration-300" required />
            
            {view !== 'forgot' && (
              <div className="space-y-1">
                <div className="relative">
                  <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder={t("auth.password")} className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 font-normal transition-colors duration-300" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {view === 'login' && (
                  <div className="text-right">
                    <button type="button" onClick={() => { setView('forgot'); setError(""); setSuccessMsg(""); }} className="text-xs text-green-600 hover:text-green-500 font-medium">{t("auth.forgot_password")}</button>
                  </div>
                )}
              </div>
            )}
            
            {view === 'signup' && (
              <div className="relative">
                <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type={showConfirmPassword ? "text" : "password"} placeholder={t("auth.confirm_password")} className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 font-normal transition-colors duration-300" required />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none">
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50">
              {loading ? "Processing..." : view === 'login' ? t("auth.sign_in") : view === 'signup' ? t("auth.create_account") : t("auth.send_reset_link")}
            </button>
            
            {view === 'forgot' && (
              <button type="button" onClick={() => { setView('login'); setError(""); setSuccessMsg(""); }} className="w-full py-2 bg-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg text-sm font-medium transition disabled:opacity-50">
                {t("auth.back_to_sign_in")}
              </button>
            )}
          </form>

          {view !== 'forgot' && (
            <>
              <div className="mt-4 py-2 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">{t("auth.or_continue_with")}</div>
                    
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="mt-2 w-full py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-800 dark:text-white flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-600 hover:shadow-sm transition disabled:opacity-50 duration-300"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{view === 'login' ? t("auth.sign_in_with_google") : t("auth.sign_up_with_google")}</span>
              </button>

              <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">{t("auth.terms_agreement")}</p>
            </>
          )}
        </div>
      </div>
      <style jsx>{`
        /* Dynamic text colors for the toggle based on theme */
        :global(.dark) {
          --text-color: #ffffff;
          --text-muted: #9ca3af;
        }
        :global(:root:not(.dark)) {
          --text-color: #111827;
          --text-muted: #6b7280;
        }
      `}</style>
    </div>
  )
}
