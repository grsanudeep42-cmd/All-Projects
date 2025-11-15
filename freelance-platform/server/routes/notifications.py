from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from db.database import get_db
from models.application import Application
from models.user import User
from utils.auth import get_current_user

router = APIRouter()
print("LOADING NOTIFICATIONS ROUTER")

@router.get("/test")
async def test_route():
    return {"status": "working"}

@router.get("/count/applications")
async def count_applications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        # Count pending applications for jobs owned by current user
        result = await db.execute(
            select(func.count(Application.id)).where(
                Application.job.has(client_id=current_user.id),
                Application.status == 'pending'
            )
        )
        count = result.scalar() or 0
        return {"count": count}
    except Exception as e:
        print(f"Error in count_applications: {e}")
        return {"count": 0}

@router.get("/count/responses")
async def count_responses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        # Count unseen accepted/rejected applications for current freelancer
        result = await db.execute(
            select(func.count(Application.id)).where(
                Application.freelancer_id == current_user.id,
                Application.status.in_(['accepted', 'rejected']),
                Application.seen == False
            )
        )
        count = result.scalar() or 0
        return {"count": count}
    except Exception as e:
        print(f"Error in count_responses: {e}")
        return {"count": 0}


