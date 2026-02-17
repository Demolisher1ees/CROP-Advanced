"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { clearAllCookies } from "@/lib/clearCookies"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    
    // Clear all cookies and storage
    clearAllCookies()
    
    // Sign out from NextAuth
    await signOut({ 
      callbackUrl: "/",
      redirect: true 
    })
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-600">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C11.5 2 11 2.19 10.59 2.59L10 3.17L9.41 2.59C9 2.19 8.5 2 8 2C6.89 2 6 2.89 6 4C6 4.5 6.19 5 6.59 5.41L11.29 10.11C11.68 10.5 12.32 10.5 12.71 10.11L17.41 5.41C17.81 5 18 4.5 18 4C18 2.89 17.11 2 16 2C15.5 2 15 2.19 14.59 2.59L14 3.17L13.41 2.59C13 2.19 12.5 2 12 2M12 12C11.45 12 11 12.45 11 13V21C11 21.55 11.45 22 12 22C12.55 22 13 21.55 13 21V13C13 12.45 12.55 12 12 12Z"/>
                </svg>
              </div>
              <span className="text-xl font-semibold text-gray-900">FarmIQ</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {session.user?.image && (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || "User"} 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{session.user?.name}</p>
                  <p className="text-gray-500">{session.user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center gap-2 btn-3d"
              >
                {isSigningOut ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing Out...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to FarmIQ Dashboard, {session.user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-gray-600 mb-6">
              You have successfully logged in with Google. Here you can access all your crop recommendations and farming insights.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">🌱</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Crop Analysis</h3>
                    <p className="text-gray-600">Get personalized crop recommendations</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">🌡️</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Weather Insights</h3>
                    <p className="text-gray-600">Real-time weather monitoring</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">📊</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Farm Analytics</h3>
                    <p className="text-gray-600">Track your farming progress</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
