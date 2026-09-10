from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from schemas.schemas import TicketResponse, TicketCreate
from database.database import get_db
from database.models import Ticket
from typing import List, Optional

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

@router.get("/")
def get_tickets(
    skip: int = 0, limit: int = 50, 
    status: Optional[str] = None, priority: Optional[str] = None, 
    category: Optional[str] = None, search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Ticket)
    if status:
        query = query.filter(Ticket.status == status)
    if priority:
        query = query.filter(Ticket.priority == priority)
    if category:
        query = query.filter(Ticket.category == category)
    if search:
        query = query.filter(
            or_(
                Ticket.title.ilike(f"%{search}%"),
                Ticket.description.ilike(f"%{search}%"),
                Ticket.assigned_team.ilike(f"%{search}%")
            )
        )
    
    total = query.count()
    tickets = query.order_by(Ticket.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "tickets": [TicketResponse.model_validate(t) for t in tickets],
        "total": total
    }

@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.patch("/{ticket_id}/status")
def update_ticket_status(ticket_id: int, status: str, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    valid_statuses = ["Open", "In Progress", "Resolved", "Closed"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    ticket.status = status
    db.commit()
    db.refresh(ticket)
    return ticket
