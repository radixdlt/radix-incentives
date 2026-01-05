#!/bin/sh
set -e

SECRETS_DIR="/vault/secrets"
INIT_FILE="$SECRETS_DIR/init.json"
TOKEN_FILE="$SECRETS_DIR/token"

# Wait for vault to be ready (exit code 0=unsealed, 2=sealed, other=error)
echo 'Waiting for Vault to be ready...'
until vault status >/dev/null 2>&1; ret=$?; [ "$ret" = "0" ] || [ "$ret" = "2" ]; do
  sleep 1
done

# Check if vault is already initialized
if ! vault status 2>/dev/null | grep -q 'Initialized.*true'; then
  echo 'Initializing Vault...'
  vault operator init -key-shares=1 -key-threshold=1 -format=json > "$INIT_FILE.tmp"
  mv "$INIT_FILE.tmp" "$INIT_FILE"
  echo 'Vault initialized. Keys saved to init.json'
elif [ ! -s "$INIT_FILE" ]; then
  echo "ERROR: Vault is initialized but $INIT_FILE is missing or empty!"
  echo "Cannot unseal without init keys. Manual intervention required."
  exit 1
fi

# Check if vault is sealed
if vault status 2>/dev/null | grep -q 'Sealed.*true'; then
  echo 'Unsealing Vault...'
  # Extract unseal key using awk (busybox compatible)
  UNSEAL_KEY=$(awk -F'"' '/"unseal_keys_b64"/{getline; print $2}' "$INIT_FILE")
  vault operator unseal "$UNSEAL_KEY"
  echo 'Vault unsealed'
fi

# Extract root token using awk (busybox compatible)
ROOT_TOKEN=$(awk -F'"' '/"root_token"/{print $4}' "$INIT_FILE")
echo "$ROOT_TOKEN" > "$TOKEN_FILE"
chmod 644 "$TOKEN_FILE"
export VAULT_TOKEN="$ROOT_TOKEN"

# Enable transit and create key
vault secrets enable transit 2>/dev/null || true
vault write -f transit/keys/xrd-distribution type=ed25519 2>/dev/null || true

echo 'Vault ready with ED25519 keys'
echo "Root token saved to $TOKEN_FILE"
