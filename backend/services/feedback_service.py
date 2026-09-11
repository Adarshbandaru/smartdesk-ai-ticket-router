from typing import List, Optional
from sqlalchemy.orm import Session
from database.models import Feedback, ActivityLog
from schemas.schemas import FeedbackCreate

class FeedbackService:
    @staticmethod
    def submit_feedback(db: Session, feedback_in: FeedbackCreate) -> Feedback:
        feedback = Feedback(
            ticket_id=feedback_in.ticket_id,
            predicted_category=feedback_in.predicted_category,
            actual_category=feedback_in.actual_category,
            predicted_priority=feedback_in.predicted_priority,
            actual_priority=feedback_in.actual_priority,
            comments=feedback_in.comments,
            reviewed_by=feedback_in.reviewed_by or "Support Lead",
            is_processed=False
        )
        db.add(feedback)
        db.flush()

        log = ActivityLog(
            action="FEEDBACK_SUBMITTED",
            entity_type="feedback",
            entity_id=str(feedback.id),
            details=f"Feedback by {feedback.reviewed_by} on ticket #{feedback.ticket_id}: actual={feedback.actual_category}/{feedback.actual_priority}"
        )
        db.add(log)
        db.commit()
        db.refresh(feedback)
        return feedback

    @staticmethod
    def get_pending_queue(db: Session) -> List[Feedback]:
        return db.query(Feedback).filter(Feedback.is_processed == False).order_by(Feedback.created_at.desc()).all()
