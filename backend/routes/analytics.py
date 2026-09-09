from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database.database import get_db
from database.models import Ticket, ModelMetric
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    total_tickets = db.query(Ticket).count()
    critical_tickets = db.query(Ticket).filter(Ticket.priority == "Critical").count()
    auto_routed = db.query(Ticket).count() # All are auto routed in this demo
    avg_response = db.query(func.avg(Ticket.processing_time)).scalar() or 0.0
    
    # Category Distribution
    categories = db.query(Ticket.category, func.count(Ticket.id)).group_by(Ticket.category).all()
    cat_dist = [{"name": c[0], "value": c[1]} for c in categories]
    
    # Priority Distribution
    priorities = db.query(Ticket.priority, func.count(Ticket.id)).group_by(Ticket.priority).all()
    pri_dist = [{"name": p[0], "value": p[1]} for p in priorities]
    
    return {
        "kpi": {
            "total_tickets": total_tickets,
            "critical_tickets": critical_tickets,
            "auto_routed": auto_routed,
            "avg_response_time": round(avg_response, 2)
        },
        "charts": {
            "category_distribution": cat_dist,
            "priority_distribution": pri_dist
        }
    }

@router.get("/metrics")
def get_model_metrics(db: Session = Depends(get_db)):
    # Mock metrics if empty for demo
    metrics = db.query(ModelMetric).order_by(ModelMetric.created_at.desc()).first()
    if not metrics:
        return {
            "model_name": "SmartDesk Ensemble",
            "accuracy": 0.92,
            "precision": 0.91,
            "recall": 0.93,
            "f1_score": 0.92,
            "version": 1
        }
    return metrics
