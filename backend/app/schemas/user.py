from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from typing import Optional
import re


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)

    @validator('password')
    def check_password_strength(cls, v):
        # at least one uppercase letter and one digit
        if len(v) < 8 or not re.search(r"[A-Z]", v) or not re.search(r"\d", v):
            raise ValueError('Password must be at least 8 characters, contain an uppercase letter and a number')
        return v

    @validator('first_name', 'last_name', pre=True)
    def strip_names(cls, v):
        return v.strip()

    @validator('email', pre=True)
    def strip_email(cls, v):
        return v.strip()


class UserLogin(BaseModel):
    email: EmailStr
    password: str

    @validator('email', pre=True)
    def strip_email(cls, v):
        return v.strip()


class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    name: Optional[str] = None


class TokenData(BaseModel):
    email: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)
