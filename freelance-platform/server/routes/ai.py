from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import joblib
import httpx

print("AI ROUTES LOADED")

router = APIRouter()

# Load your ML models
scam_detector = joblib.load(r"C:\Users\anudeep\OneDrive\Desktop\freelance\scam_detector.pkl")
scam_vectorizer = joblib.load(r"C:\Users\anudeep\OneDrive\Desktop\freelance\scam_vectorizer.pkl")

class MessageRequest(BaseModel):
    message: str

class ScamResult(BaseModel):
    is_scam: bool
    probability: Optional[float]

class RasaResult(BaseModel):
    intent: Optional[str]
    confidence: Optional[float]

@router.post("/ml_check", response_model=ScamResult, summary="Check if message is a scam")
def ml_check(data: MessageRequest):
    vec = scam_vectorizer.transform([data.message])
    result = scam_detector.predict(vec)[0]
    proba = None
    if hasattr(scam_detector, "predict_proba"):
        proba = scam_detector.predict_proba(vec)[0][1]
    return ScamResult(is_scam=bool(result), probability=proba)

@router.post("/rasa_check", response_model=RasaResult)
async def rasa_check(data: MessageRequest):
    async with httpx.AsyncClient() as client:
        resp = await client.post("http://localhost:5005/model/parse", json={"text": data.message})
        res_data = resp.json()
    return RasaResult(
        intent=res_data.get("intent", {}).get("name"),
        confidence=res_data.get("intent", {}).get("confidence")
    )
