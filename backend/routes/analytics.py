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
    open_tickets = db.query(Ticket).filter(Ticket.status == "Open").count()
    resolved_tickets = db.query(Ticket).filter(Ticket.status.in_(["Resolved", "Closed"])).count()
    auto_routed = total_tickets  # All are auto routed in this demo
    avg_response = db.query(func.avg(Ticket.processing_time)).scalar() or 0.0
    
    # Category Distribution
    categories = db.query(Ticket.category, func.count(Ticket.id)).group_by(Ticket.category).all()
    cat_dist = [{"name": c[0], "value": c[1]} for c in categories]
    
    # Priority Distribution
    priorities = db.query(Ticket.priority, func.count(Ticket.id)).group_by(Ticket.priority).all()
    pri_dist = [{"name": p[0], "value": p[1]} for p in priorities]
    
    # Team Workload Distribution
    teams = db.query(Ticket.assigned_team, func.count(Ticket.id)).group_by(Ticket.assigned_team).all()
    team_dist = [{"name": t[0], "value": t[1]} for t in teams]
    
    # Status Distribution
    statuses = db.query(Ticket.status, func.count(Ticket.id)).group_by(Ticket.status).all()
    status_dist = [{"name": s[0], "value": s[1]} for s in statuses]

    # Recent Tickets (last 10)
    recent = db.query(Ticket).order_by(Ticket.created_at.desc()).limit(8).all()
    recent_tickets = [{
        "id": t.id,
        "title": t.title,
        "category": t.category,
        "priority": t.priority,
        "status": t.status,
        "assigned_team": t.assigned_team,
        "confidence": t.confidence,
        "created_at": t.created_at.isoformat() if t.created_at else None
    } for t in recent]
    
    return {
        "kpi": {
            "total_tickets": total_tickets,
            "critical_tickets": critical_tickets,
            "open_tickets": open_tickets,
            "resolved_tickets": resolved_tickets,
            "auto_routed": auto_routed,
            "avg_response_time": round(avg_response, 2)
        },
        "charts": {
            "category_distribution": cat_dist,
            "priority_distribution": pri_dist,
            "team_distribution": team_dist,
            "status_distribution": status_dist
        },
        "recent_tickets": recent_tickets
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
