# SmartDesk - AI Ticket Router 🚀

SmartDesk is a full-stack, production-ready AI-powered Helpdesk Ticket Routing platform. It leverages NLP and Machine Learning to automatically classify, prioritize, and route customer support tickets with explainable AI (LIME), ensuring response times under 300ms.

## Architecture & Tech Stack

**Frontend:** React, Vite, Tailwind CSS, React Router, Recharts, Framer Motion
**Backend:** FastAPI, Python 3.11, SQLAlchemy, SQLite, Pydantic, Uvicorn
**AI/ML:** Scikit-learn, XGBoost, LIME, TF-IDF (Mock DistilBERT zero-shot equivalent)
**DevOps:** Docker, Docker Compose

## Features
- **Auto-Triage:** Predicts Category, Priority, and Root Cause.
- **Explainable AI:** Uses LIME to highlight keywords driving the predictions.
- **Dashboard Analytics:** Visualizes real-time metrics, ticket distribution, and model accuracy.
- **Feedback Loop:** Agents can correct predictions which queues them for model retraining.
- **Micro-Latency:** Highly optimized for inference under 300ms.

## Project Structure
```
smartdesk-ai-ticket-router/
│
├── backend/
│   ├── database/       # SQLite models & setup
│   ├── dataset/        # Synthetic data generator
│   ├── ml/             # ML pipeline, models, and LIME explainer
│   ├── routes/         # FastAPI endpoints
│   ├── schemas/        # Pydantic schemas
│   ├── main.py         # App entrypoint
│   └── initialize.py   # Bootstraps data and trains models if empty
│
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Dashboard, Inbox, NewTicket, etc.
│   │   └── services/   # Axios API integrations
│   └── tailwind.config.js
│
├── docker-compose.yml
└── README.md
```

## Running the Application (Docker)

1. Ensure Docker and Docker Compose are installed.
2. In the root directory, run:
   ```bash
   docker-compose up --build
   ```
3. The first time the backend starts, it will automatically generate 1000 synthetic tickets and train the ML models.
4. Access the applications:
   - **Frontend UI:** `http://localhost:5173`
   - **Backend API Docs:** `http://localhost:8000/docs`

## API Endpoints
- `POST /api/predict/`: Returns AI classification and LIME explanation.
- `GET /api/tickets/`: Fetch paginated tickets.
- `POST /api/tickets/`: Create a new ticket manually.
- `GET /api/analytics/dashboard`: Fetches KPI metrics.

## Future Improvements
- Replace TF-IDF + LR with a quantized HuggingFace DistilBERT model for even higher accuracy while maintaining <300ms latency.
- Move SQLite to PostgreSQL.
- Add Redis for caching analytics queries.
