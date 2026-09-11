from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime

# --- Ticket Schemas ---
class TicketCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)

class TicketUpdateStatus(BaseModel):
    status: str

class TicketResponse(BaseModel):
    id: int
    ticket_id: Optional[str] = None
    title: str
    description: str
    category: str
    priority: str
    root_cause: Optional[str] = None
    assigned_team: Optional[str] = None
    confidence_score: Optional[float] = None
    confidence: Optional[float] = None
    status: str
    processing_time_ms: Optional[float] = None
    processing_time: Optional[float] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Prediction & Explanation Schemas ---
class CategoryCandidate(BaseModel):
    category: str
    confidence: float

class LimeExplanation(BaseModel):
    feature_importance: Dict[str, float]
    highlighted_text: List[Union[tuple, list]]  # [("word", score)]

class PredictionResponse(BaseModel):
    category: str
    category_confidence: float
    top_3_categories: List[CategoryCandidate]
    priority: str
    priority_confidence: float
    suggested_sla: str
    root_cause: str
    root_cause_confidence: float
    assigned_team: str
    processing_time_ms: float
    lime_explanation: Optional[LimeExplanation] = None

# --- Feedback Schemas ---
class FeedbackCreate(BaseModel):
    ticket_id: int
    predicted_category: str
    actual_category: str
    predicted_priority: str
    actual_priority: str
    comments: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: int
    ticket_id: int
    predicted_category: str
    actual_category: str
    predicted_priority: str
    actual_priority: str
    comments: Optional[str] = None
    is_processed: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- User & Auth Schemas ---
class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Activity Log Schemas ---
class ActivityLogResponse(BaseModel):
    id: int
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    details: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
