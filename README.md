# StockFlow — Multi-Tenant Inventory Management MVP

StockFlow is a lightweight, multi-tenant SaaS inventory management application. Each organization manages its own product catalogue and stock quantities, with a dashboard for inventory summaries and low-stock alerts.

## Live application

- **Frontend:** https://stockflow-frontend-d6f3.onrender.com
- **Backend API:** https://stockflow-mvp-ucpg.onrender.com
- **API health check:** https://stockflow-mvp-ucpg.onrender.com/health
- **Repository:** https://github.com/Ashish61111/stockflow-mvp

## Features

- Organization and administrator signup, plus email/password login.
- JWT-based authentication.
- Organization-scoped product data (tenant isolation).
- Product creation, listing, editing, deletion and search by product name or SKU.
- Product fields include name, SKU, description, quantity, cost price, selling price and an optional low-stock threshold.
- Organization-level default low-stock threshold.
- Dashboard summary for product count, total units and low-stock items.
- PostgreSQL persistence with Alembic schema migrations.

## Technology stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, React Router, Axios, Lucide React |
| Backend | Python, FastAPI, Pydantic Settings |
| Database | PostgreSQL, SQLAlchemy, Psycopg 3 |
| Migrations | Alembic |
| Authentication | JWT (PyJWT), password hashing with pwdlib/Argon2 |
| Hosting | Render (frontend and API), Neon (PostgreSQL) |

## Repository layout

```text
stockflow-mvp/
├── backend/
│   ├── app/
│   │   ├── core/          # Configuration and shared backend utilities
│   │   ├── models/        # SQLAlchemy models
│   │   ├── routers/       # Authentication, products, dashboard, settings
│   │   └── schemas/       # Pydantic request/response schemas
│   ├── migrations/        # Alembic migration environment and revisions
│   ├── alembic.ini
│   └── requirements.txt
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   └── services/
    ├── package.json
    └── vite.config.js
```

## Run locally

### 1. Backend

From the repository root, create and activate a virtual environment, then install the backend dependencies:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # macOS/Linux
pip install -r requirements.txt
```

Create `backend/.env` with the following settings. Use your own local PostgreSQL database and a unique development secret:

```env
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@localhost:5432/stockflow_db
JWT_SECRET_KEY=replace-with-a-long-random-development-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
DEBUG=true
DEFAULT_LOW_STOCK_THRESHOLD=5
FRONTEND_URL=http://localhost:5173
```

Apply migrations and start the API from the `backend` directory:

```bash
python -m alembic upgrade head
uvicorn app.main:app --reload
```

The API is available at `http://127.0.0.1:8000`. FastAPI's interactive API documentation is available at `http://127.0.0.1:8000/docs`.

### 2. Frontend

Open a second terminal and run:

```bash
cd frontend
npm ci
```

Optionally create `frontend/.env` to point the frontend to a non-default API URL:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Start the Vite development server:

```bash
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`).

## Deployment configuration

The deployed application uses separate Render services:

- **API Web Service:** repository root directory `backend`; install dependencies and run Alembic migrations during build; start with `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- **Frontend Static Site:** repository root directory `frontend`; build with `npm ci && npm run build`; publish directory `dist`.
- **Frontend environment:** `VITE_API_BASE_URL` points to the deployed API origin.
- **Backend environment:** `DATABASE_URL` uses the Neon pooled connection; `DIRECT_DATABASE_URL` is used for Alembic migrations; `JWT_SECRET_KEY` must be a securely generated secret; `FRONTEND_URL` must match the deployed frontend origin; `DEBUG=false`; `DEFAULT_LOW_STOCK_THRESHOLD=5`.
- **SPA routing:** the Static Site uses a rewrite from `/*` to `/index.html` so client-side routes work on direct navigation and refresh.

## Security notes

- Do not commit `.env` files, database connection strings, passwords or JWT secrets.
- Configure production secrets in the hosting provider's environment-variable settings.
- Keep the frontend origin in `FRONTEND_URL` aligned with the deployed frontend domain for CORS.

## MVP scope

This release focuses on organization-scoped authentication, product CRUD, stock quantities, low-stock thresholds and a basic inventory dashboard. Features such as password reset/email recovery, multi-warehouse inventory, purchase orders, supplier management, billing and advanced reporting are outside this MVP scope.
