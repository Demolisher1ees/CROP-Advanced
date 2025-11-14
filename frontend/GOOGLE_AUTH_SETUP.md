# Google Authentication Setup Guide

## 🔐 Google OAuth Configuration

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if prompted
6. Select **Web application** as the application type
7. Add authorized redirect URIs:
   - `http://localhost:3001/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (backup)
8. Click **Create** and copy your Client ID and Client Secret

### Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your credentials:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3001
   NEXTAUTH_SECRET=your-generated-secret-key
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-actual-google-client-id
   GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
   ```

3. Generate a secure NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

### Step 3: Test the Authentication

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3001/login`
3. Click "Continue with Google"
4. Complete the Google sign-in flow
5. You should be redirected to `/dashboard`

## 🎯 Features Implemented

- ✅ Google OAuth sign-in
- ✅ Session management with NextAuth
- ✅ Protected dashboard route
- ✅ Automatic redirects (logged in users → dashboard, logged out users → login)
- ✅ Loading states
- ✅ Sign out functionality

## 📁 Files Created/Modified

- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth API routes
- `src/app/login/page.tsx` - Login page with Google auth
- `src/app/dashboard/page.tsx` - Protected dashboard
- `src/components/SessionProvider.tsx` - Session context wrapper
- `src/app/layout.tsx` - Root layout with SessionProvider

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Use strong, randomly generated secrets in production
- Configure proper OAuth consent screen for production
- Add production URLs to authorized redirect URIs before deploying
