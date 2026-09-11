from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime

# --- Ticket Schemas ---
class TicketCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Brief summary of the issue")
    description: str = Field(..., min_length=1, description="Detailed description of the issue")
    category: Optional[str] = Field(None, description="Support category (e.g. Booking, Cancellation, Baggage)")
    priority: Optional[str] = Field(None, description="Ticket priority: Critical, High, Medium, Low")
    root_cause: Optional[str] = Field(None, description="Identified root cause")
    assigned_team: Optional[str] = Field(None, description="Routing team destination")
    confidence_score: Optional[float] = Field(None, description="Prediction model confidence score")
    confidence: Optional[float] = Field(None, description="Alias for confidence_score")
    processing_time_ms: Optional[float] = Field(None, description="Model inference latency in ms")
    processing_time: Optional[float] = Field(None, description="Alias for processing_time_ms")
    status: Optional[str] = Field("Open", description="Status: Open, In Progress, Resolved, Closed")

class TicketUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1)
    category: Optional[str] = None
    priority: Optional[str] = None
    root_cause: Optional[str] = None
    assigned_team: Optional[str] = None
    confidence_score: Optional[float] = None
    status: Optional[str] = None

class TicketUpdateStatus(BaseModel):
    status: str = Field(..., description="Valid status: Open, In Progress, Resolved, Closed")

class TicketResponse(BaseModel):
    ticket_id: str = Field(..., description="UUID identifier for the ticket")
    id: int = Field(..., description="Numeric internal database ID")
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

class TicketListResponse(BaseModel):
    tickets: List[TicketResponse]
    total: int
    page: int
    limit: int
    total_pages: int

# --- Prediction & Explanation Schemas ---
class ExplainRequest(BaseModel):
    ticket_text: str = Field(..., min_length=1, description="Raw support ticket text or concatenated title and description")
    prediction: Optional[str] = Field(None, description="Optional predicted class label to explain (e.g. Booking, Refund)")
    model_type: Optional[str] = Field("category", description="Target model to explain: category, priority, or root_cause")
    num_features: Optional[int] = Field(10, ge=1, le=30, description="Top N important features to extract")

class WordImpact(BaseModel):
    word: str
    score: float
    impact: str

class SpanHighlight(BaseModel):
    word: str
    start: int
    end: int
    score: float
    sentiment: str

class DetailedExplanationResponse(BaseModel):
    predicted_class: str
    importance_score: float
    top_positive_words: List[WordImpact]
    top_negative_words: List[WordImpact]
    feature_importance: Dict[str, float]
    highlighted_spans: List[SpanHighlight]
    highlighted_text: List[Union[tuple, list]]

class CategoryCandidate(BaseModel):
    category: str
    confidence: float

class LimeExplanation(BaseModel):
    feature_importance: Dict[str, float]
    highlighted_text: List[Union[tuple, list]]  # [("word", score)]
    top_positive_words: Optional[List[WordImpact]] = None
    top_negative_words: Optional[List[WordImpact]] = None
    highlighted_spans: Optional[List[SpanHighlight]] = None
    importance_score: Optional[float] = None

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
    ticket_id: Optional[str] = None
    id: Optional[int] = None
    lime_explanation: Optional[LimeExplanation] = None

# --- Feedback Schemas ---
class FeedbackCreate(BaseModel):
    ticket_id: int
    predicted_category: str
    actual_category: str
    predicted_priority: str
    actual_priority: str
    comments: Optional[str] = None
    reviewed_by: Optional[str] = "Support Lead"

class FeedbackResponse(BaseModel):
    id: int
    ticket_id: int
    predicted_category: str
    actual_category: str
    predicted_priority: str
    actual_priority: str
    comments: Optional[str] = None
    reviewed_by: Optional[str] = "Support Lead"
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
