from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from schemas.schemas import FeedbackCreate, FeedbackResponse
from database.session import get_db
from services.feedback_service import FeedbackService

router = APIRouter()

@router.post("/", status_code=status.HTTP_201_CREATED)
def submit_feedback(feedback: FeedbackCreate, db: Session = Depends(get_db)):
    FeedbackService.submit_feedback(db=db, feedback_in=feedback)
    return {"message": "Feedback submitted successfully"}

@router.get("/", response_model=List[FeedbackResponse], status_code=status.HTTP_200_OK)
def get_feedback_queue(db: Session = Depends(get_db)):
    return FeedbackService.get_pending_queue(db=db)
