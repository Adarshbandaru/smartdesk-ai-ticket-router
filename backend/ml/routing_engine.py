from typing import Dict, Any

class RoutingEngine:
    """
    Rule-based Intelligent Ticket Routing Engine:
    Maps category, priority, and root cause to operational support teams and SLAs.
    """
    TEAM_MAPPING = {
        "Booking": "Booking Operations",
        "Cancellation": "Ticket Operations",
        "Refund": "Finance Team",
        "Baggage": "Baggage Support",
        "Technical Issue": "Engineering Support",
        "Customer Service": "Customer Care"
    }

    SLA_MAPPING = {
        "Critical": "1 Hour",
        "High": "4 Hours",
        "Medium": "24 Hours",
        "Low": "48 Hours"
    }

    @classmethod
    def route(cls, category: str, priority: str, root_cause: str = None) -> Dict[str, str]:
        # Priority override: Critical tickets route directly to Escalation Team
        if priority == "Critical":
            assigned_team = "Escalation Team"
        else:
            assigned_team = cls.TEAM_MAPPING.get(category, "General Support")

        suggested_sla = cls.SLA_MAPPING.get(priority, "24 Hours")

        return {
            "assigned_team": assigned_team,
            "suggested_sla": suggested_sla
        }
