# Docker Authentication Fix - Applied

## Issue
The authentication endpoints were returning "failed to fetch" because:
1. Backend was running in Docker but didn't have the new auth code
2. Docker was configured for PostgreSQL but no database service existed
3. Bcrypt dependency had compatibility issues

## Fixes Applied

### 1. Updated docker-compose.yml ✅
- Changed from PostgreSQL to SQLite for easier setup
- Added JWT environment variables
- Added named volume for database persistence
- Configuration:
  ```yaml
  environment:
    - DATABASE_URL=sqlite:///./db/crop_advisor.db
    - JWT_SECRET_KEY=docker-jwt-secret-change-in-production
    - JWT_ALGORITHM=HS256
    - ACCESS_TOKEN_EXPIRE_MINUTES=30
  volumes:
    - backend-db:/app/db  # Persist SQLite database
  ```

### 2. Fixed Backend Dependencies ✅
- Updated `requirements.txt` to use compatible bcrypt version
- Changed from `passlib[bcrypt]` to separate `bcrypt==4.0.1` and `passlib==1.7.4`
- This fixes the bcrypt initialization error

### 3. Rebuilt Docker Containers ✅
- Rebuilt backend container with new auth code
- Rebuilt with fixed dependencies
- Restarted frontend to pick up changes

## Verification

### Backend is Running ✅
```bash
$ curl http://localhost:8000/health
{"status":"healthy"}
```

### Signup Works ✅
```bash
$ curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","first_name":"Test","last_name":"User"}'

Response:
{
  "id": 1,
  "email": "test@example.com",
  "first_name": "Test",
  "last_name": "User",
  "is_active": true,
  "created_at": "2026-02-17T15:51:48"
}
```

### Login Works ✅
```bash
$ curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

## Current Status

✅ Backend running on http://localhost:8000
✅ Frontend running on http://localhost:3001
✅ ML Service running on http://localhost:8001
✅ Authentication endpoints working
✅ Database persisted in Docker volume

## How to Use

1. **Visit the login page**:
   ```
   http://localhost:3001/login
   ```

2. **Create an account**:
   - Click "Sign Up" tab
   - Fill in first name, last name, email, password, confirm password
   - Click "Sign Up"
   - You'll be automatically logged in

3. **Or use Google OAuth**:
   - Click "Continue with Google"
   - Authorize the application
   - Access the dashboard

## Database Location

The SQLite database is stored in a Docker named volume:
- Volume name: `smart-crop-advisor_backend-db`
- Mount point: `/app/db/crop_advisor.db` inside container

To view the database:
```bash
docker exec -it crop-backend ls -la /app/db/
```

## Troubleshooting

### If "failed to fetch" still appears:

1. **Check backend is running**:
   ```bash
   docker ps | grep crop-backend
   docker logs crop-backend --tail 20
   ```

2. **Test auth endpoints directly**:
   ```bash
   curl http://localhost:8000/api/auth/signup -X POST \
     -H "Content-Type: application/json" \
     -d '{"email":"new@test.com","password":"pass123","first_name":"New","last_name":"User"}'
   ```

3. **Check frontend logs**:
   ```bash
   docker logs crop-frontend --tail 20
   ```

4. **Restart all services**:
   ```bash
   cd smart-crop-advisor
   docker-compose down
   docker-compose up -d
   ```

### If you need to reset the database:

```bash
# Stop services
docker-compose -f smart-crop-advisor/docker-compose.yml down

# Remove the database volume
docker volume rm smart-crop-advisor_backend-db

# Start services (will create fresh database)
docker-compose -f smart-crop-advisor/docker-compose.yml up -d
```

## Files Modified

1. `docker-compose.yml` - Updated backend environment and volumes
2. `backend/requirements.txt` - Fixed bcrypt dependency
3. `backend/app/routes/__init__.py` - Added auth module export

## Next Steps

The authentication system is now fully functional! You can:
1. Create user accounts
2. Login with email/password
3. Use Google OAuth
4. Access the dashboard
5. Get crop recommendations

All user data is persisted in the SQLite database within the Docker volume.
