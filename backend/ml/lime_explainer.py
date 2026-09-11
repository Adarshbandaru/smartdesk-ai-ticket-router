# Forward lime_explainer to the comprehensive LimeExplainerService
from services.explain_service import lime_service, explain_prediction

__all__ = ["lime_service", "explain_prediction"]
