# Chiller Intelligence

Chiller Intelligence – backend skeleton for a multi-tenant chiller analytics platform.

## Getting Started

Build and start the stack (API + web UI):

```bash
docker-compose up --build
```

The API container now uses the PostgreSQL **psycopg** driver (v3). If you are running the API
outside Docker, make sure to install dependencies with `pip install -r api/requirements.txt` and
set `DATABASE_URL` to a psycopg connection string such as
`postgresql+psycopg://postgres:postgres@localhost:5432/postgres`.

The React frontend is available at http://localhost:3000 and communicates with the API using
the `VITE_API_BASE_URL` defined in `docker-compose.yml`.

Run database migrations inside the API container:

```bash
docker-compose exec api alembic upgrade head
```

### Running the API locally

```bash
cd api
uvicorn src.main:app --reload
```

### Running tests

Install dependencies and execute the FastAPI unit/integration suite:

```bash
cd api
pip install -r requirements.txt
pytest
```

### Running the frontend locally

```bash
cd web
npm install
VITE_API_BASE_URL=http://localhost:8000 npm run dev
```

The frontend handles registration/login plus CRUD flows for organization settings, buildings,
chiller units, data sources, and alert rules. Configure all platform entities through the UI
instead of CLI commands or configuration files.

## Health Check

After the stack is running, verify the API is healthy:

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{"status": "ok"}
```

## Authentication

- Register a tenant and admin: `POST /auth/register`
- Login to receive a JWT: `POST /auth/login`
- Inspect the authenticated user: `GET /auth/me`

Example login + authenticated call:

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}' | jq -r .access_token)

curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/buildings
```

## Available Endpoints

- `/auth` – registration, login, and current user info.
- `/organizations` – view and update the authenticated organization (admin-only for updates).
- `/buildings` – CRUD for buildings within the authenticated organization.
- `/chiller-units` – CRUD for chillers tied to the org's buildings.
- `/data-sources` – CRUD for data source configurations of chiller units.
- `/alert-rules` – CRUD for alert rules of chiller units.

All endpoints enforce multi-tenancy: authenticated users can access only the records belonging to their organization.
