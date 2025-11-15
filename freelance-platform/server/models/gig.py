# freelance-platform/server/models/gig.py

from sqlalchemy import Column, Integer, String, Text, DECIMAL, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from db.database import Base
# Avoid importing User directly here to prevent circular imports
from .order import Order  # This is fine — no circular dependency with User


class Gig(Base):
    __tablename__ = "gigs"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)
    delivery_days = Column(Integer, nullable=False, default=7)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign key referencing users table
    freelancer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # --- RELATIONSHIPS ---
    # Link gig back to its freelancer owner
    freelancer = relationship("User", back_populates="gigs")
    
    # Link gig to all its orders
    orders = relationship("Order", back_populates="gig", cascade="all, delete-orphan")
