#!/bin/bash

# Script to fetch Ociswap pools with pagination
# Fetches pools from cursor 0 to 1000 in increments of 100
# Extracts component addresses into an array

BASE_URL="https://api.ociswap.com/pools"
LIMIT=100
MAX_CURSOR=2000

echo "Fetching Ociswap pools..."

# Initialize array to store component addresses
COMPONENT_ADDRESSES=()

for cursor in $(seq 0 $LIMIT $((MAX_CURSOR - LIMIT))); do
    echo "Fetching pools with cursor=$cursor"

    # Fetch data and save to temporary file
    TEMP_FILE=$(mktemp)
    curl -s "${BASE_URL}?cursor=${cursor}&limit=${LIMIT}&order=rank&direction=asc" \
        -H "Accept: application/json" \
        -o "$TEMP_FILE"

    if [ $? -eq 0 ]; then
        echo "✓ Successfully fetched data for cursor $cursor"

        # Extract component addresses using jq and add to array
        while IFS= read -r address; do
            COMPONENT_ADDRESSES+=("$address")
        done < <(jq -r '.data[]?.address // empty' "$TEMP_FILE")

        # Save the response file
        cp "$TEMP_FILE" "ociswap-pools-${cursor}.json"

    else
        echo "✗ Failed to fetch data for cursor $cursor"
        rm -f "$TEMP_FILE"
        exit 1
    fi

    # Clean up temporary file
    rm -f "$TEMP_FILE"

    # Small delay to be respectful to the API
    sleep 1
done

echo "Completed fetching all pools from cursor 0 to $((MAX_CURSOR - LIMIT))"
echo "Total component addresses found: ${#COMPONENT_ADDRESSES[@]}"

# Save component addresses to a file
printf '%s\n' "${COMPONENT_ADDRESSES[@]}" > ociswap-component-addresses.txt
echo "Component addresses saved to ociswap-component-addresses.txt"

# Display first few addresses as sample
echo "Sample addresses:"
printf '%s\n' "${COMPONENT_ADDRESSES[@]:0:5}"