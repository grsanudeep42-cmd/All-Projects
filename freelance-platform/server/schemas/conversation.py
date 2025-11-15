from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ConversationBase(BaseModel):
    job_id: int
    client_id: int
    freelancer_id: int

class ConversationCreate(ConversationBase):
    pass

class Conversation(ConversationBase):
    id: int
    created_at: str
    created_at: datetime
    class Config:
        orm_mode = True
