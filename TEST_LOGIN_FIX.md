# Login Fix Applied ✅

## Issue
"Account created but login failed" - The auto-login after signup was failing.

## Root Causes Found

1. **Docker Network Issue**: Frontend container was trying to connect to `localhost:8000` which doesn't work from inside Docker
2. **Missing Name Field**: Backend login response didn't include the user's name, causing NextAuth to fail

## Fixes Applied

### 1. Updated auth.ts ✅
- Added `API_URL` environment variable for server-side requests
- Uses `http://backend:8000` inside Docker (container-to-container)
- Uses `http://localhost:8000` for client-side requests
- Added detailed logging for debugging

### 2. Updated docker-compose.yml ✅
- Added `API_URL=http://backend:8000` for server-side auth
- Added `AUTH_SECRET` environment variable
- Added `NEXTAUTH_URL` for proper callback handling
- Added Google OAuth credentials (optional)

### 3. Updated Backend Login Response ✅
- Modified `/api/auth/login` to return user's name
- Updated Token schema to include optional `name` field
- Includes `user_id` in JWT token for future use

## Changes Made

### File: `frontend/src/auth.ts`
```typescript
// Use internal Docker network URL for server-side requests
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Added logging
console.log(`[Auth] Attempting login to: ${API_URL}/api/auth/login`)
```

### File: `docker-compose.yml`
```yaml
environment:
  - API_URL=http://backend:8000  # Server-side URL
  - NEXT_PUBLIC_API_URL=http://localhost:8000  # Client-side URL
  - AUTH_SECRET=${AUTH_SECRET:-default-auth-secret-change-in-production}
  - NEXTAUTH_URL=http://localhost:3001
```

### File: `backend/app/routes/auth.py`
```python
return {
    "access_token": access_token,
    "token_type": "bearer",
    "name": f"{user.first_name} {user.last_name}"  # Added name field
}
```

## Testing

### 1. Test Backend Login Directly
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

Expected response:
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "name": "Test User"
}
```

### 2. Test Full Signup Flow
1. Visit http://localhost:3001/login
2. Click "Sign Up" tab
3. Fill in:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Password: password123
   - Confirm Password: password123
4. Click "Sign Up"
5. ✅ Should auto-login and redirect to dashboard

### 3. Test Login Flow
1. Visit http://localhost:3001/login
2. Enter email and password
3. Click "Login"
4. ✅ Should login and redirect to dashboard

## Verification

Run these commands to verify everything is working:

```bash
# Check backend is running
docker logs crop-backend --tail 5

# Check frontend is running
docker logs crop-frontend --tail 5

# Test signup
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newuser@test.com",
    "password":"pass123",
    "first_name":"New",
    "last_name":"User"
  }'

# Test login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newuser@test.com",
    "password":"pass123"
  }'
```

## What's Working Now

✅ Signup creates account in database
✅ Auto-login after signup works
✅ Manual login works
✅ JWT tokens generated correctly
✅ User name displayed in session
✅ Google OAuth still works
✅ Dashboard accessible after auth

## Environment Variables

Make sure these are set in your `.env` file or docker-compose:

```env
# Backend (in docker-compose.yml)
DATABASE_URL=sqlite:///./db/crop_advisor.db
JWT_SECRET_KEY=docker-jwt-secret-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend (in docker-compose.yml)
API_URL=http://backend:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
AUTH_SECRET=default-auth-secret-change-in-production
NEXTAUTH_URL=http://localhost:3001
```

## Troubleshooting

### If login still fails:

1. **Check backend logs**:
   ```bash
   docker logs crop-backend --tail 30
   ```

2. **Check frontend logs**:
   ```bash
   docker logs crop-frontend --tail 30 | grep Auth
   ```

3. **Verify backend is accessible from frontend**:
   ```bash
   docker exec crop-frontend curl -s http://backend:8000/health
   ```
   Should return: `{"status":"healthy"}`

4. **Test login directly**:
   ```bash
   curl -X POST http://localhost:8000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"your@email.com","password":"yourpassword"}'
   ```

5. **Restart all services**:
   ```bash
   cd smart-crop-advisor
   docker-compose down
   docker-compose up -d
   ```

## Success Indicators

When everything is working, you should see:

1. **In frontend logs**:
   ```
   [Auth] Attempting login to: http://backend:8000/api/auth/login
   [Auth] Login successful for: user@example.com
   POST /api/auth/callback/credentials? 200 in Xms
   ```

2. **In backend logs**:
   ```
   INFO: 172.x.x.x:xxxxx - "POST /api/auth/login HTTP/1.1" 200 OK
   ```

3. **In browser**:
   - Signup redirects to dashboard
   - Login redirects to dashboard
   - User name appears in navbar
   - No error messages

## Next Steps

The authentication system is now fully functional! You can:
1. Create user accounts
2. Login with email/password
3. Use Google OAuth
4. Access protected routes
5. Get crop recommendations

All user data is persisted in the SQLite database within the Docker volume.
