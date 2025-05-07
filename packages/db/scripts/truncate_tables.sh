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
# Adjust the path if your .env file is located elsewhere
ENV_FILE=".env"
if [ -f "$ENV_FILE" ]; then
  # Source the .env file carefully to handle various value types
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

# Drop existing enum types - necessary if switching from enums to varchars
echo "Dropping potentially conflicting enum types..."
psql "$DATABASE_URL" -c "
  DROP TYPE IF EXISTS public.trigger_status CASCADE;
  DROP TYPE IF EXISTS public.log_status CASCADE;
  DROP TYPE IF EXISTS public.transaction_status CASCADE;
  DROP TYPE IF EXISTS public.transaction_network_status CASCADE;
"
echo "Enum types dropped (if they existed)."

# Get all table names from the public schema
# Exclude drizzle migration table
TABLES=$(psql "$DATABASE_URL" -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name != '__drizzle_migrations';")

if [ -z "$TABLES" ]; then
  echo "No user tables found in the public schema (excluding __drizzle_migrations) or failed to connect."
  exit 0 # Exit gracefully if no tables found
fi

echo "Found tables in 'public' schema (excluding __drizzle_migrations):"
echo "$TABLES" | sed 's/^/  - /' # Indent list for clarity

echo "Generating TRUNCATE commands..."

# Prepare the TRUNCATE commands
COMMANDS=""
for TBL in $TABLES; do
  # Trim potential whitespace
  TBL=$(echo "$TBL" | xargs)
  if [ -n "$TBL" ]; then
    COMMANDS+="TRUNCATE TABLE "public"."$TBL" RESTART IDENTITY CASCADE; "
    echo "  - Added TRUNCATE for table: public.$TBL"
  fi
done

if [ -z "$COMMANDS" ]; then
  echo "No TRUNCATE commands generated."
  exit 0
fi

# Ask for confirmation
read -p "Are you sure you want to truncate all listed tables in the public schema? This cannot be undone. (y/N) " -n 1 -r
echo # Move to a new line

if [[ ! "$REPLY" =~ ^[Yy]$ ]]
then
    echo "Operation cancelled."
    exit 1
fi

# Execute the TRUNCATE commands
echo "Executing TRUNCATE commands..."
psql "$DATABASE_URL" -c "$COMMANDS"

echo "All listed tables in the public schema have been truncated."

exit 0 