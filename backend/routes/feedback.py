from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from schemas.schemas import FeedbackCreate, FeedbackResponse
from database.session import get_db
from services.feedback_service import FeedbackService
from ml.retrain import RetrainingPipeline

router = APIRouter()

@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    summary="Submit Human-in-the-Loop Feedback",
    description="Record human reviewer corrections for incorrect AI category and priority predictions."
)
def submit_feedback(feedback: FeedbackCreate, db: Session = Depends(get_db)):
    saved = FeedbackService.submit_feedback(db=db, feedback_in=feedback)
    return {
        "status": "success",
        "message": "Feedback submitted successfully",
        "feedback_id": saved.id,
        "reviewed_by": saved.reviewed_by
    }

@router.get(
    "/",
    response_model=List[FeedbackResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Pending Feedback Review Queue",
    description="Returns all unreviewed / unprocessed ticket predictions requiring human verification."
)
def get_feedback_queue(db: Session = Depends(get_db)):
    return FeedbackService.get_pending_queue(db=db)

@router.post(
    "/retrain",
    status_code=status.HTTP_200_OK,
    summary="Trigger Model Retraining Pipeline",
    description="Loads human corrections, merges with dataset, retrains priority and root cause models, and increments version (v1.0 -> v1.1 -> v1.2)."
)
def retrain_models(db: Session = Depends(get_db)):
    try:
        result = RetrainingPipeline.run_retraining(db)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Retraining failed: {str(e)}"
        )
