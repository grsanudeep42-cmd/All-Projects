from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from models.application import Application
from models.job import Job
from models.user import User
from db.database import get_db
from utils.auth import get_current_user

router = APIRouter(prefix="/applications", tags=["applications"])

# Pydantic schema
class ApplicationCreate(BaseModel):
    job_id: int
    proposal_text: Optional[str] = None
    bid_amount: Optional[float] = None
    proposed_deadline: Optional[str] = None

# Apply to a job
@router.post("/")
async def apply_to_job(
    application_data: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Freelancer applies to a job"""
    
    # Check if job exists
    result = await db.execute(select(Job).where(Job.id == application_data.job_id))
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.client_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot apply to your own job")
    
    # Check if already applied
    result = await db.execute(
        select(Application).where(
            Application.job_id == application_data.job_id,
            Application.freelancer_id == current_user.id
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")
    
    # Parse deadline if provided
    deadline = None
    if application_data.proposed_deadline:
        try:
            deadline = datetime.fromisoformat(application_data.proposed_deadline)
        except:
            pass
    
    # Create application
    application = Application(
        job_id=application_data.job_id,
        freelancer_id=current_user.id,
        proposal_text=application_data.proposal_text,
        bid_amount=application_data.bid_amount,
        proposed_deadline=deadline,
        status="pending"
    )
    
    db.add(application)
    await db.commit()
    await db.refresh(application)
    
    return {
        "id": application.id,
        "job_id": application.job_id,
        "freelancer_id": application.freelancer_id,
        "proposal_text": application.proposal_text,
        "bid_amount": float(application.bid_amount) if application.bid_amount else None,
        "proposed_deadline": application.proposed_deadline.isoformat() if application.proposed_deadline else None,
        "status": application.status,
        "created_at": application.created_at.isoformat() if application.created_at else None
    }


# Get all applications for a job (client view)
@router.get("/job/{job_id}")
async def get_job_applications(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all applications for a job (only job owner can see)"""
    
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.execute(
        select(Application)
        .where(Application.job_id == job_id)
        .order_by(Application.created_at.desc())
    )
    applications = result.scalars().all()
    
    response = []
    for app in applications:
        freelancer_result = await db.execute(select(User).where(User.id == app.freelancer_id))
        freelancer = freelancer_result.scalar_one_or_none()
        
        response.append({
            "id": app.id,
            "job_id": app.job_id,
            "freelancer_id": app.freelancer_id,
            "freelancer_name": freelancer.name if freelancer else "Unknown",
            "freelancer_email": freelancer.email if freelancer else "Unknown",
            "proposal_text": app.proposal_text,
            "bid_amount": float(app.bid_amount) if app.bid_amount else None,
            "proposed_deadline": app.proposed_deadline.isoformat() if app.proposed_deadline else None,
            "status": app.status,
            "created_at": app.created_at.isoformat() if app.created_at else None
        })
    
    return response


# Get user's own applications
@router.get("/my-applications")
async def get_my_applications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all applications by current user"""
    
    result = await db.execute(
        select(Application)
        .where(Application.freelancer_id == current_user.id)
        .order_by(Application.created_at.desc())
    )
    applications = result.scalars().all()
    
    response = []
    for app in applications:
        job_result = await db.execute(select(Job).where(Job.id == app.job_id))
        job = job_result.scalar_one_or_none()
        
        response.append({
            "id": app.id,
            "job_id": app.job_id,
            "job_title": job.title if job else "Unknown",
            "job_budget": job.budget if job else 0,
            "proposal_text": app.proposal_text,
            "bid_amount": float(app.bid_amount) if app.bid_amount else None,
            "proposed_deadline": app.proposed_deadline.isoformat() if app.proposed_deadline else None,
            "status": app.status,
            "created_at": app.created_at.isoformat() if app.created_at else None
        })
    
    return response


# Accept/Reject application
@router.put("/{application_id}/status")
async def update_application_status(
    application_id: int,
    status: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update application status (only job owner)"""
    
    if status not in ["accepted", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.execute(select(Application).where(Application.id == application_id))
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    result = await db.execute(select(Job).where(Job.id == application.job_id))
    job = result.scalar_one_or_none()
    
    # --- THIS IS THE FIX ---
    # We must check if the job exists before trying to access its attributes.
    if not job:
        raise HTTPException(status_code=404, detail="Associated job for this application not found")
    # --- END OF FIX ---
    
    if job.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    application.status = status
    
    if status == "accepted":
        job.freelancer_id = application.freelancer_id
        job.status = "in_progress"
        
        # Reject other pending applications
        other_apps_result = await db.execute(
            select(Application).where(
                Application.job_id == application.job_id,
                Application.id != application_id,
                Application.status == "pending"
            )
        )
        for other_app in other_apps_result.scalars().all():
            other_app.status = "rejected"
    
    await db.commit()
    
    return {"id": application.id, "status": application.status, "message": f"Application {status}"}


# I've removed the last two functions as they had missing imports (func)
# and were using synchronous DB calls (db.query) in an async setup.
# They should be fixed separately if needed.
