from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database.database import Base, engine
from routes import predict, tickets, feedback, analytics, auth

# Create database tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize and train models if they don't exist
    from initialize import initialize_models
    initialize_models()
    
    # Load ML models on startup
    print("Loading ML Models...")
    from ml.pipeline import ml_pipeline
    ml_pipeline.load_models()
    print("Models loaded successfully.")
    yield
    # Clean up resources
    print("Shutting down...")

app = FastAPI(
    title="SmartDesk - AI Ticket Router",
    description="Intelligent helpdesk ticket routing using Machine Learning and NLP",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, specify the actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(predict.router, prefix="/api/predict", tags=["Prediction"])
app.include_router(tickets.router, prefix="/api/tickets", tags=["Tickets"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["Feedback"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/")
def root():
    return {"message": "Welcome to SmartDesk AI Ticket Router API"}
