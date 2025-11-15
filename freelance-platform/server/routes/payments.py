from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.payment import Payment
from models.job import Job
from models.user import User
from schemas.payment import PaymentCreate, PaymentOut
from db.database import get_db
from utils.auth import get_current_user
from datetime import datetime

router = APIRouter()

@router.post("/payments/initiate", response_model=PaymentOut)
async def initiate_upi_payment(
    payment: PaymentCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Validate job/client/freelancer/amount
    job = await db.get(Job, payment.job_id)
    if not job or user.id != job.client_id:
        raise HTTPException(400, "Only client can initiate payment.")
    if job.status not in ["in_progress", "completed"]:  # or whatever is valid
        raise HTTPException(400, "Job status not eligible for payment.")
    if payment.amount <= 0:
        raise HTTPException(400, "Invalid amount.")
    freelancer = await db.get(User, payment.receiver_id)
    payee_vpa = getattr(freelancer, "upi_vpa", None) or "test@upi"  # Use actual field!

    # Make UPI deep link string (works with UPI apps, Google Pay, etc):
    upi_link = f"upi://pay?pa={payee_vpa}&pn={freelancer.name}&am={payment.amount}&cu=INR&tn=Job Payment"

    new_payment = Payment(
        job_id=payment.job_id,
        sender_id=user.id,
        receiver_id=payment.receiver_id,
        amount=payment.amount,
        payment_method="upi",
        status="pending",
        created_at=datetime.utcnow()
    )
    db.add(new_payment)
    await db.commit()
    await db.refresh(new_payment)

    return {**PaymentOut.from_orm(new_payment).dict(), "upi_link": upi_link}

@router.post("/payments/verify/{payment_id}")
async def verify_payment(payment_id: int, txn_id: str, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(404, "Payment not found")
    # For MVP, admin or user uploads txn_id; you verify manually
    payment.status = "completed"
    payment.payment_method = txn_id  # Store UPI txn_id here or add a specific field
    await db.commit()
    await db.refresh(payment)
    return payment
