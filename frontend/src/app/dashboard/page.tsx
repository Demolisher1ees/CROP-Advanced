"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

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
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
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
                onClick={() => signOut({ callbackUrl: "/" })}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Sign Out
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
