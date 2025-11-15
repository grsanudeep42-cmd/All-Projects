from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.message import Message
from schemas.message import MessageCreate, MessageOut
from db.database import get_db
from typing import List

router = APIRouter()

@router.post("/messages", response_model=MessageOut)
async def create_message(message: MessageCreate, db: AsyncSession = Depends(get_db)):
    # Input validation
    content = message.content.strip()
    if not content:
        raise HTTPException(status_code=400, detail="Message cannot be empty or just whitespace")
    if len(content) > 1000:
        raise HTTPException(status_code=400, detail="Message must be less than 1000 characters")
    if "<script" in content.lower():
        raise HTTPException(status_code=400, detail="Potentially unsafe content detected")

    # Safe to create and persist the message
    new_message = Message(**message.dict())
    db.add(new_message)
    await db.commit()
    await db.refresh(new_message)
    return new_message


@router.get("/messages/{message_id}", response_model=MessageOut)
async def get_message(message_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Message).where(Message.id == message_id))
    msg = result.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    return msg

@router.get("/messages", response_model=List[MessageOut])
async def list_messages(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Message))
    msgs = result.scalars().all()
    return msgs

# Add filtering by conversation or users for scalable chat
@router.get("/messages/conversation/{conversation_id}", response_model=List[MessageOut])
async def get_messages_for_conversation(
    conversation_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.timestamp.asc())
    )
    messages = result.scalars().all()
    return messages