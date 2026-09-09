from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(String) # Admin, Support Agent
    password_hash = Column(String)

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    category = Column(String, index=True)
    priority = Column(String, index=True)
    root_cause = Column(String)
    assigned_team = Column(String, index=True)
    confidence = Column(Float)
    status = Column(String, default="Open", index=True)
    processing_time = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    feedbacks = relationship("Feedback", back_populates="ticket")

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"))
    predicted_category = Column(String)
    actual_category = Column(String)
    predicted_priority = Column(String)
    actual_priority = Column(String)
    comments = Column(String, nullable=True)
    is_processed = Column(Boolean, default=False) # True if used for retraining
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    ticket = relationship("Ticket", back_populates="feedbacks")

class ModelMetric(Base):
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, index=True)
    accuracy = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    f1_score = Column(Float)
    version = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
