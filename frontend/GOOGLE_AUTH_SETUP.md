# 🔐 Complete Google OAuth Setup Guide for FarmIQ

This guide will walk you through setting up Google OAuth authentication for your FarmIQ application.

---

## 📋 Prerequisites

- Google Account
- FarmIQ project running locally
- Basic understanding of environment variables

---

## 🚀 Step-by-Step Setup

### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click the project dropdown at the top
   - Click "New Project"
   - Enter project name: `FarmIQ` (or your preferred name)
   - Click "Create"
   - Wait for the project to be created (takes a few seconds)

3. **Select Your Project**
   - Make sure your new project is selected in the dropdown

---

### Step 2: Enable Google+ API (Required for OAuth)

1. **Navigate to APIs & Services**
   - In the left sidebar, click "APIs & Services" > "Library"

2. **Search for Google+ API**
   - In the search bar, type "Google+ API"
   - Click on "Google+ API" from the results

3. **Enable the API**
   - Click the "Enable" button
   - Wait for it to be enabled

---

### Step 3: Configure OAuth Consent Screen

1. **Go to OAuth Consent Screen**
   - Left sidebar: "APIs & Services" > "OAuth consent screen"

2. **Choose User Type**
   - Select "External" (for testing with any Google account)
   - Click "Create"

3. **Fill in App Information**
   - **App name**: `FarmIQ`
   - **User support email**: Your email address
   - **App logo**: (Optional) Upload your app logo
   - **Application home page**: `http://localhost:3001`
   - **Application privacy policy**: `http://localhost:3001/privacy` (optional for testing)
   - **Application terms of service**: `http://localhost:3001/terms` (optional for testing)
   - **Authorized domains**: Leave empty for localhost testing
   - **Developer contact information**: Your email address
   - Click "Save and Continue"

4. **Scopes**
   - Click "Add or Remove Scopes"
   - Select these scopes:
     - `userinfo.email`
     - `userinfo.profile`
     - `openid`
   - Click "Update"
   - Click "Save and Continue"

5. **Test Users** (For External apps in testing mode)
   - Click "Add Users"
   - Add your email address and any other test users
   - Click "Add"
   - Click "Save and Continue"

6. **Summary**
   - Review your settings
   - Click "Back to Dashboard"

---

### Step 4: Create OAuth 2.0 Credentials

1. **Navigate to Credentials**
   - Left sidebar: "APIs & Services" > "Credentials"

2. **Create OAuth Client ID**
   - Click "+ Create Credentials" at the top
   - Select "OAuth client ID"

3. **Configure OAuth Client**
   - **Application type**: Select "Web application"
   - **Name**: `FarmIQ Web Client`
   
4. **Add Authorized JavaScript Origins**
   - Click "+ Add URI" under "Authorized JavaScript origins"
   - Add: `http://localhost:3001`
   - Add: `http://localhost:3000` (backup)

5. **Add Authorized Redirect URIs**
   - Click "+ Add URI" under "Authorized redirect URIs"
   - Add: `http://localhost:3001/api/auth/callback/google`
   - Add: `http://localhost:3000/api/auth/callback/google` (backup)

6. **Create**
   - Click "Create"
   - A popup will show your credentials

7. **Save Your Credentials**
   - **Client ID**: Copy this (looks like: `123456789-abc123.apps.googleusercontent.com`)
   - **Client Secret**: Copy this (looks like: `GOCSPX-abc123xyz`)
   - Click "OK"

---

### Step 5: Install Required Packages

```bash
cd farmiq/frontend

# Install NextAuth.js v5
npm install next-auth@beta

# Or if using yarn
yarn add next-auth@beta
```

---

### Step 6: Create NextAuth API Route

Create the file: `frontend/src/app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
      }
      return session
    },
  },
  secret: process.env.AUTH_SECRET,
})

export { handler as GET, handler as POST }
```

---

### Step 7: Configure Environment Variables

1. **Open your `.env.local` file**
   ```bash
cd farmiq/frontend
   ```

2. **Add/Update these variables**
   ```env
   # NextAuth Configuration
   AUTH_SECRET=your-generated-secret-here
   NEXTAUTH_URL=http://localhost:3001

   # Google OAuth Credentials
   GOOGLE_CLIENT_ID=your-client-id-from-step-4
   GOOGLE_CLIENT_SECRET=your-client-secret-from-step-4
   ```

3. **Generate AUTH_SECRET**
   ```bash
   # On Mac/Linux
   openssl rand -base64 32

   # Or use Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

   # Or online: https://generate-secret.vercel.app/32
   ```

4. **Example `.env.local`**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000

   # NextAuth v5 Configuration
   AUTH_SECRET=lnI5A3NOaW7UjFEQJKwy4zKkJh+0YGOpO52WjDTamH8=
   NEXTAUTH_URL=http://localhost:3001

   # Google OAuth
   GOOGLE_CLIENT_ID=206206663180-se90qqmab5bd6gjrdg44dqoqrja3d43d.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=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

   # Google Maps API (optional)
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-api-key

   # OpenWeather API (optional)
   NEXT_PUBLIC_OPENWEATHER_API_KEY=your-weather-api-key
   ```

---

### Step 8: Update Login Page

The login page is already configured! Just make sure it imports from `next-auth/react`:

```typescript
import { signIn } from "next-auth/react"

const handleGoogleSignIn = () => {
  signIn("google", { callbackUrl: "/dashboard" })
}
```

---

### Step 9: Restart Your Application

```bash
# Stop the current Docker containers
docker-compose down

# Rebuild and start
docker-compose up --build

# Or if running manually
cd frontend
npm run dev -- -p 3001
```

---

### Step 10: Test Google OAuth

1. **Open your browser**
   - Go to: http://localhost:3001/login

2. **Click "Continue with Google"**
   - You should be redirected to Google's sign-in page

3. **Sign in with Google**
   - Choose your Google account
   - Grant permissions when asked

4. **Success!**
   - You should be redirected to `/dashboard`
   - Your session is now active

---

## 🔍 Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem**: The redirect URI doesn't match what's configured in Google Cloud Console.

**Solution**:
1. Go to Google Cloud Console > Credentials
2. Edit your OAuth 2.0 Client ID
3. Make sure these URIs are added:
   - `http://localhost:3001/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google`
4. Save and try again

### Error: "Access blocked: This app's request is invalid"

**Problem**: OAuth consent screen not properly configured.

**Solution**:
1. Go to "OAuth consent screen"
2. Make sure all required fields are filled
3. Add your email as a test user
4. Save changes

### Error: "NEXTAUTH_URL environment variable is not set"

**Problem**: Environment variable not loaded.

**Solution**:
1. Make sure `.env.local` exists in the `frontend` directory
2. Restart your development server
3. Check that `NEXTAUTH_URL=http://localhost:3001` is set

### Google Sign-In Button Does Nothing

**Problem**: NextAuth API route not created or not working.

**Solution**:
1. Make sure `frontend/src/app/api/auth/[...nextauth]/route.ts` exists
2. Check browser console for errors
3. Verify `next-auth` package is installed
4. Restart the server

### Session Not Persisting

**Problem**: AUTH_SECRET not set or invalid.

**Solution**:
1. Generate a new secret: `openssl rand -base64 32`
2. Add it to `.env.local` as `AUTH_SECRET=your-secret`
3. Restart the server

---

## 🚀 Production Deployment

When deploying to production:

1. **Update OAuth Credentials**
   - Add production domain to "Authorized JavaScript origins"
   - Add production callback URL: `https://yourdomain.com/api/auth/callback/google`

2. **Update Environment Variables**
   - Set `NEXTAUTH_URL=https://yourdomain.com`
   - Use production-grade secrets
   - Never expose secrets in client-side code

3. **Publish OAuth Consent Screen**
   - Go to "OAuth consent screen"
   - Click "Publish App"
   - Submit for verification if needed

4. **Enable HTTPS**
   - OAuth requires HTTPS in production
   - Use services like Vercel, Netlify, or configure SSL certificates

---

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## ✅ Checklist

Before testing, make sure you have:

- [ ] Created Google Cloud Project
- [ ] Enabled Google+ API
- [ ] Configured OAuth consent screen
- [ ] Created OAuth 2.0 credentials
- [ ] Added correct redirect URIs
- [ ] Installed `next-auth` package
- [ ] Created NextAuth API route
- [ ] Set all environment variables in `.env.local`
- [ ] Generated AUTH_SECRET
- [ ] Restarted the development server
- [ ] Added yourself as a test user (for external apps)

---

## 🎉 Success!

Once configured, your users can:
- Sign in with their Google account
- Access protected routes
- Have persistent sessions
- Sign out when needed

Your FarmIQ now has professional authentication! 🌾🔐
