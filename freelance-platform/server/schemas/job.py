from pydantic import BaseModel
from typing import Optional
import datetime

class JobCreate(BaseModel):
    title: str
    description: str
    client_id: int
    status: Optional[str] = "open"
    budget: float
    deadline: Optional[datetime.datetime]

class JobOut(JobCreate):
    id: int
    title: str
    description: str
    freelancer_id: Optional[int] = None    # <--- Make this OPTIONAL!
    amount: Optional[int] = None           # <--- Make this OPTIONAL!
    posted_at: datetime.datetime

    class Config:
        from_attributes = True
