# routes/protected.py

from fastapi import APIRouter, Depends
from models.user import User
from utils.auth import get_current_user

router = APIRouter()

@router.get("/me")
async def read_profile(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "email": current_user.email}
