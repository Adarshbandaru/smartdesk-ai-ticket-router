from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas.schemas import TicketCreate, PredictionResponse
from database.session import get_db
from ml.pipeline import ml_pipeline
from ml.lime_explainer import explain_prediction
import time

router = APIRouter()

@router.post("/", response_model=PredictionResponse, status_code=status.HTTP_200_OK)
def predict_ticket(request: TicketCreate, db: Session = Depends(get_db)):
    try:
        start_time = time.time()
        preds = ml_pipeline.predict(request.title, request.description)
        
        # Calculate LIME explanation
        lime_exp = explain_prediction(request.title + " " + request.description, model_type="category")
        preds["lime_explanation"] = lime_exp
        
        total_time = round((time.time() - start_time) * 1000, 2)
        preds["processing_time_ms"] = total_time
        
        return preds
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction pipeline failed: {str(e)}"
        )
