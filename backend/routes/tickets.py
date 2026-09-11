from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from schemas.schemas import TicketResponse, TicketCreate
from database.session import get_db
from services.ticket_service import TicketService

router = APIRouter()

@router.post("/", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(
    ticket: TicketCreate,
    category: str = Query(...),
    priority: str = Query(...),
    root_cause: Optional[str] = Query(None),
    assigned_team: Optional[str] = Query(None),
    confidence: Optional[float] = Query(None),
    processing_time: float = Query(0.0),
    db: Session = Depends(get_db)
):
    created = TicketService.create_ticket(
        db=db,
        ticket_in=ticket,
        category=category,
        priority=priority,
        root_cause=root_cause,
        assigned_team=assigned_team,
        confidence=confidence,
        processing_time=processing_time
    )
    return created

@router.get("/", status_code=status.HTTP_200_OK)
def get_tickets(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    tickets, total = TicketService.get_tickets(
        db=db,
        skip=skip,
        limit=limit,
        status=status_filter,
        priority=priority,
        category=category,
        search=search
    )
    
    return {
        "tickets": [TicketResponse.model_validate(t) for t in tickets],
        "total": total
    }

@router.get("/{ticket_id}", response_model=TicketResponse, status_code=status.HTTP_200_OK)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = TicketService.get_ticket_by_id(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Ticket #{ticket_id} not found")
    return ticket

@router.patch("/{ticket_id}/status", response_model=TicketResponse, status_code=status.HTTP_200_OK)
def update_ticket_status(ticket_id: int, status: str, db: Session = Depends(get_db)):
    valid_statuses = ["Open", "In Progress", "Resolved", "Closed"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{status}'. Must be one of: {valid_statuses}"
        )
    
    updated = TicketService.update_status(db, ticket_id, status)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Ticket #{ticket_id} not found")
    return updated
