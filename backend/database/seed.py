import random
import uuid
from datetime import datetime, timedelta
from database.session import SessionLocal
from database.models import Ticket, Feedback, User, ModelMetric, ActivityLog

def seed_database(force_reseed: bool = False):
    """Seed the database with 50 realistic airline support tickets and baseline data."""
    db = SessionLocal()
    try:
        if not force_reseed and db.query(Ticket).count() >= 50:
            print("[Seed] Database already has >= 50 tickets. Skipping seed.")
            return

        print("[Seed] Starting database population with 50 realistic airline support tickets...")

        # Clear existing tickets if force_reseed
        if force_reseed:
            db.query(Feedback).delete()
            db.query(Ticket).delete()
            db.query(ActivityLog).delete()
            db.query(User).delete()
            db.query(ModelMetric).delete()
            db.commit()

        # 50 Detailed, realistic airline customer support tickets across 6 key domains
        airline_tickets_data = [
            # --- Booking (9 tickets) ---
            ("Cannot complete booking to NYC with corporate card", 
             "I have been trying to book flight DL-1042 to New York JFK for two travelers, but the payment gateway returns error 402 with corporate Amex.", 
             "Booking", "High", "Payment Failure", "Booking Operations", 0.94),
            ("Seat selection map fails to load for London flight", 
             "When trying to select seats for flight BA-178 to London Heathrow, the interactive seat cabin map stays blank on both Safari and Chrome.", 
             "Booking", "Medium", "System Error", "Booking Operations", 0.91),
            ("Group booking request for 14 passengers to Paris", 
             "We need to reserve 14 seats together on flight AF-022 to Paris CDG for a medical symposium next month. The website cuts off at 9 seats.", 
             "Booking", "Medium", "Customer Request", "Booking Operations", 0.89),
            ("Booking confirmation email missing after successful payment", 
             "My credit card was charged $840 for booking BK-99234 to Chicago O'Hare 4 hours ago, but no e-ticket or confirmation PDF has arrived.", 
             "Booking", "High", "System Error", "Booking Operations", 0.93),
            ("Fare price surged during passenger details entry", 
             "The economy ticket from SFO to Tokyo Haneda jumped from $720 to $1,150 while entering passport information in under 3 minutes.", 
             "Booking", "Low", "Customer Request", "Booking Operations", 0.82),
            ("Error adding infant in arms to existing reservation", 
             "I need to add my 6-month-old daughter to itinerary PNR-55219 for next Tuesday's flight to Atlanta. The app says traveler profile locked.", 
             "Booking", "Medium", "Customer Request", "Booking Operations", 0.88),
            ("Request to change travel date from March 14 to March 21", 
             "Due to meeting rescheduling, I need to shift my non-stop flight to Seattle by one week. Fare class is Main Cabin Flexible.", 
             "Booking", "Low", "Customer Request", "Booking Operations", 0.86),
            ("Promo code SPRING2026 rejected at checkout", 
             "The 20% partner promotional code fails to apply at checkout for domestic flights, showing 'code not applicable for selected route'.", 
             "Booking", "Low", "Customer Request", "Booking Operations", 0.84),
            ("Duplicate passenger name entered on international ticket", 
             "I accidentally entered my middle name twice in the first name field for my international trip to Frankfurt. Need legal name match for passport.", 
             "Booking", "High", "Customer Request", "Booking Operations", 0.92),

            # --- Cancellation (8 tickets) ---
            ("Emergency flight cancellation due to hospitalization", 
             "I am scheduled to fly to Miami on Friday but was admitted to the hospital with acute appendicitis. Medical documentation is attached.", 
             "Cancellation", "High", "Customer Request", "Ticket Operations", 0.96),
            ("24-hour statutory cancellation policy inquiry and refund", 
             "I booked flight AA-409 within the last 90 minutes and want to cancel immediately under the DOT 24-hour free cancellation policy.", 
             "Cancellation", "Medium", "Customer Request", "Ticket Operations", 0.93),
            ("Cancel outbound leg only of round-trip reservation", 
             "I missed my outbound flight to Boston due to road construction, but I took the train instead. Do not cancel my return flight on Sunday!", 
             "Cancellation", "High", "Customer Request", "Ticket Operations", 0.95),
            ("Cancellation of connecting flight due to severe delay", 
             "My inbound flight from Denver was delayed 4 hours, making me miss the Tokyo connection. I request cancellation and rerouting back home.", 
             "Cancellation", "High", "Flight Delay", "Ticket Operations", 0.94),
            ("Corporate retreat canceled - request bulk ticket void", 
             "Our company trip to Austin for 8 employees is canceled. PNR list: TX-9011 to TX-9018. Please process credit vouchers.", 
             "Cancellation", "Medium", "Customer Request", "Ticket Operations", 0.90),
            ("Flight cancellation due to bereavement", 
             "My grandmother passed away yesterday and I must cancel my upcoming leisure trip to San Diego. Please waive standard cancellation penalties.", 
             "Cancellation", "Medium", "Customer Request", "Ticket Operations", 0.91),
            ("Voluntary cancellation of basic economy itinerary", 
             "I understand my ticket is basic economy, but I want to know what travel credit options are available if I cancel before 24 hours to departure.", 
             "Cancellation", "Low", "Customer Request", "Ticket Operations", 0.87),
            ("Flight canceled by airline with no automatic rebooking", 
             "Airline canceled flight UA-882 to Zurich with no alternative itinerary suggested in the app. Stranded at terminal with family.", 
             "Cancellation", "Critical", "Flight Delay", "Escalation Team", 0.98),

            # --- Refund (8 tickets) ---
            ("Refund not credited after 25 business days", 
             "My canceled flight RF-2026-8812 was approved for a $1,420 refund over three weeks ago. My bank shows zero incoming pending credits.", 
             "Refund", "High", "Refund Delay", "Finance Team", 0.95),
            ("Double charged on credit card for flight reservation", 
             "My card statement shows two identical charges of $649.50 on March 8th for booking reference DL-77812. Please reverse the duplicate.", 
             "Refund", "High", "Payment Failure", "Finance Team", 0.96),
            ("Full refund demand following involuntary flight cancellation", 
             "Flight KL-602 was canceled by mechanical failure. I refused the 24-hour delay rebooking and am entitled to a full cash refund.", 
             "Refund", "High", "Refund Delay", "Finance Team", 0.94),
            ("Partial refund request for involuntary cabin downgrade", 
             "I purchased business class tickets for $2,800 but was downgraded to premium economy due to aircraft equipment change. Need the difference refunded.", 
             "Refund", "High", "Customer Request", "Finance Team", 0.93),
            ("Refund for pre-paid extra baggage fees on canceled flight", 
             "I paid $120 for 2 checked bags online. The flight was grounded, so baggage services were never rendered. Requesting credit card refund.", 
             "Refund", "Medium", "Refund Delay", "Finance Team", 0.90),
            ("Travel voucher refund status inquiry", 
             "Can someone provide the status of reimbursement claim CL-44021 submitted 14 days ago for hotel expenses incurred during overnight delay?", 
             "Refund", "Medium", "Refund Delay", "Finance Team", 0.88),
            ("Duplicate seat upgrade fee charged twice", 
             "Upgraded to Extra Comfort seat 12B for $65, but my receipt shows two separate charges of $65 for the same seat assignment.", 
             "Refund", "Medium", "Payment Failure", "Finance Team", 0.91),
            ("Unlawful baggage fee charged at check-in counter", 
             "As a Gold Medallion member I am entitled to 2 complimentary bags, but the agent charged me $70. Requesting prompt reimbursement.", 
             "Refund", "Medium", "Refund Delay", "Finance Team", 0.89),

            # --- Baggage (8 tickets) ---
            ("Checked luggage missing on arrival at Sydney Airport", 
             "Flew on flight QF-12 from Los Angeles to Sydney. My black Samsonite bag (tag QF-884021) did not appear on baggage carousel 4.", 
             "Baggage", "High", "Missing Baggage", "Baggage Support", 0.97),
            ("Cracked hard-shell suitcase and damaged handle", 
             "Received my Rimowa suitcase with a 10cm crack across the corner shell and a snapped telescopic handle. PIR form filed at baggage desk.", 
             "Baggage", "Medium", "Missing Baggage", "Baggage Support", 0.92),
            ("Musical instrument cello transport inquiry as cabin baggage", 
             "I am a cellist flying to Vienna for an audition. What is the process to purchase an extra cabin seat (CBBG) for my cello?", 
             "Baggage", "Low", "Customer Request", "Baggage Support", 0.87),
            ("Essential medication stuck inside delayed checked bag", 
             "My checked bag containing prescription insulin was misrouted to Houston. I am in Dallas without medication. Immediate escalation needed.", 
             "Baggage", "Critical", "Missing Baggage", "Escalation Team", 0.99),
            ("Overweight baggage fee dispute at check-in counter", 
             "My luggage weighed 23.2kg at home on calibrated scale, but airport scale registered 25.1kg and charged $100 penalty fee.", 
             "Baggage", "Low", "Customer Request", "Baggage Support", 0.85),
            ("Lost stroller at gate delivery on flight arrival", 
             "We gate-checked our Uppababy baby stroller at gate B22, but upon deplaning at gate C14 the ramp staff could not locate it.", 
             "Baggage", "High", "Missing Baggage", "Baggage Support", 0.93),
            ("Purchase additional 32kg baggage allowance online", 
             "Need to add a second 32kg sports equipment bag for ski gear on flight LH-452. Web portal gives error code BAGG-400.", 
             "Baggage", "Medium", "System Error", "Baggage Support", 0.89),
            ("Valuable electronics missing from unlocked outer pocket", 
             "Upon arriving at hotel in Rome, noticed my noise-canceling headphones were missing from the checked duffel bag's zippered pouch.", 
             "Baggage", "Medium", "Missing Baggage", "Baggage Support", 0.90),

            # --- Technical Issue (9 tickets) ---
            ("Production payment gateway outage throwing 500 error", 
             "Customers cannot purchase any tickets across the mobile app and website. Stripe and Adyen checkout endpoints returning HTTP 500.", 
             "Technical Issue", "Critical", "System Error", "Escalation Team", 0.99),
            ("Mobile app crashing immediately upon launch on iOS 18", 
             "SmartDesk passenger app crashes to home screen directly after showing the splash screen on iPhone 16 Pro running iOS 18.2.", 
             "Technical Issue", "High", "System Error", "Engineering Support", 0.95),
            ("Two-Factor Authentication SMS never arrives", 
             "Attempted login 6 times in the last hour. The 6-digit OTP SMS verification code never reaches my mobile number.", 
             "Technical Issue", "High", "Login Issue", "Engineering Support", 0.94),
            ("Digital boarding pass QR code displays corrupted pixels", 
             "Apple Wallet pass generates a distorted, unreadable barcode that airport security scanners cannot validate.", 
             "Technical Issue", "Critical", "System Error", "Escalation Team", 0.98),
            ("Account locked out after password reset attempt", 
             "Completed the password reset link sent to my email, but now the system says 'Account locked due to suspicious activity'.", 
             "Technical Issue", "High", "Login Issue", "Engineering Support", 0.93),
            ("Online check-in portal displays blank white page", 
             "When clicking 'Check In' for flight departing in 6 hours, browser navigates to a completely blank page with console JavaScript error.", 
             "Technical Issue", "High", "System Error", "Engineering Support", 0.92),
            ("Frequent flyer loyalty points balance shows zero", 
             "My account normally has 184,000 SkyMiles points. Since this morning's website update, the dashboard shows 0 points and no history.", 
             "Technical Issue", "Medium", "System Error", "Engineering Support", 0.90),
            ("Flight search API timing out for multi-city itineraries", 
             "Search queries for 3-leg multi-city trips spin indefinitely and eventually show 'Request timed out after 60 seconds'.", 
             "Technical Issue", "Medium", "System Error", "Engineering Support", 0.91),
            ("Cannot update passenger contact phone number in profile", 
             "Profile settings page fails to save new international country codes (+44), resetting back to US format upon page refresh.", 
             "Technical Issue", "Low", "System Error", "Engineering Support", 0.86),

            # --- Customer Service (8 tickets) ---
            ("Emergency wheelchair assistance required for elderly passenger", 
             "My 84-year-old mother requires full wheelchair and electric cart assistance from curb to aircraft seat 8C at terminal 3.", 
             "Customer Service", "High", "Customer Request", "Customer Care", 0.96),
            ("Severe peanut allergy notification for upcoming flight", 
             "Passenger in seat 16A has an airborne peanut anaphylactic allergy. Please notify cabin crew to establish a buffer zone and announce it.", 
             "Customer Service", "High", "Customer Request", "Customer Care", 0.95),
            ("Special dietary vegan gluten-free meal confirmation", 
             "Requested special dietary meal VGML for international segment LAX-NRT 10 days ago. Need confirmation that meal is boarded.", 
             "Customer Service", "Low", "Customer Request", "Customer Care", 0.87),
            ("Formal complaint regarding unprofessional gate attendant behavior", 
             "Gate agent at gate D4 was dismissive and verbally aggressive when passengers asked why boarding was delayed by 90 minutes.", 
             "Customer Service", "Medium", "Customer Request", "Customer Care", 0.90),
            ("Guide dog service animal documentation pre-clearance", 
             "Submitted DOT service animal relief and behavior forms for my certified seeing-eye Labrador. Awaiting travel authorization clearance.", 
             "Customer Service", "Medium", "Customer Request", "Customer Care", 0.93),
            ("Unaccompanied minor service booking request for 11-year-old", 
             "Need to arrange unaccompanied minor escort service for my 11-year-old nephew traveling from Seattle to Minneapolis.", 
             "Customer Service", "Medium", "Customer Request", "Customer Care", 0.92),
            ("Missing frequent flyer tier upgrade status match", 
             "Applied for competitor airline status match to Gold Elite 3 weeks ago. Promotional period ends this week and haven't received status.", 
             "Customer Service", "Low", "Customer Request", "Customer Care", 0.85),
            ("Compliment for outstanding service by flight purser", 
             "I want to commend flight purser Elena on flight 402 for handling a medical distress situation with extreme calm and professionalism.", 
             "Customer Service", "Low", "Customer Request", "Customer Care", 0.88),
        ]

        now = datetime.utcnow()
        statuses = ["Open", "In Progress", "Resolved", "Closed"]
        status_weights = [0.40, 0.25, 0.20, 0.15]

        ticket_models = []
        for title, desc, cat, pri, root_c, team, conf in airline_tickets_data:
            stat = random.choices(statuses, weights=status_weights, k=1)[0]
            proc_time = round(random.uniform(35.0, 240.0), 2)
            created_dt = now - timedelta(hours=random.randint(1, 480))
            
            t = Ticket(
                ticket_id=str(uuid.uuid4()),
                title=title,
                description=desc,
                category=cat,
                priority=pri,
                root_cause=root_c,
                assigned_team=team,
                confidence_score=conf,
                status=stat,
                processing_time_ms=proc_time,
                created_at=created_dt,
                updated_at=created_dt
            )
            ticket_models.append(t)

        db.add_all(ticket_models)
        db.flush()
        print(f"[Seed] Created {len(ticket_models)} airline support tickets.")

        # Seed sample human-in-the-loop feedback entries
        feedback_entries = [
            Feedback(ticket_id=ticket_models[0].id, predicted_category="Technical Issue", actual_category="Booking", 
                     predicted_priority="Critical", actual_priority="High", comments="Corporate card decline is payment/booking, not core infra outage.", is_processed=False),
            Feedback(ticket_id=ticket_models[8].id, predicted_category="Customer Service", actual_category="Booking", 
                     predicted_priority="Low", actual_priority="High", comments="Passport name mismatch requires ticket reissuance before check-in.", is_processed=False),
            Feedback(ticket_id=ticket_models[11].id, predicted_category="Cancellation", actual_category="Cancellation", 
                     predicted_priority="Low", actual_priority="High", comments="Customer was at risk of automatic return leg voidance.", is_processed=False),
            Feedback(ticket_id=ticket_models[17].id, predicted_category="Booking", actual_category="Refund", 
                     predicted_priority="Medium", actual_priority="High", comments="Over 25 business days overdue refund requires urgent finance escalation.", is_processed=False),
            Feedback(ticket_id=ticket_models[27].id, predicted_category="Customer Service", actual_category="Baggage", 
                     predicted_priority="High", actual_priority="Critical", comments="Critical medical supplies inside delayed baggage.", is_processed=False),
            Feedback(ticket_id=ticket_models[32].id, predicted_category="Technical Issue", actual_category="Technical Issue", 
                     predicted_priority="Medium", actual_priority="Critical", comments="Corrupted digital boarding passes ground passengers at TSA checkpoint.", is_processed=False),
            Feedback(ticket_id=ticket_models[41].id, predicted_category="Customer Service", actual_category="Customer Service", 
                     predicted_priority="Low", actual_priority="High", comments="Severe airborne peanut anaphylaxis is high risk for cabin safety.", is_processed=False),
        ]
        db.add_all(feedback_entries)

        # Seed Default Users
        users = [
            User(name="Admin User", email="admin@smartdesk.com", role="Admin", 
                 password_hash="$2b$12$mYBpJZDFCG1xaRMmnT/oG.sPE6SCdJQOuXTpyDMmYYxRCR6Q5ICwe"), # "admin123"
            User(name="Support Agent", email="agent@smartdesk.com", role="Support Agent", 
                 password_hash="$2b$12$LXzOMSzqEyN8RsggLuBmDunILnsfGt97ym53GO9GTkF6hX94tQqo6"), # "agent123"
        ]
        db.add_all(users)

        # Seed Model Metrics History
        model_versions = [
            ModelMetric(model_name="SmartDesk Ensemble", accuracy=0.85, precision=0.84, recall=0.86, f1_score=0.85, version=1, created_at=now - timedelta(days=60)),
            ModelMetric(model_name="SmartDesk Ensemble", accuracy=0.88, precision=0.87, recall=0.89, f1_score=0.88, version=2, created_at=now - timedelta(days=45)),
            ModelMetric(model_name="SmartDesk Ensemble", accuracy=0.89, precision=0.88, recall=0.90, f1_score=0.89, version=3, created_at=now - timedelta(days=30)),
            ModelMetric(model_name="SmartDesk Ensemble", accuracy=0.91, precision=0.90, recall=0.92, f1_score=0.91, version=4, created_at=now - timedelta(days=15)),
            ModelMetric(model_name="SmartDesk Ensemble", accuracy=0.93, precision=0.92, recall=0.94, f1_score=0.93, version=5, created_at=now),
        ]
        db.add_all(model_versions)

        # Seed Activity Logs
        logs = [
            ActivityLog(action="DATABASE_INIT", entity_type="system", details="System initialized with airline operations dataset"),
            ActivityLog(action="MODEL_EVALUATION", entity_type="model", entity_id="v5", details="Evaluation completed with 93% accuracy on airline test split"),
            ActivityLog(action="SEEDED_DATA", entity_type="tickets", details="Loaded 50 realistic airline support tickets into routing database"),
        ]
        db.add_all(logs)

        db.commit()
        print("[Seed] Seeding completed successfully.")
    except Exception as e:
        db.rollback()
        print(f"[Seed] Error during seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database(force_reseed=True)
