from sqlalchemy import Column, Integer, ForeignKey, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from db.database import Base

class Message(Base):
    __tablename__ = "message"
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), index=True)
    sender_id = Column(Integer, index=True)
    receiver_id = Column(Integer, index=True)
    content = Column(String)
    sent_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")

