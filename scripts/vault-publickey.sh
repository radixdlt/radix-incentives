#!/bin/bash

export NETWORK_ID=1

# Read token from vault secrets file
VAULT_TOKEN=$(cat "$(dirname "$0")/../vault/secrets/token")

# gets public key from vault in base64 format
PUBLIC_KEY_BASE64=$(curl -s --header "X-Vault-Token: $VAULT_TOKEN" \
  http://localhost:8200/v1/transit/keys/xrd-distribution | jq -r '.data.keys["1"].public_key')

echo "Public key: $PUBLIC_KEY_BASE64"

# decode public key from base64 to hex
PUBLIC_KEY=$(echo $PUBLIC_KEY_BASE64 | base64 -d | xxd -p -c 256)
echo "Public key in hex: $PUBLIC_KEY"

