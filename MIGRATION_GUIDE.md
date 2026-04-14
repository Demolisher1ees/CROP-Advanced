# Migration Guide: Demo Auth → Real Authentication

## Overview

FarmIQ has been upgraded from demo authentication to a real, production-ready authentication system. This guide helps you migrate.

## What Changed

### Before (Demo Mode)
- ✗ No real user accounts
- ✗ Data stored in localStorage only
- ✗ "Skip Login" button allowed bypassing auth
- ✗ No password security
- ✗ No persistent sessions

### After (Real Auth)
- ✓ Real user accounts in database
- ✓ Secure password hashing with bcrypt
- ✓ JWT token-based authentication
- ✓ Must authenticate to access dashboard
- ✓ Persistent sessions across devices
- ✓ Google OAuth support

## Migration Steps

### For Developers

#### 1. Update Backend Dependencies

```bash
cd farmiq/backend
pip install -r requirements.txt
```

New packages installed:
- `passlib[bcrypt]` - Password hashing
- `python-jose[cryptography]` - JWT tokens
- `pydantic[email]` - Email validation

#### 2. Database Setup

The system now uses SQLite by default (no configuration needed):

```bash
# Database file will be created automatically at:
# backend/crop_advisor.db
```

For PostgreSQL (production):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/crop_advisor
```

#### 3. Environment Variables

Update `backend/.env` (create if doesn't exist):

```env
# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database (SQLite default)
DATABASE_URL=sqlite:///./crop_advisor.db
```

Generate a secure JWT secret:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Update `frontend/.env.local`:

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# NextAuth
AUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3001

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### 4. Start Services

```bash
# Terminal 1: Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: ML Service
cd ml-service
python main.py
```

#### 5. Test Authentication

```bash
cd backend
python test_auth.py
```

Expected output:
```
✓ Backend server is running
✓ PASS - Signup
✓ PASS - Login
✓ PASS - Duplicate Signup Prevention
✓ PASS - Invalid Login Prevention
🎉 All tests passed!
```

### For Users

#### 1. Create an Account

1. Visit http://localhost:3001/login
2. Click "Sign Up" tab
3. Fill in:
   - First Name
   - Last Name
   - Email
   - Password (min 6 characters)
   - Confirm Password
4. Click "Sign Up"
5. You'll be automatically logged in

#### 2. Login

1. Visit http://localhost:3001/login
2. Enter your email and password
3. Click "Login"
4. Access the dashboard

#### 3. Google OAuth (Optional)

1. Visit http://localhost:3001/login
2. Click "Continue with Google"
3. Authorize the application
4. Access the dashboard

## Breaking Changes

### Removed Features
- ❌ "Skip Login" button - All users must authenticate
- ❌ localStorage demo authentication
- ❌ Fake user accounts

### New Requirements
- ✅ Users must create an account
- ✅ Valid email address required
- ✅ Password minimum 6 characters
- ✅ Backend must be running for auth

## Data Migration

### Demo Users → Real Users

If you were using demo mode, you'll need to create a real account:

1. **No data to migrate** - Demo mode didn't store real user data
2. **Create new account** - Sign up with your email
3. **Start fresh** - Previous demo sessions won't carry over

### Existing OAuth Users

If you were using Google OAuth:
- ✓ No changes needed
- ✓ Continue using "Continue with Google"
- ✓ Your Google account will work the same way

## Troubleshooting

### "Email already registered"
**Problem**: Trying to sign up with an email that exists

**Solution**: 
- Use the Login tab instead
- Or use a different email address

### "Invalid email or password"
**Problem**: Wrong credentials during login

**Solution**:
- Check email spelling
- Verify password (case-sensitive)
- Try password reset (if implemented)

### "Backend not responding"
**Problem**: Frontend can't reach backend

**Solution**:
```bash
# Check backend is running
curl http://localhost:8000/health

# Start backend if not running
cd backend
uvicorn app.main:app --reload --port 8000
```

### "Module not found" errors
**Problem**: Missing Python packages

**Solution**:
```bash
cd backend
pip install -r requirements.txt
```

### Database errors
**Problem**: SQLite database issues

**Solution**:
```bash
# Delete and recreate database
rm backend/crop_advisor.db

# Restart backend (will recreate tables)
cd backend
uvicorn app.main:app --reload --port 8000
```

## API Changes

### New Endpoints

```
POST /api/auth/signup
POST /api/auth/login
```

### Existing Endpoints
All existing crop recommendation endpoints remain unchanged:
- `POST /api/predict/recommend`
- `GET /api/weather/*`
- `GET /api/soil/*`

## Security Improvements

1. **Password Hashing**: Bcrypt with automatic salting
2. **JWT Tokens**: Secure, stateless authentication
3. **Email Validation**: Proper email format checking
4. **Session Management**: Secure session handling
5. **CORS Protection**: Configured for specific origins

## Performance Impact

- **Minimal overhead**: JWT validation is fast
- **Database queries**: Cached for performance
- **No breaking changes**: Existing features work the same

## Rollback Plan

If you need to rollback to demo mode:

1. **Checkout previous commit**:
   ```bash
   git log --oneline  # Find commit before auth changes
   git checkout <commit-hash>
   ```

2. **Or manually revert**:
   - Remove auth routes from backend
   - Restore old login page
   - Remove auth dependencies

## Support

Need help with migration?

1. **Check documentation**:
   - AUTHENTICATION_SETUP.md - Detailed setup guide
   - AUTHENTICATION_IMPLEMENTATION.md - Technical details

2. **Run tests**:
   ```bash
   cd backend
   python test_auth.py
   ```

3. **Check logs**:
   - Backend logs: Terminal running uvicorn
   - Frontend logs: Browser console (F12)

4. **Verify environment**:
   - Check .env files exist
   - Verify API URLs are correct
   - Confirm ports are available

## Next Steps

After successful migration:

1. **Test thoroughly**:
   - Create test accounts
   - Try login/logout
   - Test Google OAuth
   - Verify crop recommendations still work

2. **Update documentation**:
   - Update team wiki
   - Notify users of changes
   - Provide training if needed

3. **Monitor**:
   - Watch for auth errors
   - Check database growth
   - Monitor API performance

4. **Plan enhancements**:
   - Email verification
   - Password reset
   - Two-factor authentication
   - Social login (Facebook, GitHub)

## FAQ

**Q: Do I need to recreate my Google OAuth credentials?**
A: No, existing Google OAuth setup continues to work.

**Q: Can I use PostgreSQL instead of SQLite?**
A: Yes, just update DATABASE_URL in backend/.env

**Q: Is my password stored securely?**
A: Yes, passwords are hashed with bcrypt before storage.

**Q: Can I disable authentication for development?**
A: Not recommended, but you can modify the code to skip auth checks.

**Q: How long do sessions last?**
A: JWT tokens expire after 30 minutes (configurable).

**Q: Can I migrate existing user data?**
A: Demo mode didn't store real data, so there's nothing to migrate.

**Q: What happens to the "Skip Login" button?**
A: It's been removed. All users must authenticate.

**Q: Can I still use the app without creating an account?**
A: No, authentication is now required to access the dashboard.
