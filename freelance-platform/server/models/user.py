# models/user.py

from sqlalchemy import Column, Integer, String, Boolean, JSON, DateTime
from sqlalchemy.orm import relationship
import datetime
from db.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    phone = Column(String, unique=True)
    password_hash = Column(String)
    role = Column(String, nullable=False, default="freelancer")
    verified = Column(Boolean, default=False)
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)
    profile_data = Column(JSON)

    gigs = relationship("Gig", back_populates="freelancer", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="buyer", cascade="all, delete-orphan")
    jobs = relationship("Job", back_populates="freelancer", foreign_keys="Job.freelancer_id", cascade="all, delete-orphan")

    # --- FIX 1: Move relationship INSIDE the class ---
    job_applications = relationship("Application", back_populates="freelancer")

# --- FIX 2: Delete all the lines that were down here ---