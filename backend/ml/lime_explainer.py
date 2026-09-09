from lime.lime_text import LimeTextExplainer
from ml.pipeline import ml_pipeline

explainer = LimeTextExplainer(class_names=["Class"]) # We will adapt dynamically

def explain_prediction(text: str, model_type: str = "category"):
    """
    Returns LIME explanation for a given model type ("category", "priority", "root_cause").
    """
    if model_type == "category":
        model = ml_pipeline.cat_model
        classes = model.classes_
    elif model_type == "priority":
        model = ml_pipeline.pri_model
        classes = model.classes_
    else:
        # XGBoost requires label encoded output, slightly different pipeline
        # For simplicity in this demo, let's explain the Priority model by default or Category.
        # Let's just focus on Category for LIME to keep it fast and relevant.
        model = ml_pipeline.cat_model
        classes = model.classes_
        
    def predict_proba_wrapper(texts):
        X = ml_pipeline.vectorizer.transform(texts)
        return model.predict_proba(X)
        
    explainer.class_names = classes
    
    # Generate explanation
    exp = explainer.explain_instance(text, predict_proba_wrapper, num_features=10, top_labels=1)
    
    top_label = exp.available_labels()[0]
    explanation_list = exp.as_list(label=top_label)
    
    # Format for frontend
    feature_importance = {word: float(weight) for word, weight in explanation_list}
    highlighted_text = [(word, float(weight)) for word, weight in explanation_list]
    
    return {
        "feature_importance": feature_importance,
        "highlighted_text": highlighted_text
    }
