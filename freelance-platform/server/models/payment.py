from sqlalchemy import Column, Integer, Numeric, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from db.database import Base

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Numeric, nullable=False)
    payment_method = Column(String, nullable=False, default="upi")
    status = Column(String, nullable=False, default="pending")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    job = relationship("Job")
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])
