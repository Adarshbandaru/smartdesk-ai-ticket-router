from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class TicketCreate(BaseModel):
    title: str
    description: str

class LimeExplanation(BaseModel):
    feature_importance: Dict[str, float]
    highlighted_text: List[tuple] # e.g. [("word", score)]

class PredictionResponse(BaseModel):
    category: str
    category_confidence: float
    top_3_categories: List[Dict[str, float]]
    priority: str
    priority_confidence: float
    suggested_sla: str
    root_cause: str
    root_cause_confidence: float
    assigned_team: str
    processing_time_ms: float
    lime_explanation: LimeExplanation

class TicketResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    priority: str
    root_cause: str
    assigned_team: str
    confidence: float
    status: str
    processing_time: float
    created_at: datetime

    class Config:
        from_attributes = True

class FeedbackCreate(BaseModel):
    ticket_id: int
    predicted_category: str
    actual_category: str
    predicted_priority: str
    actual_priority: str
    comments: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
