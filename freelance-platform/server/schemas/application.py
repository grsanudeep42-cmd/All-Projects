from pydantic import BaseModel
from typing import Optional
import datetime

class ApplicationCreate(BaseModel):
    job_id: int
    freelancer_id: int
    bid_amount: float
    proposed_deadline: Optional[datetime.datetime]
    proposal_text: str
    status: Optional[str] = "pending"

class ApplicationOut(ApplicationCreate):
    id: int
    submitted_at: datetime.datetime

    class Config:
        from_attributes = True 
