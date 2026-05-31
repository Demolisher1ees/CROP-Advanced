# 🌍 Environment Variables Reference

Complete reference for all environment variables used across the FarmIQ project for local development.

---

## `backend/.env`

Configure the FastAPI backend server. Copy `backend/.env.example` → `backend/.env` and configure:

```env
# ── Database (MongoDB) ──────────────────────────────────
# Connection string to your local MongoDB server
MONGODB_URL=mongodb://localhost:27017/crop_advisor

# ── Redis ───────────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ── ML Service ──────────────────────────────────────────
ML_SERVICE_URL=http://localhost:8001

# ── Backend Security ────────────────────────────────────
SECRET_KEY=your-random-secret-key-min-32-chars
JWT_SECRET_KEY=another-random-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# ── API Keys ────────────────────────────────────────────
WEATHER_API_KEY=              # OpenWeatherMap API key
GOOGLE_MAPS_API_KEY=          # Google Maps JavaScript API key
GOOGLE_CLIENT_ID=             # Google OAuth 2.0 Client ID
GOOGLE_CLIENT_SECRET=         # Google OAuth 2.0 Client Secret
```

---

## `frontend/.env.local` (Next.js)

Configure the Next.js frontend. Copy `frontend/.env.example` → `frontend/.env.local` and configure:

```env
# Backend API URL (from browser)
NEXT_PUBLIC_API_URL=http://localhost:8000

# NextAuth configuration
NEXTAUTH_URL=http://localhost:3001
AUTH_SECRET=same-as-backend-auth-secret (minimum 32 characters)

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google Maps (for location picker)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-api-key

# OpenWeatherMap (for weather widget + pest alerts)
NEXT_PUBLIC_OPENWEATHER_API_KEY=your-weather-api-key
```

---

## Obtaining API Keys

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one.
3. Enable **Google+ API** and **OAuth consent screen**.
4. Go to **Credentials** → **Create Credentials** → **OAuth Client ID**.
5. Add Authorized Redirect URI: `http://localhost:3001/api/auth/callback/google`
6. Copy `Client ID` and `Client Secret`.

### OpenWeatherMap
1. Register at [openweathermap.org](https://openweathermap.org/api)
2. Go to **My API Keys**.
3. Copy your default key (or create a new one).
4. Free tier includes 60 calls/minute — sufficient for development.

### Google Maps
1. In [Google Cloud Console](https://console.cloud.google.com), go to **APIs & Services**.
2. Enable **Maps JavaScript API** and **Geocoding API**.
3. Go to **Credentials** → copy or create an **API key**.
4. Restrict the key to your domain for production.

### Generating `AUTH_SECRET` / `SECRET_KEY`
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

