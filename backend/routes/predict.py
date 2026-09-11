from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from schemas.schemas import TicketCreate, PredictionResponse, ExplainRequest, DetailedExplanationResponse
from database.session import get_db
from ml.inference import inference_pipeline
from services.explain_service import lime_service

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

@router.post(
    "/explain",
    response_model=DetailedExplanationResponse,
    status_code=status.HTTP_200_OK,
    summary="Explain Prediction using LIME (Explainable AI)",
    description="Returns top positive words, top negative words, feature importance score, and highlighted text spans with character offsets."
)
def explain_ticket(request: ExplainRequest):
    try:
        explanation = lime_service.explain(
            text=request.ticket_text,
            predicted_class=request.prediction,
            model_type=request.model_type or "category",
            num_features=request.num_features or 10
        )
        return explanation
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"LIME explanation failed: {str(e)}"
        )
