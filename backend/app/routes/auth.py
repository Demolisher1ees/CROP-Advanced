from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, ForgotPasswordRequest, ResetPasswordRequest, CheckEmailResponse, GoogleAuthRequest
from app.core.security import verify_password, get_password_hash, create_access_token
from datetime import timedelta, datetime, timezone
import secrets
from app.models.password_reset import PasswordReset
from app.core.limiter import limiter
from app.services.email_service import send_email
import os
from app.core.logger import logger
from app.core.config import settings

router = APIRouter()


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    # generate email verification token
    verification_token = secrets.token_urlsafe(32)
    new_user = User(
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        hashed_password=hashed_password,
        verification_token=verification_token,
        is_verified=False
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Send verification email
    if settings.SMTP_HOST:
        try:
            verification_link = f"{settings.FRONTEND_URL}/verify?token={verification_token}"
            send_email(
                new_user.email,
                "Verify Your Account",
                f"Click here to verify: {verification_link}"
            )
        except Exception as e:
            logger.error(f"Failed to send verification email to {new_user.email}: {e}")
    else:
        logger.info(f"Verification token for {new_user.email}: {new_user.verification_token}")
    
    return new_user


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login(request: Request, user_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token"""
    # Find user by email
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    # Check email verification bypassed for development
    # if not user.is_verified:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="Email address not verified"
    #     )
    
    # Create access token with user info
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={
            "sub": user.email,
            "name": f"{user.first_name} {user.last_name}",
            "user_id": user.id
        },
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "name": f"{user.first_name} {user.last_name}"
    }


@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    """Verify user email address using token"""
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")
    user.is_verified = True
    user.verification_token = None
    db.commit()
    return {"message": "Email verified successfully"}


@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Initiate password reset request"""
    user = db.query(User).filter(User.email == request.email).first()
    if user:
        token = secrets.token_urlsafe(48)
        expires = datetime.now(timezone.utc) + timedelta(minutes=15)
        reset = PasswordReset(user_id=user.id, token=token, expires_at=expires)
        db.add(reset)
        db.commit()
        
        # Send reset email
        if settings.SMTP_HOST:
            try:
                reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
                send_email(
                    user.email,
                    "Reset Your Password",
                    f"Click here to reset your password: {reset_link}"
                )
            except Exception as e:
                logger.error(f"Failed to send reset email to {user.email}: {e}")
        else:
            logger.info(f"Password reset token for {user.email}: {token}")
    # Always return success to avoid enumeration
    return {"message": "If the email is registered, instructions have been sent."}


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Complete password reset using token"""
    record = db.query(PasswordReset).filter(PasswordReset.token == request.token).first()
    if not record or record.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")
    user = db.query(User).filter(User.id == record.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")
    user.hashed_password = get_password_hash(request.new_password)
    db.delete(record)
    db.commit()
    return {"message": "Password has been reset successfully."}


@router.get("/me", response_model=UserResponse)
async def get_current_user(db: Session = Depends(get_db)):
    """Get current user profile"""
    # This would normally use JWT token validation
    # For now, returning a placeholder
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Token validation not implemented yet"
    )

@router.get("/check-email", response_model=CheckEmailResponse)
def check_email(email: str, db: Session = Depends(get_db)):
    """Check if an email is already registered"""
    user = db.query(User).filter(User.email == email).first()
    return {"exists": user is not None}

@router.post("/google", response_model=Token)
async def google_auth(user_data: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Authenticate or register user via Google OAuth"""
    user = db.query(User).filter(User.email == user_data.email).first()
    
    if not user:
        # Generate a random secure password for the Google user
        random_password = secrets.token_urlsafe(20) + "A1!"
        hashed_password = get_password_hash(random_password)
        
        user = User(
            email=user_data.email,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            hashed_password=hashed_password,
            is_verified=True  # Google users are automatically verified
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
        
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={
            "sub": user.email,
            "name": f"{user.first_name} {user.last_name}",
            "user_id": user.id
        },
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "name": f"{user.first_name} {user.last_name}"
    }


@router.delete("/delete-account")
async def delete_account(request: Request, db: Session = Depends(get_db)):
    """Permanently delete a user account and all associated data."""
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request body")

    email = body.get("email") if body else None
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is required")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Delete associated password resets
    db.query(PasswordReset).filter(PasswordReset.user_id == user.id).delete()

    # Delete associated crops
    from app.models.crop import Crop
    db.query(Crop).filter(Crop.user_id == user.id).delete()

    # Delete the user
    db.delete(user)
    db.commit()

    logger.info(f"Account deleted for: {email}")
    return {"message": "Account deleted successfully"}
