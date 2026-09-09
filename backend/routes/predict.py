from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.schemas import TicketCreate, PredictionResponse, LimeExplanation
from database.database import get_db
from database.models import Ticket
from ml.pipeline import ml_pipeline
from ml.lime_explainer import explain_prediction
import time

router = APIRouter()

@router.post("/", response_model=PredictionResponse)
def predict_ticket(request: TicketCreate, db: Session = Depends(get_db)):
    try:
        # Get predictions
        start_time = time.time()
        preds = ml_pipeline.predict(request.title, request.description)
        
        # Get LIME explanation
        # Calculating LIME synchronously for a simple linear model is fast enough (<300ms total usually)
        lime_exp = explain_prediction(request.title + " " + request.description, model_type="category")
        
        preds["lime_explanation"] = lime_exp
        
        total_time = round((time.time() - start_time) * 1000, 2)
        preds["processing_time_ms"] = total_time
        
        return preds
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
