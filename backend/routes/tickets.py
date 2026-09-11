from fastapi import APIRouter, Depends, Query, HTTPException, status, Path
from sqlalchemy.orm import Session
from typing import Optional
from math import ceil
from schemas.schemas import TicketResponse, TicketCreate, TicketUpdate, TicketUpdateStatus, TicketListResponse
from database.session import get_db
from services.ticket_service import TicketService

router = APIRouter()

@router.post(
    "/",
    response_model=TicketResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new ticket",
    description="Create an airline support ticket. Fields can be supplied in JSON body or as query parameters."
)
def create_ticket(
    ticket: TicketCreate,
    category: Optional[str] = Query(None, description="Category override (e.g. Booking, Baggage, Refund)"),
    priority: Optional[str] = Query(None, description="Priority override (Critical, High, Medium, Low)"),
    root_cause: Optional[str] = Query(None, description="Identified root cause"),
    assigned_team: Optional[str] = Query(None, description="Target team assignment"),
    confidence: Optional[float] = Query(None, description="Model confidence score"),
    processing_time: float = Query(0.0, description="Inference latency in ms"),
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

@router.get(
    "/",
    response_model=TicketListResponse,
    status_code=status.HTTP_200_OK,
    summary="List all tickets with filtering, pagination, and sorting",
    description="Retrieve tickets with flexible filtering by status, category, priority, assigned team, and text search."
)
def get_tickets(
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(50, ge=1, le=100, description="Number of items to return"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (Open, In Progress, Resolved, Closed)"),
    priority: Optional[str] = Query(None, description="Filter by priority (Critical, High, Medium, Low)"),
    category: Optional[str] = Query(None, description="Filter by category (Booking, Cancellation, Refund, Baggage, Technical Issue, Customer Service)"),
    assigned_team: Optional[str] = Query(None, description="Filter by assigned department / team"),
    search: Optional[str] = Query(None, description="Search term in title, description, or assigned team"),
    sort: str = Query("newest", pattern="^(newest|oldest)$", description="Sort order: 'newest' or 'oldest'"),
    db: Session = Depends(get_db)
):
    tickets, total = TicketService.get_tickets(
        db=db,
        skip=skip,
        limit=limit,
        status=status_filter,
        priority=priority,
        category=category,
        assigned_team=assigned_team,
        search=search,
        sort=sort
    )
    
    current_page = (skip // limit) + 1 if limit > 0 else 1
    total_pages = ceil(total / limit) if limit > 0 and total > 0 else 1

    return {
        "tickets": [TicketResponse.model_validate(t) for t in tickets],
        "total": total,
        "page": current_page,
        "limit": limit,
        "total_pages": total_pages
    }

@router.get(
    "/{ticket_id}",
    response_model=TicketResponse,
    status_code=status.HTTP_200_OK,
    summary="Get a ticket by UUID or numeric ID",
    description="Lookup a specific support ticket by its UUID or legacy integer ID."
)
def get_ticket(
    ticket_id: str = Path(..., description="The ticket UUID or internal numeric ID"),
    db: Session = Depends(get_db)
):
    ticket = TicketService.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket '{ticket_id}' not found"
        )
    return ticket

@router.patch(
    "/{ticket_id}",
    response_model=TicketResponse,
    status_code=status.HTTP_200_OK,
    summary="Partially update a ticket",
    description="Update arbitrary ticket fields (title, description, category, priority, status, assigned_team)."
)
def update_ticket(
    ticket_id: str = Path(..., description="The ticket UUID or internal numeric ID"),
    ticket_update: TicketUpdate = ...,
    db: Session = Depends(get_db)
):
    if ticket_update.status:
        valid_statuses = ["Open", "In Progress", "Resolved", "Closed"]
        if ticket_update.status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status '{ticket_update.status}'. Must be one of: {valid_statuses}"
            )

    updated = TicketService.update_ticket(db, ticket_id, ticket_update)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket '{ticket_id}' not found"
        )
    return updated

@router.patch(
    "/{ticket_id}/status",
    response_model=TicketResponse,
    status_code=status.HTTP_200_OK,
    summary="Quick-update ticket status",
    description="Dedicated status change endpoint compatible with frontend actions."
)
def update_ticket_status(
    ticket_id: str = Path(..., description="The ticket UUID or internal numeric ID"),
    status_val: Optional[str] = Query(None, alias="status", description="Query param for status"),
    status_body: Optional[TicketUpdateStatus] = None,
    db: Session = Depends(get_db)
):
    target_status = status_val or (status_body.status if status_body else None)
    if not target_status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be provided in query parameter or request body"
        )

    valid_statuses = ["Open", "In Progress", "Resolved", "Closed"]
    if target_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{target_status}'. Must be one of: {valid_statuses}"
        )
    
    updated = TicketService.update_status(db, ticket_id, target_status)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket '{ticket_id}' not found"
        )
    return updated

@router.delete(
    "/{ticket_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a ticket",
    description="Permanently delete a ticket and its associated feedback records."
)
def delete_ticket(
    ticket_id: str = Path(..., description="The ticket UUID or internal numeric ID"),
    db: Session = Depends(get_db)
):
    deleted = TicketService.delete_ticket(db, ticket_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket '{ticket_id}' not found"
        )
    return {
        "status": "success",
        "message": f"Ticket '{ticket_id}' successfully deleted"
    }
