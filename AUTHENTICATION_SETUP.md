# Authentication System Setup Guide

## Overview

The Smart Crop Advisor now includes a complete authentication system with:
- Email/Password signup and login with backend integration
- Google OAuth authentication
- JWT token-based session management
- Secure password hashing with bcrypt
- SQLite database for user storage (easily upgradeable to PostgreSQL)

## Features

### 1. Email/Password Authentication
- User registration with first name, last name, email, and password
- Password validation (minimum 6 characters)
- Password confirmation during signup
- Secure password hashing using bcrypt
- JWT token generation for authenticated sessions

### 2. Google OAuth
- One-click Google sign-in
- Automatic user profile retrieval
- Seamless integration with NextAuth.js

### 3. Security Features
- Passwords hashed with bcrypt before storage
- JWT tokens for stateless authentication
- Email uniqueness validation
- Active user status checking
- Secure session management

## Backend Setup

### 1. Install Dependencies

The backend requires additional packages for authentication:

```bash
cd smart-crop-advisor/backend
pip install -r requirements.txt
```

New dependencies added:
- `passlib[bcrypt]` - Password hashing
- `python-jose[cryptography]` - JWT token generation
- `pydantic[email]` - Email validation

### 2. Database Configuration

By default, the system uses SQLite for easy setup:

```env
DATABASE_URL=sqlite:///./crop_advisor.db
```

For production, you can switch to PostgreSQL:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/crop_advisor
```

### 3. JWT Configuration

Update your `.env` file with secure keys:

```env
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Generate a secure secret key:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 4. Start the Backend

```bash
cd smart-crop-advisor/backend
uvicorn app.main:app --reload --port 8000
```

The database tables will be created automatically on first run.

## Frontend Setup

### 1. Environment Variables

Ensure your `.env.local` has:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
AUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3001

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 2. Start the Frontend

```bash
cd smart-crop-advisor/frontend
npm install
npm run dev
```

## API Endpoints

### POST /api/auth/signup
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "is_active": true,
  "created_at": "2024-02-17T10:30:00Z"
}
```

### POST /api/auth/login
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

## User Flow

### Signup Flow
1. User fills in first name, last name, email, password, and confirm password
2. Frontend validates password match and length
3. Frontend sends POST request to `/api/auth/signup`
4. Backend validates email uniqueness
5. Backend hashes password with bcrypt
6. Backend creates user record in database
7. Frontend automatically logs in user with credentials
8. User is redirected to dashboard

### Login Flow
1. User enters email and password
2. Frontend sends credentials to NextAuth
3. NextAuth calls backend `/api/auth/login` endpoint
4. Backend verifies email exists and password matches
5. Backend generates JWT token
6. NextAuth creates session with token
7. User is redirected to dashboard

### Google OAuth Flow
1. User clicks "Continue with Google"
2. User is redirected to Google consent screen
3. User authorizes the application
4. Google redirects back with authorization code
5. NextAuth exchanges code for user profile
6. Session is created with Google profile data
7. User is redirected to dashboard

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR UNIQUE NOT NULL,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    hashed_password VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Security Best Practices

1. **Never store plain text passwords** - Always use bcrypt hashing
2. **Use HTTPS in production** - Protect tokens in transit
3. **Rotate JWT secrets regularly** - Update JWT_SECRET_KEY periodically
4. **Implement rate limiting** - Prevent brute force attacks
5. **Add email verification** - Confirm user email addresses
6. **Implement password reset** - Allow users to recover accounts
7. **Use strong password policies** - Enforce minimum length and complexity

## Testing

### Test Signup
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

## Troubleshooting

### "Email already registered" error
- The email is already in the database
- Try logging in instead of signing up
- Use a different email address

### "Invalid email or password" error
- Check that email and password are correct
- Passwords are case-sensitive
- Ensure backend is running

### "Failed to sign in with Google"
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set
- Check that redirect URI is configured in Google Console
- See GOOGLE_AUTH_SETUP.md for detailed OAuth setup

### Database connection errors
- Ensure DATABASE_URL is correct
- For SQLite, check file permissions
- For PostgreSQL, verify database exists and credentials are correct

## Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Two-factor authentication (2FA)
- [ ] Social login (Facebook, GitHub, etc.)
- [ ] Account deletion
- [ ] Password strength meter
- [ ] Login history tracking
- [ ] Session management (logout all devices)

## Files Modified

### Backend
- `backend/app/models/user.py` - User database model
- `backend/app/routes/auth.py` - Authentication endpoints
- `backend/app/schemas/user.py` - Pydantic schemas for validation
- `backend/app/core/security.py` - Password hashing and JWT utilities
- `backend/app/core/config.py` - JWT configuration
- `backend/app/database/db.py` - SQLite support
- `backend/app/main.py` - Auth router registration
- `backend/requirements.txt` - New dependencies

### Frontend
- `frontend/src/app/login/page.tsx` - Updated login/signup UI
- `frontend/src/auth.ts` - Credentials provider configuration
- `frontend/.env.local` - Environment variables

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API documentation at http://localhost:8000/docs
3. Check backend logs for error messages
4. Verify all environment variables are set correctly
