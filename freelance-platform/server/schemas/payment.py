from pydantic import BaseModel
from typing import Optional
import datetime

class PaymentCreate(BaseModel):
    job_id: int
    sender_id: int
    receiver_id: int
    amount: float
    payment_method: str
    status: Optional[str] = "pending"

class PaymentOut(PaymentCreate):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True
