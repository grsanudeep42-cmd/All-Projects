# models/job.py

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from db.database import Base

class Job(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    budget = Column(Integer, nullable=False)
    deadline = Column(DateTime, nullable=True)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    freelancer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    amount = Column(Integer, nullable=True)
    status = Column(String, nullable=False)
    posted_at = Column(DateTime, default=datetime.utcnow)

    client = relationship("User", foreign_keys=[client_id])
    freelancer = relationship("User", foreign_keys=[freelancer_id], back_populates="jobs")

    # --- FIX 1: Move relationship INSIDE the class ---
    applications = relationship("Application", back_populates="job")

# --- FIX 2: Delete all the lines that were down here ---