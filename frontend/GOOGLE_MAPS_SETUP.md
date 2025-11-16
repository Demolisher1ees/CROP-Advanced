# Google Maps API Setup Guide

## 🗺️ Google Maps Geocoding API Configuration

### Step 1: Enable Google Maps API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your existing project (or create a new one)
3. Navigate to **APIs & Services** > **Library**
4. Search for "Geocoding API"
5. Click on **Geocoding API** and click **Enable**

### Step 2: Create API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the generated API key
4. (Optional) Click **Restrict Key** to add security restrictions:
   - **Application restrictions**: HTTP referrers
   - **API restrictions**: Geocoding API only
   - **Referrer restrictions**: Add your domain (e.g., `localhost:3001/*`)

### Step 3: Configure Environment Variables

1. Add your API key to `.env.local`:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-actual-api-key-here
   ```

2. Update `.env.example` for team members:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

### Step 4: Test the Location Detection

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3001`
3. Click "Detect Location" button
4. Allow location access when prompted
5. You should see your location displayed

## 🎯 Features

- **Accurate Location**: Uses Google's high-quality geocoding data
- **Detailed Address**: Extracts city, state, and country information
- **Error Handling**: Comprehensive error messages for different scenarios
- **Fallback**: Shows coordinates if geocoding fails
- **Security**: API key restrictions for production use

## 🔒 Security Notes

- **Restrict API Key**: Always restrict your API key in production
- **Domain Restrictions**: Add your production domain to referrer restrictions
- **API Restrictions**: Limit to Geocoding API only
- **Monitor Usage**: Set up billing alerts to avoid unexpected charges
- **Environment Variables**: Never commit API keys to version control

## 💰 Pricing

- Google Geocoding API: $5 per 1,000 requests
- Free tier: $200 credit per month (40,000 requests)
- Most small applications stay within the free tier

## 🚨 Troubleshooting

**"API key not configured" error:**
- Check that `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set in `.env.local`
- Restart the development server after adding the key

**"OVER_QUERY_LIMIT" error:**
- You've exceeded the free tier limit
- Check your Google Cloud Console billing

**"REQUEST_DENIED" error:**
- API key restrictions are too strict
- Check referrer restrictions in Google Cloud Console

**Location not detected:**
- User denied location permission
- Location services disabled in browser
- HTTPS required in production (HTTP works in localhost)