from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    """Schema for creating a new user (registration)."""
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    email: EmailStr = Field(..., description="Unique email address")
    password: str = Field(..., min_length=8, description="User password")
    name: Optional[str] = Field(None, max_length=100)
    gender: Optional[str] = Field(None, max_length=20)
    phone_number: Optional[str] = Field(None, max_length=30)
    city: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    address: Optional[str] = Field(None, max_length=255)


class UserResponse(BaseModel):
    """Schema for returning user data to the client (no sensitive fields)."""
    id: int
    username: str
    email: EmailStr
    name: Optional[str] = None
    gender: Optional[str] = None
    phone_number: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    address: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class UserAdminResponse(UserResponse):
    """Extended response for admins (includes admin fields and timestamps)."""
    is_admin: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """Schema for full update (PUT) - all fields optional."""
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    name: Optional[str] = Field(None, max_length=100)
    gender: Optional[str] = Field(None, max_length=20)
    phone_number: Optional[str] = Field(None, max_length=30)
    city: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    address: Optional[str] = Field(None, max_length=255)

    class Config:
        from_attributes = True


class UserPatch(BaseModel):
    """Schema for partial update (PATCH) - all fields optional."""
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    name: Optional[str] = Field(None, max_length=100)
    gender: Optional[str] = Field(None, max_length=20)
    phone_number: Optional[str] = Field(None, max_length=30)
    city: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    address: Optional[str] = Field(None, max_length=255)

    class Config:
        from_attributes = True


class UserPasswordChange(BaseModel):
    """Schema for changing password (separate endpoint)."""
    current_password: str
    new_password: str = Field(..., min_length=8, description="New password")
    
    class Config:
        from_attributes = True
        
        
class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    name: str | None
    gender: str | None
    phone_number: str | None
    city: str | None
    country: str | None
    address: str | None
    is_active: bool
    is_admin: bool

    class Config:
        from_attributes = True
        
class userIn(BaseModel):
    id: int
    username: str
    email: EmailStr
    name: str | None
    gender: str | None
    phone_number: str | None
    city: str | None
    country: str | None
    address: str | None
    is_active: bool
    is_admin: bool  

    class Config:
        from_attributes = True
        
