# Chiller Intelligence

Chiller Intelligence – backend skeleton for a multi-tenant chiller analytics platform.

## Getting Started

Build and start the stack:

```bash
docker-compose up --build
```

Run database migrations inside the API container:

```bash
docker-compose exec api alembic upgrade head
```

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
