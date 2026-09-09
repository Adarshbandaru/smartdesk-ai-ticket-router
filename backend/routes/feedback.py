from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas.schemas import FeedbackCreate
from database.database import get_db
from database.models import Feedback

router = APIRouter()

@router.post("/")
def submit_feedback(feedback: FeedbackCreate, db: Session = Depends(get_db)):
    db_feedback = Feedback(**feedback.model_dump())
    db.add(db_feedback)
    db.commit()
    return {"message": "Feedback submitted successfully"}

@router.get("/")
def get_feedback_queue(db: Session = Depends(get_db)):
    return db.query(Feedback).filter(Feedback.is_processed == False).all()
