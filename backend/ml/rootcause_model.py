import os
import joblib
import numpy as np
from typing import Dict, Any

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")

class RootCauseModel:
    """
    TF-IDF + XGBoost Root Cause Predictor:
    - Gradient boosted decision trees classifier for root cause identification
    - Predicts: Payment Failure, Flight Delay, Missing Baggage, System Error, Login Issue, Customer Request
    """
    def __init__(self):
        self.model = None
        self.vectorizer = None
        self.label_encoder = None

    def load(self, vectorizer=None):
        rc_path = os.path.join(MODEL_DIR, "root_cause_model.joblib")
        le_path = os.path.join(MODEL_DIR, "root_cause_label_encoder.joblib")

        if os.path.exists(rc_path):
            self.model = joblib.load(rc_path)
        if os.path.exists(le_path):
            self.label_encoder = joblib.load(le_path)
        if vectorizer is not None:
            self.vectorizer = vectorizer
        elif os.path.exists(os.path.join(MODEL_DIR, "tfidf_vectorizer.joblib")):
            self.vectorizer = joblib.load(os.path.join(MODEL_DIR, "tfidf_vectorizer.joblib"))

    def predict(self, text: str) -> Dict[str, Any]:
        if not self.model or not self.vectorizer or not self.label_encoder:
            raise RuntimeError("RootCauseModel is not loaded. Call load() first.")

        X_vec = self.vectorizer.transform([text])
        probs = self.model.predict_proba(X_vec)[0]

        top_idx = np.argmax(probs)
        top_root_cause = str(self.label_encoder.inverse_transform([top_idx])[0])
        top_confidence = float(probs[top_idx])

        return {
            "root_cause": top_root_cause,
            "root_cause_confidence": round(top_confidence, 4),
            "classes": self.label_encoder.classes_,
            "raw_probs": probs
        }
