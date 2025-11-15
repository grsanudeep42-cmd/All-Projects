from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.job import Job
from schemas.job import JobCreate, JobOut
from db.database import get_db
from utils.roles import require_role
from typing import List
from utils.auth import get_current_user
from models.user import User


router = APIRouter()

@router.post("/jobs", dependencies=[Depends(get_current_user)])
async def create_job(
    job: JobCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_role('client')(current_user)  # Role check
    new_job = Job(**job.dict())
    db.add(new_job)
    await db.commit()
    await db.refresh(new_job)
    return new_job

@router.get("/jobs/{job_id}", response_model=JobOut)
async def get_job(job_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.get("/jobs", response_model=List[JobOut])
async def list_jobs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job))
    jobs = result.scalars().all()
    return jobs

# Remove the second @router.post("/jobs") since it's duplicate
