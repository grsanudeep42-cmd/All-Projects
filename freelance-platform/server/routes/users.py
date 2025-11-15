from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from datetime import datetime

from models.user import User
from models.review import Review
from schemas.user import UserCreate, UserOut, UserUpdate
from db.database import get_db
from utils.auth import get_current_user

router = APIRouter()

# ✅ PUT - Update own profile
@router.put("/users/me", response_model=UserOut)
async def update_me(
    update: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update the current user's profile"""
    for field in ["name", "phone"]:
        if getattr(update, field) is not None:
            setattr(current_user, field, getattr(update, field))

    if current_user.profile_data is None:
        current_user.profile_data = {}

    for field in ["bio", "skills", "location", "avatar"]:
        value = getattr(update, field)
        if value is not None:
            current_user.profile_data[field] = value

    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)

    user_dict = current_user.__dict__.copy()
    if isinstance(user_dict.get("joined_at"), datetime):  # ✅ FIXED: Use joined_at
        user_dict["joined_at"] = user_dict["joined_at"].isoformat()
    user_dict["profile_data"] = user_dict.get("profile_data", {})

    return user_dict


# ✅ GET - Public profile by user ID (no auth required)
@router.get("/users/{user_id}")
async def get_user_profile(user_id: int, db: AsyncSession = Depends(get_db)):
    """Get public profile of any user by ID"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "verified": user.verified,
        "joined_at": user.joined_at.isoformat() if user.joined_at else None,  # ✅ FIXED: Use joined_at
        "profile_data": user.profile_data or {}
    }




# ✅ GET - All reviews for a user (no auth required)
@router.get("/users/{user_id}/reviews")
async def get_user_reviews(user_id: int, db: AsyncSession = Depends(get_db)):
    """Get all reviews written about this user (as reviewee)"""
    result = await db.execute(
        select(Review)
        .where(Review.reviewee_id == user_id)
        .order_by(Review.created_at.desc())
    )
    reviews = result.scalars().all()
    return reviews
