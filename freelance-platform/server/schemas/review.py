from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReviewCreate(BaseModel):
    job_id: int
    reviewee_id: int
    rating: int
    text: str  # ✅ API still accepts "text" from frontend

class ReviewOut(BaseModel):
    id: int
    job_id: int
    reviewer_id: int
    reviewee_id: int
    rating: int
    review_text: str  # ✅ But output uses "review_text" from database
    created_at: datetime
    
    class Config:
        from_attributes = True
