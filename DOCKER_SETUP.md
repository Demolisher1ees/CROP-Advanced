# 🐳 Docker Setup Guide

This guide covers everything you need to run FarmIQ using Docker Compose.

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- Git

---

## Services Overview

| Container | Image | Port | Purpose |
|---|---|---|---|
| `crop-frontend` | Built from `./frontend` | 3001 | Next.js web app |
| `crop-backend` | Built from `./backend` | 8000 | FastAPI REST API |
| `crop-ml-service` | Built from `./ml-service` | 8001 | ML prediction service |
| `crop-db` | `postgres:15-alpine` | 5432 | PostgreSQL database |
| `crop-redis` | `redis:7-alpine` | 6379 | Redis cache |

---

## Quick Start

```bash
# 1. Copy environment file
cp .env.example .env
# Edit .env with your actual API keys

# 2. Build and start all services
docker compose up -d

# 3. Check all containers are running
docker compose ps

# 4. View logs (optional)
docker compose logs -f
```

App available at: **http://localhost:3001**

---

## Common Commands

```bash
# Start all services
docker compose up -d

# Stop all services (keeps data volumes)
docker compose down

# Stop and remove all data volumes (DESTRUCTIVE)
docker compose down -v

# Rebuild a specific service after code changes
docker compose build frontend
docker compose up -d frontend

# View logs for a specific service
docker compose logs -f backend

# Execute a command inside a container
docker compose exec backend bash
docker compose exec db psql -U cropuser -d crop_advisor

# Restart a single service
docker compose restart backend
```

---

## Persistent Data

Two named volumes persist data between restarts:

| Volume | Contains |
|---|---|
| `postgres-data` | All PostgreSQL database data |
| `backend-db` | SQLite fallback database |

To back up PostgreSQL:
```bash
docker compose exec db pg_dump -U cropuser crop_advisor > backup.sql
```

To restore:
```bash
cat backup.sql | docker compose exec -T db psql -U cropuser -d crop_advisor
```

---

## Updating After Code Changes

```bash
# Rebuild changed services
docker compose build

# Restart with new images
docker compose up -d
```

---

## Troubleshooting

### Port already in use
```bash
# Find what's using port 3001
netstat -ano | findstr :3001   # Windows
lsof -i :3001                  # Mac/Linux

# Change the port in compose.yaml if needed
```

### Database connection refused
```bash
# Check DB container is healthy
docker compose ps db
docker compose logs db

# Restart DB
docker compose restart db
```

### Frontend shows blank page
The frontend container runs `npm start` (production build). If the build fails, run locally with `npm run dev` instead. See [docs/LOCAL_SETUP.md](docs/LOCAL_SETUP.md).

### View all container resource usage
```bash
docker stats
```
