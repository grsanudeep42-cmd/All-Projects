# routers/reviews.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user
from ..models import Review, Job, User

router = APIRouter()

@router.post("/reviews/", response_model=schemas.ReviewOut)
def create_review(
    review: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Check job exists
    job = db.query(Job).filter(Job.id == review.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Reviewer must be part of the job (either client or freelancer)
    if user.id not in [job.client_id, job.freelancer_id]:
        raise HTTPException(status_code=403, detail="You are not part of this job")

    # Validate reviewee
    if review.reviewee_id not in [job.client_id, job.freelancer_id] or review.reviewee_id == user.id:
        raise HTTPException(status_code=400, detail="Invalid reviewee")

    # Check if job is completed (depends on your Job model)
    if job.status != "completed":
        raise HTTPException(status_code=400, detail="Job not completed yet")

    # Prevent duplicate review by same reviewer for same job
    existing = db.query(Review).filter(
        Review.job_id == review.job_id,
        Review.reviewer_id == user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Review already submitted")

    db_review = Review(
        job_id=review.job_id,
        reviewer_id=user.id,
        reviewee_id=review.reviewee_id,
        rating=review.rating,
        text=review.text,
        created_at=datetime.utcnow()
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

@router.get("/reviews/job/{job_id}", response_model=List[schemas.ReviewOut])
def list_job_reviews(job_id: int, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.job_id == job_id).all()

@router.get("/reviews/user/{user_id}", response_model=List[schemas.ReviewOut])
def list_user_reviews(user_id: int, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.reviewee_id == user_id).all()
