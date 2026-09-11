import os
import joblib
import numpy as np
from typing import Dict, Any

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")

class PriorityModel:
    """
    TF-IDF + Logistic Regression Priority Predictor:
    - Predicts ticket priority: Critical, High, Medium, Low
    - Calibrated multi-class probability scores
    """
    def __init__(self):
        self.model = None
        self.vectorizer = None

    def load(self, vectorizer=None):
        pri_model_path = os.path.join(MODEL_DIR, "priority_model.joblib")
        if os.path.exists(pri_model_path):
            self.model = joblib.load(pri_model_path)
        if vectorizer is not None:
            self.vectorizer = vectorizer
        elif os.path.exists(os.path.join(MODEL_DIR, "tfidf_vectorizer.joblib")):
            self.vectorizer = joblib.load(os.path.join(MODEL_DIR, "tfidf_vectorizer.joblib"))

    def predict(self, text: str) -> Dict[str, Any]:
        if not self.model or not self.vectorizer:
            raise RuntimeError("PriorityModel is not loaded. Call load() first.")

        X_vec = self.vectorizer.transform([text])
        probs = self.model.predict_proba(X_vec)[0]
        classes = self.model.classes_

        top_idx = np.argmax(probs)
        top_priority = str(classes[top_idx])
        top_confidence = float(probs[top_idx])

        return {
            "priority": top_priority,
            "priority_confidence": round(top_confidence, 4),
            "classes": classes,
            "raw_probs": probs
        }
