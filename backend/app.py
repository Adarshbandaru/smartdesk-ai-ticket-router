from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import time

from config import settings
from database.session import Base, engine
import database.models  # Register all models with Base
from database.seed import seed_database
from utils.logger import LoggingMiddleware, logger

from routes.tickets import router as tickets_router
from routes.predict import router as predict_router
from routes.feedback import router as feedback_router
from routes.analytics import router as analytics_router
from routes.auth import router as auth_router

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

# Request Latency Logging Middleware
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

@app.get("/", status_code=status.HTTP_200_OK, tags=["Root"])
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "docs_url": "/docs",
        "health_check": "/health"
    }
