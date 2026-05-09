import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { CredentialsSignin } from "next-auth"

class CustomAuthError extends CredentialsSignin {
  code: string;
  constructor(message: string) {
    super();
    this.message = message;
    this.code = message;
  }
}

// Use internal Docker network URL for server-side requests
let API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
if (API_URL.includes("localhost")) {
  API_URL = API_URL.replace("localhost", "127.0.0.1")
}

import { cookies } from "next/headers"

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  basePath: "/api/auth",
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any, req: any) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          console.log(`[Auth] Attempting login to: ${API_URL}/api/auth/login`)
          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          })

          if (!response.ok) {
            console.error(`[Auth] Login failed with status: ${response.status}`)
            let errorMessage = "Invalid credentials"
            try {
              const errorData = await response.json()
              errorMessage = errorData.detail || errorMessage
            } catch (e) {
              // Ignore JSON parse errors
            }
            throw new CustomAuthError(errorMessage)
          }

          const data = await response.json()
          console.log(`[Auth] Login successful for: ${credentials.email}`)
          
          // Return user object with token
          return {
            id: credentials.email,
            email: credentials.email,
            name: data.name || credentials.email.split('@')[0],
            accessToken: data.access_token
          }
        } catch (error) {
          console.error("[Auth] Error during login:", error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const cookieStore = cookies()
          const intent = cookieStore.get("oauth_intent")?.value
          
          // Check if user exists
          const checkRes = await fetch(`${API_URL}/api/auth/check-email?email=${user.email}`)
          const { exists } = await checkRes.json()
          
          // Apply validation rules
          if (intent === "signup" && exists) {
            return "/?error=EmailAlreadyRegistered"
          }
          if (intent === "login" && !exists) {
            return "/?error=AccountNotFound"
          }
          
          // Sync with backend
          const nameParts = (user.name || "").split(" ")
          const firstName = nameParts[0] || user.email?.split("@")[0] || ""
          const lastName = nameParts.slice(1).join(" ") || "User"
          
          const syncRes = await fetch(`${API_URL}/api/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              first_name: firstName,
              last_name: lastName
            })
          })
          
          if (!syncRes.ok) {
            console.error("[Auth] Backend Google sync failed")
            return false
          }
          
          const syncData = await syncRes.json()
          // Inject backend token into user object so jwt callback receives it
          ;(user as any).accessToken = syncData.access_token
          return true
        } catch (err) {
          console.error("[Auth] Google sign-in validation error:", err)
          return false
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken
      }
      return token
    },
    async session({ session, token }) {
      (session as any).accessToken = (token as any).accessToken
      return session
    }
  }
})
