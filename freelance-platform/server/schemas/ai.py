from pydantic import BaseModel
from typing import Optional

class MessageRequest(BaseModel):
    message: str

class ScamResult(BaseModel):
    is_scam: bool
    probability: Optional[float]

class RasaResult(BaseModel):
    intent: Optional[str]
    confidence: Optional[float]
