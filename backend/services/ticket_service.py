import uuid
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database.models import Ticket, ActivityLog
from schemas.schemas import TicketCreate

class TicketService:
    @staticmethod
    def create_ticket(
        db: Session,
        ticket_in: TicketCreate,
        category: str,
        priority: str,
        root_cause: Optional[str] = None,
        assigned_team: Optional[str] = None,
        confidence: Optional[float] = None,
        processing_time: float = 0.0
    ) -> Ticket:
        new_ticket = Ticket(
            ticket_id=str(uuid.uuid4()),
            title=ticket_in.title,
            description=ticket_in.description,
            category=category,
            priority=priority,
            root_cause=root_cause,
            assigned_team=assigned_team,
            confidence_score=confidence,
            processing_time_ms=processing_time,
            status="Open"
        )
        db.add(new_ticket)
        db.flush()

        log = ActivityLog(
            action="TICKET_CREATED",
            entity_type="ticket",
            entity_id=str(new_ticket.id),
            details=f"Created ticket '{new_ticket.title[:40]}' routed to {assigned_team} ({priority})"
        )
        db.add(log)
        db.commit()
        db.refresh(new_ticket)
        return new_ticket

    @staticmethod
    def get_tickets(
        db: Session,
        skip: int = 0,
        limit: int = 50,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        category: Optional[str] = None,
        search: Optional[str] = None
    ) -> Tuple[List[Ticket], int]:
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
        return tickets, total

    @staticmethod
    def get_ticket_by_id(db: Session, ticket_id: int) -> Optional[Ticket]:
        return db.query(Ticket).filter(Ticket.id == ticket_id).first()

    @staticmethod
    def update_status(db: Session, ticket_id: int, new_status: str) -> Optional[Ticket]:
        ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
        if not ticket:
            return None
        
        old_status = ticket.status
        ticket.status = new_status
        
        log = ActivityLog(
            action="STATUS_UPDATED",
            entity_type="ticket",
            entity_id=str(ticket.id),
            details=f"Status changed from {old_status} to {new_status}"
        )
        db.add(log)
        db.commit()
        db.refresh(ticket)
        return ticket
