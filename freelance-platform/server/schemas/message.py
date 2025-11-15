from pydantic import BaseModel
from typing import Optional
import datetime

class MessageCreate(BaseModel):
    conversation_id: Optional[int] = None
    sender_id: int
    receiver_id: int
    content: str

class MessageOut(MessageCreate):
    id: int
    sent_at: datetime.datetime

    class Config:
        from_attributes = True
