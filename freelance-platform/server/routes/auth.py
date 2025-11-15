from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.user import User
from schemas.auth import LoginRequest
from utils.auth import verify_password, create_access_token, get_password_hash
from db.database import get_db
from fastapi.security import OAuth2PasswordRequestForm
from typing_extensions import Annotated
from pydantic import BaseModel
import datetime
router = APIRouter()

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

@router.post("/auth/register", response_model=Token)
async def register(user: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = get_password_hash(user.password)
    new_user = User(name=user.name, email=user.email, password_hash=hashed)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    access_token = create_access_token(data={"sub": str(new_user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
        },
    }

@router.post("/auth/login", response_model=Token)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: AsyncSession = Depends(get_db)
):
    print("LOGIN DEBUG:", datetime.datetime.now())
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": getattr(user, "name", None),
            "email": user.email,
        },
    }
