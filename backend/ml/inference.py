import os
import time
import joblib
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from ml.text_cleaner import clean_text
from ml.category_model import DistilBertCategoryModel
from ml.priority_model import PriorityModel
from ml.rootcause_model import RootCauseModel
from ml.routing_engine import RoutingEngine
from ml.lime_explainer import explain_prediction

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")

class TicketInferencePipeline:
    """
    Unified Ticket ML Inference Pipeline:
    1. Clean input text.
    2. Run DistilBERT Category Classifier (6 classes).
    3. Run Priority Model (TF-IDF + Logistic Regression).
    4. Run Root Cause Model (TF-IDF + XGBoost).
    5. Assign team and SLA via RoutingEngine.
    6. Measure inference latency.
    7. Optionally persist ticket to SQLite database.
    8. Generate explainable AI (LIME) word attribution.
    """
    def __init__(self):
        self.vectorizer = None
        self.category_model = DistilBertCategoryModel()
        self.priority_model = PriorityModel()
        self.root_cause_model = RootCauseModel()
        self.routing_engine = RoutingEngine()
        self._is_loaded = False

    def load_models(self):
        """Preload all models once during FastAPI startup to ensure < 300ms latency."""
        vec_path = os.path.join(MODEL_DIR, "tfidf_vectorizer.joblib")
        if os.path.exists(vec_path):
            self.vectorizer = joblib.load(vec_path)

        self.category_model.load(self.vectorizer)
        self.priority_model.load(self.vectorizer)
        self.root_cause_model.load(self.vectorizer)
        self._is_loaded = True

    @property
    def is_loaded(self) -> bool:
        return self._is_loaded

    def predict(
        self,
        title: str,
        description: str,
        db: Optional[Session] = None,
        save_to_db: bool = False
    ) -> Dict[str, Any]:
        start_time = time.time()

        # 1. Clean input text
        cleaned_title = clean_text(title)
        cleaned_description = clean_text(description)
        combined_text = f"{cleaned_title} {cleaned_description}".strip()

        # 2. Run Category Model
        cat_result = self.category_model.predict(combined_text)
        category = cat_result["category"]
        category_confidence = cat_result["category_confidence"]
        top_3_categories = cat_result["top_3_categories"]

        # 3. Run Priority Model
        pri_result = self.priority_model.predict(combined_text)
        priority = pri_result["priority"]
        priority_confidence = pri_result["priority_confidence"]

        # 4. Run Root Cause Model
        rc_result = self.root_cause_model.predict(combined_text)
        root_cause = rc_result["root_cause"]
        root_cause_confidence = rc_result["root_cause_confidence"]

        # 5. Assign team using routing rules
        routing = self.routing_engine.route(category, priority, root_cause)
        assigned_team = routing["assigned_team"]
        suggested_sla = routing["suggested_sla"]

        # Compute explainability (LIME)
        lime_explanation = None
        try:
            lime_explanation = explain_prediction(combined_text, model_type="category")
        except Exception:
            pass

        # 6. Measure inference latency
        processing_time_ms = round((time.time() - start_time) * 1000, 2)

        ticket_id = None
        # 7. Optionally save ticket in database
        if save_to_db and db is not None:
            from services.ticket_service import TicketService
            from schemas.schemas import TicketCreate
            saved_ticket = TicketService.create_ticket(
                db=db,
                ticket_in=TicketCreate(title=title, description=description),
                category=category,
                priority=priority,
                root_cause=root_cause,
                assigned_team=assigned_team,
                confidence=category_confidence,
                processing_time=processing_time_ms
            )
            ticket_id = saved_ticket.ticket_id

        # 8. Return prediction JSON
        return {
            "category": category,
            "category_confidence": category_confidence,
            "top_3_categories": top_3_categories,
            "priority": priority,
            "priority_confidence": priority_confidence,
            "suggested_sla": suggested_sla,
            "root_cause": root_cause,
            "root_cause_confidence": root_cause_confidence,
            "assigned_team": assigned_team,
            "processing_time_ms": processing_time_ms,
            "ticket_id": ticket_id,
            "lime_explanation": lime_explanation
        }

# Global singleton instance
inference_pipeline = TicketInferencePipeline()
