from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

class GigBase(BaseModel):
    title: str
    description: str
    category: str
    price: Decimal
    delivery_days: int
    is_active: bool = True

class GigCreate(GigBase):
    pass

class GigUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[Decimal] = None
    delivery_days: Optional[int] = None
    is_active: Optional[bool] = None

class GigOut(GigBase):
    id: int
    freelancer_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
