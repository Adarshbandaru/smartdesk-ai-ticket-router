import os
import random
from datetime import datetime, timedelta

def initialize_models():
    # Check if models exist, if not, generate data and train
    model_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ml", "models")
    if not os.path.exists(model_dir) or not os.listdir(model_dir):
        print("Models not found. Initializing data and training models...")
        import sys
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
        
        from dataset.generate_data import generate_synthetic_data
        from ml.train import train_models
        
        generate_synthetic_data(1000)
        train_models()
        print("Model initialization complete.")
    else:
        print("Models already exist.")
    
    # Seed database with sample data if empty
    _seed_database()


def _seed_database():
    """Populate the database with sample tickets, feedback, and model metrics."""
    from database.database import SessionLocal
    from database.models import Ticket, Feedback, ModelMetric

    db = SessionLocal()
    try:
        # Skip if already seeded
        if db.query(Ticket).count() > 0:
            print("Database already seeded.")
            return
        
        print("Seeding database with sample data...")

        # --- Team routing mapping ---
        team_mapping = {
            "Booking": "Booking Operations",
            "Cancellation": "Ticket Operations",
            "Refund": "Finance Team",
            "Baggage": "Baggage Support",
            "Technical Issue": "Engineering Support",
            "Customer Service": "Customer Care",
        }

        # --- Realistic ticket templates ---
        ticket_templates = {
            "Booking": [
                ("Cannot complete booking to NYC", "I have been trying to book a flight to New York but the payment keeps failing at the last step. I've tried two different cards."),
                ("Seat selection unavailable", "The seat map won't load when I try to select my seat for flight AA-2847 to London."),
                ("Group booking assistance needed", "We need to book 12 seats together for a corporate trip to Paris next month. The online system only allows 9."),
                ("Booking confirmation not received", "I completed my booking 3 hours ago but haven't received any confirmation email. Ref: BK-78234."),
                ("Price changed during booking", "The fare jumped from $450 to $680 while I was filling in passenger details for my Tokyo flight."),
                ("Error adding infant to booking", "Getting a system error when trying to add my 8-month-old infant to existing booking REF-44521."),
                ("Flight date change request", "I need to move my booking from March 15 to March 22. Same route NYC to LON."),
                ("Promo code not applying", "Code SUMMER2024 should give 15% off but it says 'invalid code' at checkout."),
            ],
            "Cancellation": [
                ("Cancel flight due to illness", "I need to cancel my upcoming flight to Sydney as I've been hospitalized. I have medical documentation."),
                ("How to cancel within 24 hours", "I just booked a flight 2 hours ago and want to cancel. What is the refund policy for cancellations within 24 hours?"),
                ("Partial cancellation of round trip", "I want to cancel only the return leg of my round-trip booking to Tokyo. Booking ref: RT-55123."),
                ("Cancel and rebook different date", "Flight AA-7721 on April 5 needs to be cancelled. I want to rebook for April 12 instead."),
                ("Cancellation due to flight delay", "My connecting flight was delayed 6 hours making my itinerary useless. I want a full cancellation and refund."),
                ("Group cancellation request", "3 out of 8 travelers in group booking GRP-2234 need to cancel. Please process partial cancellation."),
            ],
            "Refund": [
                ("Refund not received after 30 days", "I cancelled my flight on February 1st and was told refund would take 7-10 business days. It's been a month."),
                ("Double charged for single booking", "My credit card was charged twice ($890 each) for booking REF-33421. Please refund the duplicate."),
                ("Refund for flight cancellation by airline", "Flight SQ-441 was cancelled by the airline. I need my $1,200 refund processed immediately."),
                ("Partial refund for downgraded seat", "I paid for business class but was seated in economy due to overbooking. I want the fare difference refunded."),
                ("Refund status inquiry", "Can you check the status of my refund? Reference number: RF-2024-8843. Submitted 2 weeks ago."),
                ("Refund for unused ancillary services", "I paid $85 for priority boarding and lounge access but my flight was cancelled. Need refund for add-ons."),
            ],
            "Baggage": [
                ("Missing checked baggage", "My checked luggage didn't arrive at Sydney airport. Flight QF-211, tag number BG-990234."),
                ("Damaged suitcase claim", "My hard-shell suitcase has a cracked wheel and torn handle after my flight from London. Photos attached."),
                ("Add extra baggage to booking", "I need to add one extra checked bag (23kg) to my booking TK-44521 for next week's flight to Paris."),
                ("Oversized baggage inquiry", "I'm traveling with a cello. What are the requirements and fees for bringing it as special baggage?"),
                ("Lost item in cabin", "I left my laptop bag in the overhead bin on flight BA-772 from NYC to LON yesterday. Seat 14A."),
                ("Baggage weight limit exceeded", "At check-in my bag was 26kg and I was charged $75 extra. But the booking said 25kg allowance."),
            ],
            "Technical Issue": [
                ("Cannot log in to my account", "I'm getting 'Invalid credentials' error when trying to log in. I've reset my password 3 times already."),
                ("App crashes on Android", "The mobile app keeps crashing immediately after opening on my Samsung Galaxy S24. Android 15."),
                ("Payment gateway error 500", "Every time I try to pay, I get an internal server error. This has been happening for 2 days."),
                ("Website loading extremely slow", "The website takes over 30 seconds to load any page. Other websites work fine on my connection."),
                ("Boarding pass QR code invalid", "My mobile boarding pass QR code is showing as invalid at the airport scanner. Flight departs in 2 hours!"),
                ("Two-factor authentication not working", "I'm not receiving the SMS verification code. Tried 5 times in the last hour. Phone number is correct."),
                ("Online check-in page blank", "When I click 'Check In' for my flight tomorrow, the page loads completely blank. Tried Chrome and Firefox."),
            ],
            "Customer Service": [
                ("Name correction on ticket", "There's a typo in my last name. It says 'Jhonson' but should be 'Johnson'. Booking ref: CS-88123."),
                ("Special meal request", "I need to add a vegetarian meal for my flight to Tokyo next Friday. Booking: ML-55612."),
                ("Wheelchair assistance needed", "My elderly mother needs wheelchair assistance at both departure and arrival airports. She's 82 years old."),
                ("Frequent flyer miles not credited", "My last 3 flights haven't had miles credited to my loyalty account. Member ID: FF-442891."),
                ("Complaint about cabin crew", "The crew member on flight UA-332 was extremely rude when I asked for water. I'd like to file a formal complaint."),
                ("Pet travel policy inquiry", "I want to fly with my 7kg French Bulldog from NYC to LON. What are the requirements and cabin policies?"),
            ],
        }

        statuses = ["Open", "In Progress", "Resolved", "Closed"]
        status_weights = [0.35, 0.25, 0.25, 0.15]
        
        tickets = []
        now = datetime.utcnow()
        
        for cat, templates in ticket_templates.items():
            for title, description in templates:
                # Determine priority based on category logic
                if cat == "Technical Issue":
                    pri = random.choice(["High", "Critical"])
                elif cat == "Refund":
                    pri = random.choice(["Medium", "High"])
                elif cat == "Baggage":
                    pri = random.choice(["Medium", "High"])
                elif cat in ("Booking", "Cancellation"):
                    pri = random.choice(["Low", "Medium", "High"])
                else:
                    pri = random.choice(["Low", "Medium"])

                assigned_team = "Escalation Team" if pri == "Critical" else team_mapping.get(cat, "General Support")
                
                # Assign root causes
                root_cause_map = {
                    "Booking": ["Payment Failure", "Seat Availability", "System Error"],
                    "Cancellation": ["Customer Request", "Flight Delay", "Customer Request"],
                    "Refund": ["Payment Failure", "Refund Delay", "Refund Delay"],
                    "Baggage": ["Missing Baggage", "Missing Baggage", "Customer Request"],
                    "Technical Issue": ["System Error", "Login Issue", "System Error"],
                    "Customer Service": ["Customer Request", "Customer Request", "Customer Request"],
                }
                root_cause = random.choice(root_cause_map.get(cat, ["Customer Request"]))
                
                status = random.choices(statuses, weights=status_weights, k=1)[0]
                confidence = round(random.uniform(0.78, 0.99), 4)
                processing_time = round(random.uniform(45, 280), 2)
                created_at = now - timedelta(hours=random.randint(1, 720))
                
                ticket = Ticket(
                    title=title,
                    description=description,
                    category=cat,
                    priority=pri,
                    root_cause=root_cause,
                    assigned_team=assigned_team,
                    confidence=confidence,
                    status=status,
                    processing_time=processing_time,
                    created_at=created_at
                )
                tickets.append(ticket)
        
        db.add_all(tickets)
        db.flush()  # Get ticket IDs

        print(f"  Seeded {len(tickets)} tickets.")

        # --- Seed Feedback entries (simulate incorrect predictions) ---
        feedback_data = [
            {"ticket_id": tickets[0].id, "predicted_category": "Technical Issue", "actual_category": "Booking", "predicted_priority": "High", "actual_priority": "Medium", "comments": "Payment failure is a booking issue, not technical."},
            {"ticket_id": tickets[5].id, "predicted_category": "Booking", "actual_category": "Cancellation", "predicted_priority": "Low", "actual_priority": "High", "comments": "Patient hospitalized - should be high priority cancellation."},
            {"ticket_id": tickets[10].id, "predicted_category": "Cancellation", "actual_category": "Refund", "predicted_priority": "Medium", "actual_priority": "High", "comments": "Double charge is a refund issue, not cancellation."},
            {"ticket_id": tickets[18].id, "predicted_category": "Customer Service", "actual_category": "Baggage", "predicted_priority": "Low", "actual_priority": "Medium", "comments": "Lost item claim should be classified under baggage."},
            {"ticket_id": tickets[25].id, "predicted_category": "Booking", "actual_category": "Technical Issue", "predicted_priority": "Medium", "actual_priority": "Critical", "comments": "App crash is critical technical, not a booking issue."},
            {"ticket_id": tickets[30].id, "predicted_category": "Technical Issue", "actual_category": "Customer Service", "predicted_priority": "High", "actual_priority": "Low", "comments": "General inquiry, not a technical problem."},
            {"ticket_id": tickets[35].id, "predicted_category": "Refund", "actual_category": "Cancellation", "predicted_priority": "High", "actual_priority": "Medium", "comments": "This is about cancelling, not about a refund."},
        ]
        
        for fd in feedback_data:
            db.add(Feedback(**fd))
        
        print(f"  Seeded {len(feedback_data)} feedback entries.")

        # --- Seed Model Version History ---
        model_versions = [
            {"model_name": "SmartDesk Ensemble", "accuracy": 0.85, "precision": 0.84, "recall": 0.86, "f1_score": 0.85, "version": 1, "created_at": now - timedelta(days=60)},
            {"model_name": "SmartDesk Ensemble", "accuracy": 0.88, "precision": 0.87, "recall": 0.89, "f1_score": 0.88, "version": 2, "created_at": now - timedelta(days=45)},
            {"model_name": "SmartDesk Ensemble", "accuracy": 0.89, "precision": 0.88, "recall": 0.90, "f1_score": 0.89, "version": 3, "created_at": now - timedelta(days=30)},
            {"model_name": "SmartDesk Ensemble", "accuracy": 0.91, "precision": 0.90, "recall": 0.92, "f1_score": 0.91, "version": 4, "created_at": now - timedelta(days=15)},
            {"model_name": "SmartDesk Ensemble", "accuracy": 0.92, "precision": 0.91, "recall": 0.93, "f1_score": 0.92, "version": 5, "created_at": now},
        ]
        
        for mv in model_versions:
            db.add(ModelMetric(**mv))
        
        print(f"  Seeded {len(model_versions)} model version records.")

        db.commit()
        print("Database seeding complete.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    initialize_models()
