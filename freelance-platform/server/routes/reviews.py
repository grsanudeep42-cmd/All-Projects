from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.review import Review
from models.job import Job
from models.user import User
from schemas.review import ReviewCreate, ReviewOut
from db.database import get_db
from utils.auth import get_current_user
from datetime import datetime
from typing import List

router = APIRouter()


@router.post("/reviews/", response_model=ReviewOut)
async def create_review(
    review: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    result = await db.execute(select(Job).where(Job.id == review.job_id))
    job = result.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if user.id not in [job.client_id, job.freelancer_id]:
        raise HTTPException(status_code=403, detail="You are not part of this job")

    if review.reviewee_id not in [job.client_id, job.freelancer_id] or review.reviewee_id == user.id:
        raise HTTPException(status_code=400, detail="Invalid reviewee")

    if job.status != "completed":
        raise HTTPException(status_code=400, detail="Job not completed yet")

    result = await db.execute(
        select(Review).where(Review.job_id == review.job_id, Review.reviewer_id == user.id)
    )
    existing = result.scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Review already submitted")

    db_review = Review(
        job_id=review.job_id,
        reviewer_id=user.id,
        reviewee_id=review.reviewee_id,
        rating=review.rating,
        review_text=review.text,  
        created_at=datetime.utcnow()
    )
    db.add(db_review)
    await db.commit()
    await db.refresh(db_review)
    return db_review


@router.get("/reviews/job/{job_id}", response_model=List[ReviewOut])
async def list_job_reviews(job_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Review).where(Review.job_id == job_id))
    return result.scalars().all()


@router.get("/reviews/user/{user_id}", response_model=List[ReviewOut])
async def list_user_reviews(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Review).where(Review.reviewee_id == user_id))
    return result.scalars().all()
