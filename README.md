# 🌾 Smart Crop Advisor

An AI-powered crop recommendation system that analyzes real-time environmental data to provide intelligent farming advice.

![Smart Crop Advisor](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Python](https://img.shields.io/badge/Python-3.10-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green)

## 🎯 Features

- **🔐 Secure Authentication** - Email/password signup and Google OAuth login
- **🌍 Location-Based Analysis** - GPS detection with weather and soil data
- **🤖 AI-Powered Recommendations** - Machine learning crop suitability analysis
- **📊 26 Indian Crops** - Comprehensive database with growing requirements
- **🎨 Modern UI** - Responsive design with real-time data visualization
- **🐳 Docker Ready** - One-command deployment with Docker Compose
- **📱 Mobile Friendly** - Works seamlessly on all devices

## 🏗️ Architecture

### Microservices Design
- **Frontend** (Next.js) - User interface on port 3001
- **Backend** (FastAPI) - API gateway on port 8000  
- **ML Service** (Python) - Crop analysis engine on port 8001

### Tech Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python 3.10
- **ML Service**: FastAPI, Pandas, NumPy
- **Database**: CSV-based crop dataset
- **Deployment**: Docker, Docker Compose

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Git (for cloning)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smart-crop-advisor.git
   cd smart-crop-advisor
   ```

2. **Start all services**
   ```bash
   docker-compose up --build
   ```

3. **Open your browser**
   ```
   http://localhost:3001
   ```

That's it! 🎉

## 📱 How to Use

1. **Click "Detect Location"** or **"🧪 Use Demo Data"**
2. **Select a crop** from 26 available options
3. **Click "Get Recommendations"**
4. **View analysis results**:
   - Suitability score (0-100%)
   - Optimal vs current conditions
   - Actionable farming advice

## 📊 Supported Crops

The system analyzes 26 major Indian crops:

| Cereals | Pulses | Cash Crops | Vegetables |
|---------|--------|------------|------------|
| Rice (Paddy) | Chickpea (Chana) | Cotton | Onion |
| Wheat | Black Gram (Urad) | Sugarcane | Tomato |
| Corn (Maize) | Lentil (Masoor) | Jute | Potato |
| Barley | Pigeon Pea (Arhar) | Sesame | - |
| Bajra (Pearl Millet) | Soybean | Sunflower | - |
| Jowar (Sorghum) | Groundnut | Mustard | - |
| Millet | - | Tea | - |
| Ragi (Finger Millet) | - | Coffee | - |
| - | - | Coconut | - |

## 🔧 Development

### Manual Setup (Without Docker)

#### ML Service
```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev -- -p 3001
```

### Environment Variables

Copy `.env.example` to `.env.local` in the frontend directory and configure:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# NextAuth Configuration
AUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3001

# Google OAuth (for login)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Google Maps (for location names)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key

# OpenWeather (for real weather data)
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key
```

## 🔐 Authentication

The system includes a complete authentication system:

### Features
- **Email/Password Signup & Login** - Secure user registration with bcrypt password hashing
- **Google OAuth** - One-click sign-in with Google
- **JWT Tokens** - Stateless authentication with JSON Web Tokens
- **Session Management** - Secure session handling with NextAuth.js

### Setup Guide
See [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md) for detailed setup instructions.

### Quick Test
```bash
# Start backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Test authentication (in another terminal)
python test_auth.py
```

### API Endpoints
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Authenticate and get JWT token

### Database
- Uses SQLite by default (no setup required)
- Easily upgradeable to PostgreSQL for production
- User table with email, hashed password, and profile info

## 📈 Analysis Algorithm

The system evaluates crops based on:

- **Temperature Range** (Min/Optimal/Max)
- **Humidity Requirements** 
- **Soil pH Levels**
- **Soil Composition** (Sand/Clay/Silt %)
- **Organic Carbon Content**
- **Rainfall Patterns**
- **Drainage Requirements**

### Scoring System
- **80-100%**: Excellent conditions
- **60-79%**: Good conditions with minor adjustments
- **40-59%**: Moderate suitability, improvements needed
- **0-39%**: Poor conditions, major changes required

## 🛠️ API Endpoints

### ML Service (Port 8001)
- `GET /` - Service status
- `GET /crops` - List all available crops
- `POST /analyze` - Analyze crop suitability
- `GET /docs` - Interactive API documentation

### Backend (Port 8000)
- Authentication and user management
- Data persistence
- API gateway functionality

## 📁 Project Structure

```
smart-crop-advisor/
├── data/
│   └── crop_data.csv          # 26 crops with growing conditions
├── ml-service/                # Python ML service
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── backend/                   # FastAPI backend
│   ├── app/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                  # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml         # Orchestrates all services
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Weather data integration capabilities
- Soil analysis algorithms
- Agricultural research for crop requirements
- Open source community for tools and libraries

## 📞 Support

For support, email your-email@example.com or create an issue in this repository.

---

**Made with ❤️ for farmers and agricultural innovation**

🌾 *Empowering farmers with data-driven crop decisions*