#!/bin/bash
set -e

export PYTHONPATH=/app

# It's important to note that this is not a production-ready script.
# In a production environment, you would want to handle database migrations more carefully.
# For this demo, we are simply dropping and recreating the database on every start.
echo "Waiting for database to be ready..."
while ! pg_isready -h db -p 5432 -q -U postgres; do
  sleep 1
done

echo "Database is ready. Dropping and recreating public schema..."
export PGPASSWORD=postgres
psql -h db -U postgres -d postgres -c "DROP SCHEMA IF EXISTS public CASCADE;"
psql -h db -U postgres -d postgres -c "CREATE SCHEMA public;"

# Run database migrations
alembic upgrade head

# Run seeder
python -m src.seeder.demo_data

# Start the API
uvicorn src.main:app --host 0.0.0.0 --port 8000
