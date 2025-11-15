# freelance-platform/server/models/order.py

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, DECIMAL
from sqlalchemy.orm import relationship
from datetime import datetime
from db.database import Base  # ✅ use the same import path as other models


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(String(50), default="pending")
    total_price = Column(DECIMAL(10, 2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Foreign key for the gig being ordered
    gig_id = Column(Integer, ForeignKey("gigs.id"), nullable=False)

    # Foreign key for the user who is buying the gig
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # --- RELATIONSHIPS ---

    # Link the order back to the gig
    gig = relationship("Gig", back_populates="orders")

    # Link the order back to the buyer (a User)
    buyer = relationship("User", back_populates="orders")
