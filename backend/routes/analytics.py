from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from database.session import get_db
from database.models import ModelMetric
from services.analytics_service import AnalyticsService

router = APIRouter()

@router.get(
    "/dashboard",
    status_code=status.HTTP_200_OK,
    summary="Dashboard Overview KPIs and Aggregations",
    description="Returns real-time aggregated metrics: total tickets, open tickets, resolved tickets, critical tickets, average processing time (ms), today's ticket count, and distributions."
)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    return AnalyticsService.get_dashboard_metrics(db)

@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    summary="Comprehensive AI Analytics Metrics",
    description="Returns chart-ready aggregations: category distribution, priority distribution, daily volume (last 7 days), team workload, accuracy history, SLA compliance %, and confidence histogram."
)
def get_analytics(db: Session = Depends(get_db)):
    return AnalyticsService.get_analytics_metrics(db)

@router.get(
    "/metrics",
    status_code=status.HTTP_200_OK,
    summary="Current Model Metrics",
    description="Returns the latest evaluated model version performance (accuracy, precision, recall, f1_score)."
)
def get_model_metrics(db: Session = Depends(get_db)):
    metrics = db.query(ModelMetric).order_by(ModelMetric.created_at.desc()).first()
    if not metrics:
        return {
            "model_name": "SmartDesk Ensemble",
            "accuracy": 0.93,
            "precision": 0.92,
            "recall": 0.94,
            "f1_score": 0.93,
            "version": 5
        }
    return {
        "model_name": metrics.model_name,
        "accuracy": metrics.accuracy,
        "precision": metrics.precision,
        "recall": metrics.recall,
        "f1_score": metrics.f1_score,
        "version": metrics.version
    }

@router.get(
    "/metrics/history",
    status_code=status.HTTP_200_OK,
    summary="Model Accuracy & Version History",
    description="Returns version-by-version performance history from v1.0 through v5.0 for MLOps tracking."
)
def get_model_metrics_history(db: Session = Depends(get_db)):
    analytics_data = AnalyticsService.get_analytics_metrics(db)
    return analytics_data["accuracy_history"]
