# models/application.py

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from db.database import Base

class Application(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    freelancer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    proposal_text = Column(Text, nullable=True)
    bid_amount = Column(Numeric, nullable=True)
    proposed_deadline = Column(DateTime, nullable=True)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

    # --- FIX 2: Move relationships INSIDE the class ---
    job = relationship("Job", back_populates="applications")
    freelancer = relationship("User", foreign_keys=[freelancer_id], back_populates="job_applications")

# --- FIX 3: Delete all the lines that were down here ---