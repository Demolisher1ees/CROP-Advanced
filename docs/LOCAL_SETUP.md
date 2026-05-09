# 🔧 Local Development Setup

This guide walks you through running FarmIQ completely locally without Docker.

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| Python | 3.11+ | https://python.org |
| PostgreSQL | 15+ | https://postgresql.org |
| Redis | 7+ | https://redis.io (or use `redis-server` via Homebrew/apt) |
| Git | any | https://git-scm.com |

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/CROP-Advanced.git
cd CROP-Advanced
```

---

## Step 2 — Set Up PostgreSQL

```sql
-- Connect as postgres superuser
psql -U postgres

CREATE USER cropuser WITH PASSWORD 'croppass';
CREATE DATABASE crop_advisor OWNER cropuser;
GRANT ALL PRIVILEGES ON DATABASE crop_advisor TO cropuser;
\q
```

---

## Step 3 — ML Service

```bash
cd ml-service

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start ML service
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

The ML service will be available at `http://localhost:8001`.

---

## Step 4 — Backend (FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit backend/.env (see docs/ENVIRONMENT.md for all variables)

# Run database migrations
alembic upgrade head

# Start backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`.  
Swagger docs: `http://localhost:8000/docs`

---

## Step 5 — Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env.local
# Edit frontend/.env.local (see docs/ENVIRONMENT.md)

# Start dev server
npm run dev
```

The app will be available at `http://localhost:3001`.

---

## Ports Summary

| Service | Port | URL |
|---|---|---|
| Frontend | 3001 | http://localhost:3001 |
| Backend API | 8000 | http://localhost:8000 |
| ML Service | 8001 | http://localhost:8001 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |

---

## Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

---

## Common Issues

### `DATABASE_URL` connection refused
Make sure PostgreSQL is running: `sudo service postgresql start` (Linux) or start PostgreSQL from the app (Windows/Mac).

### `NEXTAUTH_URL` mismatch
Ensure `frontend/.env.local` has `NEXTAUTH_URL=http://localhost:3001` and your Google OAuth Authorized Redirect URI matches.

### ML model not found
The ML service auto-trains on startup if no model file is found. Check `ml-service/data/` for the dataset CSV.
