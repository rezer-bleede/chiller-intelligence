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
the `VITE_API_BASE_URL` defined in `docker-compose.yml`. If the variable is absent during local
development, the web client now falls back to `http://localhost:8000`—but you should still set
`VITE_API_BASE_URL` to match the FastAPI server you are running to avoid browser requests being
sent to the Vite dev server (which results in 405 errors for routes such as `/auth/login`).

Run database migrations inside the API container:

```bash
docker-compose exec api alembic upgrade head
```

### Historical analytics

The API exposes `/analytics/*` endpoints that aggregate persisted telemetry. Requests accept date ranges, building/chiller filters,
and granularities (minute, hour, day, month) to return ready-to-plot series for cooling load, power, efficiency, and CO₂ savings.
Example usage:

```bash
TOKEN=... # JWT for your organization
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8000/analytics/plant-overview?granularity=day"
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8000/analytics/consumption-efficiency?start=2024-01-01"
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

The UI now uses TailwindCSS with dark-mode support, Recharts-powered dashboards, and responsive
layouts. Key dashboard visuals include multi-axis efficiency charts, grouped consumption bars,
sparkline KPI cards, and per-chiller circuit analytics. You can toggle dark mode from the top
navigation in the app shell.

### Dashboard data sources

- All KPI cards, charts, and telemetry panels read directly from the FastAPI analytics endpoints
  (`/analytics/plant-overview`, `/analytics/consumption-efficiency`, `/analytics/equipment-metrics`,
  and `/analytics/chiller-trends`).
- Summary cards combine plant overview totals with live counts for buildings, chillers, and alert
  rules.
- Charts no longer use placeholder arrays: cooling/power charts are built from the consumption
  series, efficiency and COP trends plot the analytics response, and chiller health/telemetry cards
  render the latest `chiller-trends` samples.
- If an endpoint returns no data yet, widgets now render a concise "No telemetry available" helper
  instead of stale placeholders.

### Dashboard layout editing

- The dashboard is organized into **Overview**, **Equipment & Health**, and **Telemetry & Trends** sections.
- Widgets inside each section are draggable and resizable; click **Edit layout** to rearrange, save, or reset to defaults.
- Layouts are persisted per user and organization via the `/dashboard-layouts/{page_key}` API and survive page reloads.
- The left navigation now supports a collapsible mode with state persisted in `localStorage` for a decluttered experience.
- Dashboard cards and charts now enforce responsive minimum heights and overflow handling (via react-grid-layout + Recharts `ResponsiveContainer`), preventing overlap on smaller screens such as a 13" laptop.

### Frontend tests

```bash
cd web
npm test
```

Vitest is configured with jsdom; ResizeObserver is mocked for chart components. Tests cover the
modern dashboard surface and core KPI widgets.

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
- `/dashboard-layouts/{page_key}` – get or save dashboard layouts per user and organization.
- `/telemetry/ingest` – ingest chiller telemetry for the authenticated organization or trusted generator.

All endpoints enforce multi-tenancy: authenticated users can access only the records belonging to their organization.

## Demo Mode

Running `docker-compose up --build` now bootstraps a complete demo tenant and connects it to a synthetic data generator.

### Demo Admin Login

- Email: `demo@demo.com`
- Password: `demo123`

### Live Data Generator

- A `data-generator` container streams synthetic telemetry every 5 seconds.
- Telemetry is sent to `/telemetry/ingest` using the internal service token configured via `GENERATOR_SERVICE_TOKEN`.
- The generator automatically discovers demo chillers via `/chiller-units` and rotates through them in a round-robin loop.

Use these defaults to explore the UI with buildings, chillers, alert rules, and live metrics immediately after the stack starts.
