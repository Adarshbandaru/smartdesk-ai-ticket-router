from routes.tickets import router as tickets_router
from routes.predict import router as predict_router
from routes.feedback import router as feedback_router
from routes.analytics import router as analytics_router
from routes.auth import router as auth_router

__all__ = [
    "tickets_router",
    "predict_router",
    "feedback_router",
    "analytics_router",
    "auth_router",
]
