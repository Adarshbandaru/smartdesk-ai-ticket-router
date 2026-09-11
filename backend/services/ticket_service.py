import uuid
from typing import Optional, List, Tuple, Union
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from database.models import Ticket, ActivityLog
from schemas.schemas import TicketCreate, TicketUpdate

class TicketService:
    @staticmethod
    def create_ticket(
        db: Session,
        ticket_in: TicketCreate,
        category: Optional[str] = None,
        priority: Optional[str] = None,
        root_cause: Optional[str] = None,
        assigned_team: Optional[str] = None,
        confidence: Optional[float] = None,
        processing_time: float = 0.0
    ) -> Ticket:
        # Resolve fields from body or query params
        final_category = category or ticket_in.category or "General Inquiry"
        final_priority = priority or ticket_in.priority or "Medium"
        final_root_cause = root_cause or ticket_in.root_cause or "Customer Request"
        final_assigned_team = assigned_team or ticket_in.assigned_team or "General Support"
        final_confidence = confidence if confidence is not None else (ticket_in.confidence_score if ticket_in.confidence_score is not None else ticket_in.confidence)
        final_proc_time = processing_time or (ticket_in.processing_time_ms if ticket_in.processing_time_ms is not None else (ticket_in.processing_time or 0.0))

        new_ticket = Ticket(
            ticket_id=str(uuid.uuid4()),
            title=ticket_in.title,
            description=ticket_in.description,
            category=final_category,
            priority=final_priority,
            root_cause=final_root_cause,
            assigned_team=final_assigned_team,
            confidence_score=final_confidence if final_confidence is not None else 0.85,
            processing_time_ms=final_proc_time,
            status=ticket_in.status or "Open"
        )
        db.add(new_ticket)
        db.flush()

        log = ActivityLog(
            action="TICKET_CREATED",
            entity_type="ticket",
            entity_id=str(new_ticket.ticket_id),
            details=f"Created ticket '{new_ticket.title[:40]}' routed to {new_ticket.assigned_team} ({new_ticket.priority})"
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
        assigned_team: Optional[str] = None,
        search: Optional[str] = None,
        sort: str = "newest"
    ) -> Tuple[List[Ticket], int]:
        query = db.query(Ticket)
        
        if status:
            query = query.filter(Ticket.status == status)
        if priority:
            query = query.filter(Ticket.priority == priority)
        if category:
            query = query.filter(Ticket.category == category)
        if assigned_team:
            query = query.filter(Ticket.assigned_team == assigned_team)
        if search:
            query = query.filter(
                or_(
                    Ticket.title.ilike(f"%{search}%"),
                    Ticket.description.ilike(f"%{search}%"),
                    Ticket.assigned_team.ilike(f"%{search}%")
                )
            )
        
        total = query.count()

        # Sort by newest / oldest
        if sort.lower() == "oldest":
            query = query.order_by(asc(Ticket.created_at))
        else:
            query = query.order_by(desc(Ticket.created_at))

        tickets = query.offset(skip).limit(limit).all()
        return tickets, total

    @staticmethod
    def get_ticket(db: Session, identifier: Union[str, int]) -> Optional[Ticket]:
        """Lookup by UUID ticket_id or numeric internal id."""
        if isinstance(identifier, int) or (isinstance(identifier, str) and identifier.isdigit()):
            ticket = db.query(Ticket).filter(Ticket.id == int(identifier)).first()
            if ticket:
                return ticket
        
        # Try finding by string ticket_id (UUID)
        return db.query(Ticket).filter(Ticket.ticket_id == str(identifier)).first()

    @staticmethod
    def update_ticket(db: Session, identifier: Union[str, int], update_in: TicketUpdate) -> Optional[Ticket]:
        ticket = TicketService.get_ticket(db, identifier)
        if not ticket:
            return None

        update_data = update_in.model_dump(exclude_unset=True)
        changes = []
        for field, value in update_data.items():
            if hasattr(ticket, field) and value is not None:
                old_val = getattr(ticket, field)
                setattr(ticket, field, value)
                changes.append(f"{field}: '{old_val}' -> '{value}'")

        if changes:
            log = ActivityLog(
                action="TICKET_UPDATED",
                entity_type="ticket",
                entity_id=str(ticket.ticket_id),
                details="; ".join(changes)
            )
            db.add(log)
            db.commit()
            db.refresh(ticket)
        return ticket

    @staticmethod
    def update_status(db: Session, identifier: Union[str, int], new_status: str) -> Optional[Ticket]:
        ticket = TicketService.get_ticket(db, identifier)
        if not ticket:
            return None
        
        old_status = ticket.status
        ticket.status = new_status
        
        log = ActivityLog(
            action="STATUS_UPDATED",
            entity_type="ticket",
            entity_id=str(ticket.ticket_id),
            details=f"Status changed from '{old_status}' to '{new_status}'"
        )
        db.add(log)
        db.commit()
        db.refresh(ticket)
        return ticket

    @staticmethod
    def delete_ticket(db: Session, identifier: Union[str, int]) -> bool:
        ticket = TicketService.get_ticket(db, identifier)
        if not ticket:
            return False

        ticket_ref = ticket.ticket_id
        db.delete(ticket)
        
        log = ActivityLog(
            action="TICKET_DELETED",
            entity_type="ticket",
            entity_id=str(ticket_ref),
            details=f"Deleted ticket #{ticket.id} ({ticket_ref})"
        )
        db.add(log)
        db.commit()
        return True
