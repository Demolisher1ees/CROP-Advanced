"use client"

import { signIn, useSession } from "next-auth/react"

export default function TestAuth() {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">NextAuth Test Page</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Session Status:</h2>
          <p className="text-gray-700">Status: {status}</p>
          <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <button
          onClick={() => {
            console.log("Button clicked!")
            signIn("google", { callbackUrl: "/dashboard" })
              .then(result => console.log("SignIn result:", result))
              .catch(error => console.error("SignIn error:", error))
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Test Google Sign In
        </button>

        <div className="mt-4">
          <a 
            href="/api/auth/signin/google"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Direct Link to Google Sign In
          </a>
        </div>
      </div>
    </div>
  )
}
