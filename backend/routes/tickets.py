from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from schemas.schemas import TicketResponse, TicketCreate
from database.database import get_db
from database.models import Ticket
from typing import List

router = APIRouter()

@router.post("/", response_model=TicketResponse)
def create_ticket(ticket: TicketCreate, category: str, priority: str, root_cause: str, assigned_team: str, confidence: float, processing_time: float, db: Session = Depends(get_db)):
    db_ticket = Ticket(
        title=ticket.title,
        description=ticket.description,
        category=category,
        priority=priority,
        root_cause=root_cause,
        assigned_team=assigned_team,
        confidence=confidence,
        processing_time=processing_time,
        status="Open"
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

@router.get("/", response_model=List[TicketResponse])
def get_tickets(
    skip: int = 0, limit: int = 50, 
    status: str = None, priority: str = None, category: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(Ticket)
    if status:
        query = query.filter(Ticket.status == status)
    if priority:
        query = query.filter(Ticket.priority == priority)
    if category:
        query = query.filter(Ticket.category == category)
        
    tickets = query.order_by(Ticket.created_at.desc()).offset(skip).limit(limit).all()
    return tickets

@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    return db.query(Ticket).filter(Ticket.id == ticket_id).first()
