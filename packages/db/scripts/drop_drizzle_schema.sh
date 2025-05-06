#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Check if psql is installed
if ! command -v psql &> /dev/null
then
    echo "psql could not be found. Please install PostgreSQL client tools."
    exit 1
fi

# Load environment variables - assuming a .env file at the root
ENV_FILE=".env"
if [ -f "$ENV_FILE" ]; then
  # Source the .env file carefully
  set -o allexport
  source "$ENV_FILE"
  set +o allexport
else
  echo "Warning: .env file not found at '$ENV_FILE'. Ensure DATABASE_URL is set in your environment."
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL environment variable is not set."
    echo "Please ensure it is defined in '$ENV_FILE' or exported in your shell."
    exit 1
fi

echo "Connecting to database specified by DATABASE_URL..."
echo "This script will attempt to drop the 'drizzle' schema."

# Ask for confirmation
read -p "Are you absolutely sure you want to drop the 'drizzle' schema and all its contents? This is irreversible. (yes/N) " -r
echo # Move to a new line

# Check the confirmation carefully - only proceed if user types 'yes'
if [[ "$REPLY" != "yes" ]]
then
    echo "Operation cancelled. The 'drizzle' schema was not dropped."
    exit 1
fi

# Execute the DROP SCHEMA command
echo "Executing DROP SCHEMA drizzle CASCADE..."
psql "$DATABASE_URL" -c "DROP SCHEMA drizzle CASCADE;"

echo "The 'drizzle' schema has been dropped."

exit 0 