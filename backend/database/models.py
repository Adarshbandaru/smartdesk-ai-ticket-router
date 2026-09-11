import uuid
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class Ticket(Base):
    __tablename__ = "tickets"

    # Primary key integer for fast indexing and backwards compatibility
    id = Column(Integer, primary_key=True, index=True)
    # Explicit ticket_id (UUID) as requested
    ticket_id = Column(String(36), unique=True, index=True, default=generate_uuid)
    
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    priority = Column(String(50), nullable=False, index=True)
    root_cause = Column(String(100), nullable=True)
    assigned_team = Column(String(100), nullable=True, index=True)
    confidence_score = Column(Float, nullable=True)
    status = Column(String(50), default="Open", index=True)
    processing_time_ms = Column(Float, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Backwards compatibility properties for existing frontend/code expecting .confidence & .processing_time
    @property
    def confidence(self):
        return self.confidence_score

    @confidence.setter
    def confidence(self, value):
        self.confidence_score = value

    @property
    def processing_time(self):
        return self.processing_time_ms

    @processing_time.setter
    def processing_time(self, value):
        self.processing_time_ms = value

    feedbacks = relationship("Feedback", back_populates="ticket", cascade="all, delete-orphan")


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False)
    predicted_category = Column(String(100), nullable=False)
    actual_category = Column(String(100), nullable=False)
    predicted_priority = Column(String(50), nullable=False)
    actual_priority = Column(String(50), nullable=False)
    comments = Column(Text, nullable=True)
    reviewed_by = Column(String(100), nullable=True, default="Support Lead")
    is_processed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    ticket = relationship("Ticket", back_populates="feedbacks")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    role = Column(String(50), default="Support Agent")  # Admin, Support Agent
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ModelMetric(Base):
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), index=True, nullable=False)
    accuracy = Column(Float, nullable=False)
    precision = Column(Float, nullable=False)
    recall = Column(Float, nullable=False)
    f1_score = Column(Float, nullable=False)
    version = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(100), nullable=False, index=True)
    entity_type = Column(String(50), nullable=False)  # ticket, model, feedback, auth
    entity_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
