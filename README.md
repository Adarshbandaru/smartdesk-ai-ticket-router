# SmartDesk — Enterprise AI Ticket Router 🚀

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.2-61DAFB.svg?style=flat&logo=React&logoColor=black)](https://reactjs.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg?style=flat&logo=docker&logoColor=white)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

SmartDesk is a production-grade, enterprise customer support ticket router and intelligence platform. Built with a **Linear/Vercel-inspired dark theme** on the frontend and an asynchronous **FastAPI + SQLAlchemy + Alembic** backend, SmartDesk automatically classifies, prioritizes, and routes airline customer support tickets with **Explainable AI (LIME)** in under **300ms**.

---

## 🌟 Key Architecture & Features

### 1. Modular Backend Architecture
- **Framework**: FastAPI with asynchronous endpoints and life-cycle events (`lifespan`).
- **ORM & Migrations**: SQLAlchemy 2.0 with declarative models and Alembic version control.
- **Persistent Storage**: SQLite with Docker named persistent volumes.
- **Request Latency & Error Middleware**: Custom `LoggingMiddleware` calculating per-request execution latency (`X-Process-Time-Ms`) and `ErrorHandlingMiddleware` producing unified JSON error structures.
- **Health Checks**: Standardized `GET /health` endpoint verifying runtime service and dependencies.

### 2. Multi-Model AI Inference Pipeline (< 300ms)
- **Category Classifier**: 6-class classification (Booking, Cancellation, Refund, Baggage, Technical Issue, Customer Service).
- **Priority Predictor**: TF-IDF + Logistic Regression calibrated probability distribution.
- **Root Cause Engine**: TF-IDF + XGBoost gradient boosted decision trees.
- **Deterministic Routing**: Auto-assigns department teams (Booking Operations, Finance Team, Baggage Support, Engineering Support, Customer Care, Escalation Team) and calculates SLAs.
- **Explainable AI (LIME)**: Highlights key positive and negative contributing words with exact start/end character offsets for visual attribution.

### 3. Human-in-the-Loop Feedback & Retraining Loop
- **Review Queue**: `GET /feedback` provides unreviewed model misclassifications.
- **Continuous Learning Pipeline**: `POST /retrain` merges reviewer corrections, retrains priority and root cause models, tracks version lineages (`v1.0` ➔ `v1.6`), logs metrics, and hot-reloads models in memory.

### 4. JWT Authentication & Role-Based Access Control
- **Security**: Cryptographically salted `bcrypt` password hashing.
- **Tokens**: Access tokens (`HS256`) and refresh tokens with rotation (`/api/auth/refresh`).
- **Pre-seeded Accounts**:
  - **Admin**: `admin@smartdesk.com` / `admin123`
  - **Agent**: `agent@smartdesk.com` / `agent123`

---

## 📁 Repository Structure

```
smartdesk-ai-ticket-router/
├── docker-compose.yml           # Multi-container orchestration & volumes
├── README.md                    # System documentation & setup guide
│
├── backend/
│   ├── app.py                  # FastAPI application entrypoint & middleware
│   ├── config.py               # Pydantic-Settings environment manager (.env)
│   ├── alembic.ini             # Alembic migration configuration
│   ├── requirements.txt        # Python dependency manifest
│   ├── Dockerfile              # Production Python 3.11 image
│   ├── database/
│   │   ├── session.py          # SQLAlchemy engine, SessionLocal & get_db
│   │   ├── models.py           # Ticket, Feedback, User, ModelMetric, ActivityLog
│   │   ├── seed.py             # 50 realistic airline operations support tickets
│   │   └── migrations/         # Alembic database migrations
│   ├── ml/
│   │   ├── category_model.py   # DistilBERT / 6-class category classifier
│   │   ├── priority_model.py   # TF-IDF + Logistic Regression
│   │   ├── rootcause_model.py  # TF-IDF + XGBoost
│   │   ├── routing_engine.py   # Department & SLA rule mapping
│   │   ├── lime_explainer.py   # LIME feature importance
│   │   ├── inference.py        # TicketInferencePipeline
│   │   └── retrain.py          # Automated model retraining pipeline
│   ├── routes/
│   │   ├── tickets.py          # Full Ticket CRUD APIs
│   │   ├── predict.py          # Inference & LIME explainability endpoints
│   │   ├── feedback.py         # Feedback queue & retraining trigger
│   │   ├── analytics.py        # Dynamic analytics & KPIs
│   │   └── auth.py             # Login, register, refresh, and profile
│   ├── schemas/                # Pydantic request/response models
│   ├── services/               # Business logic service layer
│   └── utils/                  # Logging and error middlewares
│
└── frontend/
    ├── Dockerfile              # Multi-stage build with Nginx
    ├── nginx.conf              # Reverse proxy configuration
    ├── package.json            # Node dependency manifest
    ├── src/
    │   ├── components/         # Linear-style Card, Sidebar, Badges
    │   ├── pages/              # Dashboard, Inbox, NewTicket, Analytics, Settings
    │   └── services/api.js     # Axios API service client
    └── index.html              # Inter typography & SPA root
```

---

## 🚀 Quickstart & Docker Deployment

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Engine 20.10+)
- [Docker Compose](https://docs.docker.com/compose/) (v2+)

### Run with Docker Compose

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Adarshbandaru/smartdesk-ai-ticket-router.git
   cd smartdesk-ai-ticket-router
   ```

2. **Start the containers**:
   ```bash
   docker compose up --build
   ```

3. **Access Services**:
   - **Frontend UI**: [http://localhost:5173](http://localhost:5173) (or `http://localhost:80`)
   - **Backend API & Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **ReDoc Interactive Docs**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
   - **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

4. **Stop the containers**:
   ```bash
   docker compose down
   ```
   *(To wipe database volumes, add `-v`)*

---

## 💻 Local Development Setup (Without Docker)

### Backend
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Run migrations and seed data
python -c "from database.session import engine, Base; import database.models; Base.metadata.create_all(bind=engine); from database.seed import seed_database; seed_database()"

# Start API Server
uvicorn app:app --reload --port 8000
```

### Frontend
```powershell
cd frontend
npm install
npm run dev
```

---

## 📡 API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Service health status |
| `POST` | `/login` | User login (returns JWT access & refresh token) |
| `POST` | `/register` | Register new user account |
| `GET` | `/me` | Current authenticated user profile |
| `POST` | `/api/predict/` | Real-time AI ticket routing & LIME word attribution |
| `POST` | `/explain` | Standalone LIME explainability analysis |
| `GET` | `/api/tickets/` | List tickets with pagination, search, filters & sorting |
| `POST` | `/api/tickets/` | Create a new support ticket |
| `GET` | `/api/tickets/{ticket_id}` | Fetch ticket details by UUID or ID |
| `PATCH` | `/api/tickets/{ticket_id}` | Partial update ticket status/priority |
| `DELETE` | `/api/tickets/{ticket_id}` | Delete ticket |
| `GET` | `/dashboard` | Executive KPI overview metrics |
| `GET` | `/analytics` | Recharts-ready distributions, volume & accuracy history |
| `POST` | `/feedback` | Submit reviewer corrections for misclassifications |
| `GET` | `/feedback` | Retrieve pending human review queue |
| `POST` | `/retrain` | Retrain models with feedback dataset |

---

## 🛡️ License
Distributed under the MIT License. Built with ❤️ for enterprise AI operations.
