# Chiller Intelligence

Chiller Intelligence – backend skeleton for a multi-tenant chiller analytics platform.

## Getting Started

Build and start the stack:

```bash
docker-compose up --build
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

## Notes

- Backend implemented with FastAPI, SQLAlchemy, and Alembic.
- PostgreSQL is configured via Docker Compose.
- No business endpoints or models are included in this skeleton.
