import re
from typing import Dict, Any, List, Optional
from lime.lime_text import LimeTextExplainer

class LimeExplainerService:
    """
    Reusable Explainable AI Service using LIME:
    - Computes top positive words and top negative words.
    - Provides importance scores (feature importance dictionary).
    - Extracts highlighted text spans with start/end character offsets for frontend visualization.
    - Compatible with both Category, Priority, and Root Cause model explanations.
    """
    def __init__(self):
        self._explainer = None

    @property
    def explainer(self) -> LimeTextExplainer:
        if self._explainer is None:
            self._explainer = LimeTextExplainer(
                class_names=["Booking", "Cancellation", "Refund", "Baggage", "Technical Issue", "Customer Service"]
            )
        return self._explainer

    def explain(
        self,
        text: str,
        predicted_class: Optional[str] = None,
        model_type: str = "category",
        num_features: int = 10
    ) -> Dict[str, Any]:
        from ml.inference import inference_pipeline

        if not text or not text.strip():
            return {
                "top_positive_words": [],
                "top_negative_words": [],
                "feature_importance": {},
                "highlighted_spans": [],
                "highlighted_text": [],
                "predicted_class": predicted_class or "Unknown",
                "explanation_score": 0.0
            }

        # Select model and classes to explain
        if model_type == "priority":
            model = inference_pipeline.priority_model.model
        elif model_type == "root_cause":
            model = inference_pipeline.root_cause_model.model
        else:
            model = inference_pipeline.category_model.model

        vectorizer = inference_pipeline.vectorizer

        def predict_proba_wrapper(texts: List[str]):
            X = vectorizer.transform(texts)
            return model.predict_proba(X)

        classes = list(model.classes_)
        self.explainer.class_names = classes

        # Determine target label index
        if predicted_class and predicted_class in classes:
            target_label_idx = classes.index(predicted_class)
        else:
            # Run single inference to find argmax label
            X_single = vectorizer.transform([text])
            target_label_idx = int(model.predict_proba(X_single)[0].argmax())
            predicted_class = classes[target_label_idx]

        # Generate LIME explanation
        exp = self.explainer.explain_instance(
            text_instance=text,
            classifier_fn=predict_proba_wrapper,
            labels=[target_label_idx],
            num_features=num_features
        )

        exp_list = exp.as_list(label=target_label_idx)

        # Parse positive & negative words
        top_positive_words = []
        top_negative_words = []
        feature_importance = {}
        highlighted_text = []

        for word, score in exp_list:
            sc = round(float(score), 4)
            feature_importance[word] = sc
            highlighted_text.append([word, sc])
            if sc > 0:
                top_positive_words.append({"word": word, "score": sc, "impact": "positive"})
            else:
                top_negative_words.append({"word": word, "score": sc, "impact": "negative"})

        # Sort words by absolute contribution
        top_positive_words.sort(key=lambda x: x["score"], reverse=True)
        top_negative_words.sort(key=lambda x: x["score"])

        # Compute highlighted text spans with character offsets
        highlighted_spans = []
        for word, score in exp_list:
            sc = round(float(score), 4)
            # Find all matches of this word in original text
            for match in re.finditer(rf'\b{re.escape(word)}\b', text, re.IGNORECASE):
                highlighted_spans.append({
                    "word": match.group(0),
                    "start": match.start(),
                    "end": match.end(),
                    "score": sc,
                    "sentiment": "positive" if sc > 0 else "negative"
                })

        # Sort spans by starting character index
        highlighted_spans.sort(key=lambda x: x["start"])

        # Aggregate explanation confidence / importance score
        total_importance = round(sum(abs(sc) for _, sc in exp_list), 4)

        return {
            "predicted_class": str(predicted_class),
            "importance_score": total_importance,
            "top_positive_words": top_positive_words,
            "top_negative_words": top_negative_words,
            "feature_importance": feature_importance,
            "highlighted_spans": highlighted_spans,
            "highlighted_text": highlighted_text
        }

# Singleton instance
lime_service = LimeExplainerService()

def explain_prediction(text: str, model_type: str = "category") -> Dict[str, Any]:
    """Helper wrapper for inference pipeline integration."""
    return lime_service.explain(text=text, model_type=model_type)
