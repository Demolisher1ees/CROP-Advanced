# 🌾 FarmIQ — AI-Powered Crop Advisory Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green?logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://python.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green?logo=mongodb)](https://mongodb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

FarmIQ is an intelligent agricultural platform that bridges the gap between farmers and modern technology. It provides **real-time, data-driven crop care recommendations** by combining live weather data, soil health metrics, and machine learning.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **AI Recommendations** | RandomForest ML model trained on agricultural datasets |
| 🌤️ **Live Weather Alerts** | Real-time pest & disease risk based on OpenWeatherMap |
| 🗺️ **Geolocation** | Auto-detects location for region-specific advice |
| 📊 **Crop Dashboard** | Track all your crops, health statuses, and alerts |
| 🔐 **Auth** | Email/password + Google OAuth via NextAuth.js |
| 🌐 **i18n** | English, Hindi, Bengali language support |
| 🌙 **Dark Mode** | Full dark/light theme toggle |
| 📱 **Responsive** | Mobile-first design |

---

## 🏗️ Architecture

```
FarmIQ/
├── frontend/          # Next.js 15 app (React, TypeScript, TailwindCSS)
├── backend/           # FastAPI (Python) — auth, crops, contact APIs
├── ml-service/        # FastAPI ML microservice — crop recommendations
└── data/              # Dataset CSV files for ML training
```

**Request flow:**
```
Browser → Next.js Frontend (3001)
              ↓
         FastAPI Backend (8000)  ←→  MongoDB (27017)
              ↓                  ←→  Redis (6379)
         ML Service (8001)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB 6+ (Running locally)
- Redis 7+

### Step-by-step Local Setup

See **[docs/LOCAL_SETUP.md](docs/LOCAL_SETUP.md)** for step-by-step instructions on setting up the database, backend, ML service, and frontend.

---

## 📁 Documentation

| Document | Description |
|---|---|
| [docs/LOCAL_SETUP.md](docs/LOCAL_SETUP.md) | Full local dev setup (Node, Python, MongoDB) |
| [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) | All environment variables explained |
| [docs/API.md](docs/API.md) | Backend API reference |

---

## 🌍 Environment Variables

Copy `.env.example` to `.env` (or configure each service's env file) and fill in:

```env
# MongoDB
MONGODB_URL=mongodb://localhost:27017/crop_advisor

# Backend Security
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret

# Google OAuth (https://console.cloud.google.com)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# OpenWeatherMap (https://openweathermap.org/api)
WEATHER_API_KEY=your-weather-key
```

The frontend also needs `frontend/.env.local` — see [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, React, TypeScript, TailwindCSS, shadcn/ui |
| **Backend** | Python, FastAPI, Beanie ODM |
| **ML** | Scikit-learn, RandomForest, Pandas |
| **Database** | MongoDB 6+, Redis 7 |
| **Auth** | NextAuth.js, Google OAuth, JWT |
| **APIs** | OpenWeatherMap, Google Maps |

---

## 👥 Team

| Name | Role |
|---|---|
| **Srinjoy Paul** | Frontend & Backend Developer |
| **Eeshan Ghosh** | Backend & ML Developer |

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.