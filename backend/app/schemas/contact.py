from pydantic import BaseModel, EmailStr, validator


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    message: str

    @validator('name', 'message', pre=True)
    def strip_text(cls, v):
        return v.strip()

    @validator('email', pre=True)
    def strip_email(cls, v):
        return v.strip()


class ContactResponse(BaseModel):
    success: bool
    message: str
