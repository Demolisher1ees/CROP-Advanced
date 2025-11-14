# Smart Crop Advisor

An intelligent crop recommendation system that provides data-driven insights for farmers based on weather conditions, soil parameters, and machine learning predictions.

## Features

- Real-time weather data integration
- Soil analysis and recommendations
- ML-based crop prediction
- Modern responsive UI
- Docker containerization

## Tech Stack

**Backend:**
- FastAPI (Python)
- PostgreSQL
- Redis (caching)
- scikit-learn (ML)

**Frontend:**
- Next.js 14
- TypeScript
- Tailwind CSS

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)

### Quick Start with Docker

1. Clone the repository
2. Copy environment files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
3. Start the services:
   ```bash
   docker-compose up -d
   ```
4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Local Development

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

- `backend/` - FastAPI backend application
- `frontend/` - Next.js frontend application
- `docker-compose.yml` - Docker orchestration

## License

MIT
