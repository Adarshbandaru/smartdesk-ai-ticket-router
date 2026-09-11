from fastapi import FastAPI, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
import time

from config import settings
from database.session import Base, engine, get_db
import database.models  # Register all models with Base
from database.seed import seed_database
from utils.logger import LoggingMiddleware, ErrorHandlingMiddleware, logger

from routes.tickets import router as tickets_router
from routes.predict import router as predict_router
from routes.feedback import router as feedback_router
from routes.analytics import router as analytics_router
from routes.auth import router as auth_router
from schemas.schemas import FeedbackCreate, ExplainRequest, UserLogin, UserRegister, Token, UserResponse
from database.models import User
from services.auth_service import get_current_user

# Ensure tables are created
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure ML models are initialized / loaded
    logger.info("Initializing SmartDesk backend system...")
    from initialize import initialize_models
    initialize_models()
    
    # Load ML models into memory once at startup
    logger.info("Loading ML prediction pipelines...")
    from ml.inference import inference_pipeline
    inference_pipeline.load_models()
    logger.info("ML Models loaded successfully into memory.")
    
    # Ensure database is seeded with 50 realistic airline tickets
    seed_database(force_reseed=False)
    
    yield
    logger.info("Shutting down SmartDesk backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-ready intelligent helpdesk ticket routing using Machine Learning and NLP",
    version=settings.VERSION,
    lifespan=lifespan
)

# Request Latency Logging Middleware & Error Handler
app.add_middleware(ErrorHandlingMiddleware)
app.add_middleware(LoggingMiddleware)

# CORS Middleware configured for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check Endpoint
@app.get("/health", status_code=status.HTTP_200_OK, tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": time.time()
    }

# API Routers
app.include_router(auth_router, prefix=f"{settings.API_PREFIX}/auth", tags=["Authentication"])
app.include_router(predict_router, prefix=f"{settings.API_PREFIX}/predict", tags=["Prediction"])
app.include_router(tickets_router, prefix=f"{settings.API_PREFIX}/tickets", tags=["Tickets"])
app.include_router(feedback_router, prefix=f"{settings.API_PREFIX}/feedback", tags=["Feedback"])
app.include_router(analytics_router, prefix=f"{settings.API_PREFIX}/analytics", tags=["Analytics"])

# Direct endpoints requested for GET /dashboard and GET /analytics
@app.get("/dashboard", status_code=status.HTTP_200_OK, tags=["Dashboard"])
def get_dashboard_root(db: Session = Depends(get_db)):
    from services.analytics_service import AnalyticsService
    return AnalyticsService.get_dashboard_metrics(db)

@app.get("/analytics", status_code=status.HTTP_200_OK, tags=["Analytics"])
def get_analytics_root(db: Session = Depends(get_db)):
    from services.analytics_service import AnalyticsService
    return AnalyticsService.get_analytics_metrics(db)

# Direct endpoints requested for Feedback & Retraining
@app.post("/feedback", status_code=status.HTTP_201_CREATED, tags=["Feedback"])
def post_feedback_root(feedback: FeedbackCreate, db: Session = Depends(get_db)):
    from services.feedback_service import FeedbackService
    saved = FeedbackService.submit_feedback(db=db, feedback_in=feedback)
    return {
        "status": "success",
        "message": "Feedback submitted successfully",
        "feedback_id": saved.id,
        "reviewed_by": saved.reviewed_by
    }

@app.get("/feedback", status_code=status.HTTP_200_OK, tags=["Feedback"])
def get_feedback_root(db: Session = Depends(get_db)):
    from services.feedback_service import FeedbackService
    return FeedbackService.get_pending_queue(db=db)

@app.post("/retrain", status_code=status.HTTP_200_OK, tags=["Retraining"])
def post_retrain_root(db: Session = Depends(get_db)):
    from ml.retrain import RetrainingPipeline
    return RetrainingPipeline.run_retraining(db)

# Direct endpoint requested for Explainable AI (LIME)
@app.post("/explain", status_code=status.HTTP_200_OK, tags=["Explainable AI"])
def post_explain_root(request: ExplainRequest):
    from services.explain_service import lime_service
    return lime_service.explain(
        text=request.ticket_text,
        predicted_class=request.prediction,
        model_type=request.model_type or "category",
        num_features=request.num_features or 10
    )

# Direct endpoints requested for Authentication
@app.post("/login", response_model=Token, status_code=status.HTTP_200_OK, tags=["Authentication"])
def post_login_root(user_in: UserLogin, db: Session = Depends(get_db)):
    from routes.auth import login as auth_login
    return auth_login(user_in=user_in, db=db)

@app.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, tags=["Authentication"])
def post_register_root(user_in: UserRegister, db: Session = Depends(get_db)):
    from routes.auth import register as auth_register
    return auth_register(user_in=user_in, db=db)

@app.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK, tags=["Authentication"])
def get_me_root(current_user: User = Depends(get_current_user)):
    return current_user

# Settings endpoint
@app.get("/settings", status_code=status.HTTP_200_OK, tags=["Settings"])
def get_settings_root(current_user: User = Depends(get_current_user)):
    return {
        "auto_routing": True,
        "confidence_threshold": 0.75,
        "routing_engine": "hybrid_ml_rules",
        "lime_enabled": True,
        "environment": settings.ENVIRONMENT,
        "active_user": {
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role
        }
    }

@app.get("/", status_code=status.HTTP_200_OK, tags=["Root"])
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "docs_url": "/docs",
        "health_check": "/health"
    }
