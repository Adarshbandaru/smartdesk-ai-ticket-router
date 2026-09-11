from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from schemas.schemas import TicketCreate, PredictionResponse
from database.session import get_db
from ml.inference import inference_pipeline

router = APIRouter()

@router.post(
    "/",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="AI Ticket Classification & Routing Inference",
    description="Processes ticket title and description through DistilBERT category classifier, TF-IDF + Logistic Regression priority model, and TF-IDF + XGBoost root cause model."
)
def predict_ticket(
    request: TicketCreate,
    save: bool = Query(True, description="Whether to automatically save the routed ticket into the database"),
    db: Session = Depends(get_db)
):
    try:
        preds = inference_pipeline.predict(
            title=request.title,
            description=request.description,
            db=db,
            save_to_db=save
        )
        return preds
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction pipeline failed: {str(e)}"
        )
