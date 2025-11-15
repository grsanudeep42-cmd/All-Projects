from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.gig import Gig
from models.user import User
from schemas.gig import GigCreate, GigOut, GigUpdate
from db.database import get_db
from utils.auth import get_current_user
from typing import List

router = APIRouter()

@router.post("/gigs", response_model=GigOut)
async def create_gig(
    gig: GigCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_gig = Gig(**gig.dict(), freelancer_id=current_user.id)
    db.add(new_gig)
    await db.commit()
    await db.refresh(new_gig)
    return new_gig

@router.get("/gigs", response_model=List[GigOut])
async def list_gigs(
    category: str = None,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Gig).where(Gig.is_active == True)
    if category:
        stmt = stmt.where(Gig.category == category)
    result = await db.execute(stmt)
    gigs = result.scalars().all()
    return gigs

@router.get("/gigs/{gig_id}", response_model=GigOut)
async def get_gig(gig_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Gig).where(Gig.id == gig_id))
    gig = result.scalar_one_or_none()
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    return gig

@router.put("/gigs/{gig_id}", response_model=GigOut)
async def update_gig(
    gig_id: int,
    gig_update: GigUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Gig).where(Gig.id == gig_id))
    gig = result.scalar_one_or_none()
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    if gig.freelancer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    for field, value in gig_update.dict(exclude_unset=True).items():
        setattr(gig, field, value)
    
    await db.commit()
    await db.refresh(gig)
    return gig

@router.delete("/gigs/{gig_id}")
async def delete_gig(
    gig_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Gig).where(Gig.id == gig_id))
    gig = result.scalar_one_or_none()
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    if gig.freelancer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.delete(gig)
    await db.commit()
    return {"message": "Gig deleted successfully"}
