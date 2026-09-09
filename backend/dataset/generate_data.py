import pandas as pd
import random
import os

# Define categories, priorities, root causes
CATEGORIES = ["Booking", "Cancellation", "Refund", "Baggage", "Technical Issue", "Customer Service"]
PRIORITIES = ["Low", "Medium", "High", "Critical"]
ROOT_CAUSES = ["Payment Failure", "Flight Delay", "Login Issue", "Missing Baggage", "Refund Delay", "Seat Availability", "System Error", "Customer Request"]

def generate_synthetic_data(num_samples=1000):
    data = []
    
    templates = {
        "Booking": ["I need help booking a ticket to {dest}.", "Cannot complete my booking.", "Is there {rc} preventing my booking?", "Seat selection is not working."],
        "Cancellation": ["I want to cancel my flight to {dest}.", "Please cancel my ticket.", "Due to {rc}, I need a cancellation.", "How do I cancel?"],
        "Refund": ["Where is my refund for the canceled ticket?", "I have a {rc}.", "I was charged twice.", "Refund status check."],
        "Baggage": ["My bag is missing after flight to {dest}.", "I want to add extra baggage.", "Report a {rc}.", "Damaged luggage report."],
        "Technical Issue": ["I cannot log in, getting a {rc}.", "The website is down.", "App crashes on my phone.", "Error 500 when paying."],
        "Customer Service": ["I need to change my name on the ticket.", "General inquiry about flying with pets.", "Feedback about the flight to {dest}.", "Just a {rc}."]
    }
    
    destinations = ["NYC", "LON", "PAR", "TOK", "SYD"]
    
    for _ in range(num_samples):
        cat = random.choice(CATEGORIES)
        
        # Determine priority and root cause logically somewhat linked to category
        if cat == "Technical Issue":
            pri = random.choice(["High", "Critical"])
            rc = random.choice(["Login Issue", "System Error"])
        elif cat == "Refund":
            pri = random.choice(["Medium", "High"])
            rc = random.choice(["Payment Failure", "Refund Delay"])
        elif cat == "Baggage":
            pri = random.choice(["Medium", "High"])
            rc = "Missing Baggage"
        elif cat == "Booking" or cat == "Cancellation":
            pri = random.choice(["Low", "Medium", "High"])
            rc = random.choice(["Payment Failure", "Customer Request", "Seat Availability"])
        else:
            pri = random.choice(["Low", "Medium"])
            rc = "Customer Request"

        title = f"{cat} Request - {pri} Priority"
        
        desc_template = random.choice(templates[cat])
        dest = random.choice(destinations)
        desc = desc_template.format(dest=dest, rc=rc.lower()) + f" This is very important. Priority should be {pri}."
        
        data.append({
            "title": title,
            "description": desc,
            "category": cat,
            "priority": pri,
            "root_cause": rc
        })
        
    df = pd.DataFrame(data)
    os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)
    df.to_csv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "synthetic_tickets.csv"), index=False)
    print("Generated synthetic_tickets.csv")

if __name__ == "__main__":
    generate_synthetic_data(2000)
