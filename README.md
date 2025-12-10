# Chiller Intelligence

Chiller Intelligence – backend skeleton for a multi-tenant chiller analytics platform.

## 🚀 Quick Deploy (Production)

Deploy the complete application with pre-built Docker images. Choose your platform:

**🐧 Linux / macOS:**
```bash
curl -fsSL https://raw.githubusercontent.com/rezer-bleede/chiller-intelligence/main/docs/quick-deploy.sh | bash
```

**🪟 Windows PowerShell:**
```powershell
iwr -useb https://raw.githubusercontent.com/rezer-bleede/chiller-intelligence/main/docs/quick-deploy.ps1 | iex
```

**🪟 Windows Command Prompt:**
```cmd
powershell -Command "iwr -useb https://raw.githubusercontent.com/rezer-bleede/chiller-intelligence/main/docs/quick-deploy.bat -OutFile quick-deploy.bat; .\quick-deploy.bat"
```

**Or visit our [Quick Deploy Page](https://rezer-bleede.github.io/chiller-intelligence/) for detailed instructions.**

This will download and deploy the entire stack using published Docker images from DockerHub. No need to clone the repository!

## 🛠️ Development Setup

For local development, build and start the stack (API + web UI):

```bash
docker-compose up --build
```

The stack now provisions a dedicated **history-db** Postgres instance for long-term chiller telemetry. The API keeps metadata in
the primary `db` service while storing time-series data in `history-db` via the `HISTORICAL_DATABASE_URL` environment variable.

The API container now uses the PostgreSQL **psycopg** driver (v3). If you are running the API
outside Docker, make sure to install dependencies with `pip install -r api/requirements.txt` and
set `DATABASE_URL` to a psycopg connection string such as
`postgresql+psycopg://postgres:postgres@localhost:5432/postgres`.

The React frontend is available at http://localhost:3000 and communicates with the API using
the `VITE_API_BASE_URL` defined in `docker-compose.yml`. If the variable is absent during local
development, the web client now falls back to `http://localhost:8000`—but you should still set
`VITE_API_BASE_URL` to match the FastAPI server you are running to avoid browser requests being
sent to the Vite dev server (which results in 405 errors for routes such as `/auth/login`).
Configure the historical database connection from the **Data Sources** page if you need to point the telemetry store at an
external database; the UI also surfaces whether the API is using environment defaults or a saved override.

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

New pages allow operators to manage baseline values (with CSV/XLSX import), review alert history
with severity filters, and configure external database sources alongside MQTT/HTTP/file upload
pipelines.

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
- Layouts are persisted per user and organization via the `/dashboard-layouts/{page_key}` API, stored in the database, and survive restarts.
- The left navigation now supports a collapsible mode with state persisted in `localStorage` for a decluttered experience.
- Dashboard cards and charts now enforce responsive minimum heights and overflow handling (via react-grid-layout + Recharts `ResponsiveContainer`), preventing overlap on smaller screens such as a 13" laptop.
- A new date range filter sits above the dashboard sections so you can scope KPI cards and charts to a specific window without
  leaving the page.

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
- `/baseline-values` – CRUD and CSV/XLSX import for baseline metrics tied to buildings/chillers.
- `/alert-rules` – CRUD for alert rules of chiller units.
- `/alerts` – List alert history with severity, time, and chiller filters plus summary counts.
- `/dashboard-layouts/{page_key}` – get or save dashboard layouts per user and organization.
- `/telemetry/ingest` – ingest chiller telemetry for the authenticated organization or trusted generator.

All endpoints enforce multi-tenancy: authenticated users can access only the records belonging to their organization.

## Demo Mode

Running `docker-compose up --build` now bootstraps a complete demo tenant and connects it to a synthetic data generator.

The demo seeder also backfills **two years** of synthetic historical telemetry so analytics dashboards render rich trends even
before live data starts streaming.

### Demo Admin Login

- Email: `demo@demo.com`
- Password: `demo123`

### Live Data Generator

- A `data-generator` container streams synthetic telemetry every 5 seconds.
- Telemetry is sent to `/telemetry/ingest` using the internal service token configured via `GENERATOR_SERVICE_TOKEN`.
- The generator automatically discovers demo chillers via `/chiller-units` and rotates through them in a round-robin loop.

Use these defaults to explore the UI with buildings, chillers, alert rules, and live metrics immediately after the stack starts.

## External data sources

Create or edit data sources with the **External DB** type to connect the platform to an existing
database. Provide connection details in the Data Sources form; the backend accepts `EXTERNAL_DB`
as a `DataSourceType`, allowing operators to stream readings without MQTT/HTTP brokers.

## Baseline values

The **Baselines** page lets you capture expected performance targets per building or chiller. Add
records manually or use the **Import** workflow to upload CSV or XLSX files that include
`name`, `metric_key`, `value`, optional `unit`/`notes`, and optional `building_id`/`chiller_unit_id`
columns.

## Alerts and notifications

- The **Alerts** page shows a summary of counts by severity and a filtered feed of individual
  alerts with timestamps and linked chillers/buildings.
- Alert rules now support recipient emails. Configure SMTP credentials via the environment
  variables `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_USE_TLS`, and
  `EMAIL_FROM`. When telemetry triggers a rule, notifications are persisted and delivered to
  the configured recipients.
