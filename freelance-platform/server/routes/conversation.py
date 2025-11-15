from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.conversation import Conversation           # SQLAlchemy ORM model (for queries)
from models.message import Message
from schemas import ConversationCreate, Conversation as ConversationSchema  # Pydantic schema (for response_model)
from db.database import get_db
from utils.auth import get_current_user
from models.user import User
from typing import List
from datetime import datetime

router = APIRouter()

# List all conversations for current user (matches inbox view)
@router.get("/conversations", response_model=List[ConversationSchema])
async def get_conversations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Conversation).where(
        (Conversation.client_id == current_user.id) |
        (Conversation.freelancer_id == current_user.id)
    )
    result = await db.execute(stmt)
    conversations = result.scalars().all()
    return conversations

# Create a new conversation (job-based)
@router.post("/conversations", response_model=ConversationSchema)
async def create_conversation(
    convo: ConversationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not (current_user.id == convo.client_id or current_user.id == convo.freelancer_id):
        raise HTTPException(status_code=403, detail="Not allowed (must be participant)")
    conversation = Conversation(
        job_id=convo.job_id,
        client_id=convo.client_id,
        freelancer_id=convo.freelancer_id,
        created_at=datetime.utcnow()
    )
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)
    return conversation

# Get all messages for a conversation (thread)
@router.get("/conversations/{conversation_id}/messages")
async def get_conversation_messages(
    conversation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Message).where(Message.conversation_id == conversation_id)
    result = await db.execute(stmt)
    messages = result.scalars().all()
    return [msg.__dict__ for msg in messages]   # Or use a MessageOut schema for cleaner responses
