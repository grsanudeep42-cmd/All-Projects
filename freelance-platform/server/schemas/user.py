from pydantic import BaseModel, EmailStr
from typing import Optional, Dict

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password_hash: str
    role: str
    profile_data: Optional[Dict] = {}

class UserOut(UserCreate):
    id: int
    verified: bool
    joined_at: str  # Always return as string

    class Config:
        orm_mode = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    location: Optional[str] = None
    avatar: Optional[str] = None

    class Config:
        from_attributes = True
