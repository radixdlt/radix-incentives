#!/bin/bash

# Spinner function
spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='|/-\'
    echo -n "Working... "
    while kill -0 $pid 2>/dev/null; do
        local temp=${spinstr#?}
        printf "%c" "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b"
    done
    printf " \b"
}

echo "Dumping database to dump.sql"

# Run pg_dump in background
pg_dump "$DATABASE_URL" \
  --exclude-table=account_balances \
  > dump.sql &

# Get the process ID and show spinner
PID=$!
spinner $PID

# Wait for the background process to complete
wait $PID

echo "Database dumped"