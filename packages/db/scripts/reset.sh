#!/bin/bash

echo "Executing DROP SCHEMA public CASCADE..."
psql "$DATABASE_URL" -c "DROP SCHEMA public CASCADE;"

echo "Executing DROP SCHEMA drizzle CASCADE..."
psql "$DATABASE_URL" -c "DROP SCHEMA drizzle CASCADE;"

echo "Executing CREATE SCHEMA public..."
psql "$DATABASE_URL" -c "CREATE SCHEMA public;"

echo "Database reset complete."
