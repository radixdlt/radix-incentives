# Radix Incentives

### Component Descriptions

| Component | Type | Description |
|-----------|------|-------------|
| **admin** | App | Next.js admin dashboard for managing seasons, weeks, activities, and viewing analytics |
| **incentives** | App | Next.js user-facing dashboard where users connect wallets, view points, leaderboards, and activities |
| **workers** | App | Background job processors using Bull MQ for calculating points, snapshots, and processing events |
| **streamer** | App | Transaction stream processor that monitors Radix Ledger for relevant DeFi events |
| **api** | Package | Shared API layer containing tRPC routers and Effect services for all applications |
| **data** | Package | Shared type definitions, constants, and Zod validation schemas |
| **db** | Package | Drizzle ORM database schemas and migrations for incentives and consultation systems |

## Prerequisites

- Install or update nvm:
  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
  source ~/.nvm/nvm.sh
  ```
- Use nvm to install and use Node.js v20:
  ```bash
  nvm install 20
  nvm use 20
  ```
## Getting Started

Follow these steps to get the project up and running locally, run migrations, and troubleshoot common issues.

---

### 1. Prerequisites

- **Node.js**: version **>= 20.0.0**  
- **pnpm**: package manager  
- **Docker & Docker-Compose**  

---

### 2. Initial Setup

1. **Verify Node.js version**  
   ```bash
   node --version
   # Should output v20.x.x or higher
   ```

2. **Install dependencies**  
   ```bash
   pnpm install
   ```

---

### 3. Start Services

Bring up the Postgres container (and any other services defined in `docker-compose.yml`):

```bash
docker-compose up -d
```

---

### 4. Database Migrations

Change into the `db` package and run Drizzle migrations:

```bash
cd packages/db
pnpm run db:migrate
```

> **Troubleshooting**  
> If you see an error about missing `DATABASE_URL`, you need to export it first.

---

### 5. Setting the `DATABASE_URL`

Drizzle needs the `DATABASE_URL` environment variable to connect to Postgres. Based on your `docker-compose.yml`, it can look like this:

```bash
export DATABASE_URL="postgres://postgres:password@localhost:5432/radix-incentives"
```

Then re-run the migration:

```bash
pnpm run db:migrate
```


### 6. Seeding the Database

If you are starting with a fresh database, you need to seed it with initial data. Change into the `db` package directory and run the following command:

```
pnpm db:seed
```


### 7. Setting Up Local Redis and Gateway API

Once the gateway API service is port-forwarded, running `docker-compose` will also start a local Redis instance. You need to export the following environment variables to ensure your application can connect to the gateway and Redis:

```
export GATEWAY_URL="http://localhost:8080"
export REDIS_HOST="localhost"
export REDIS_PORT=6379
export REDIS_PASSWORD=password
```

### 8. Setting Up HashiCorp Vault (for Transaction Signing)

Vault is used for secure Ed25519 key management and transaction signing via the Transit secrets engine.

#### Starting Vault Services

```bash
# Start Vault, vault-init, and vault-agent
docker compose up vault vault-init vault-agent -d --wait
```

This starts:
- **vault**: HashiCorp Vault server in dev mode (port 8200)
- **vault-init**: Initializes Transit engine with Ed25519 key (`xrd-distribution`)
- **vault-agent**: API proxy with token caching (port 8100)

#### Vault Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VAULT_TOKEN` | Static Vault token (for dev/testing) | - |
| `VAULT_TOKEN_FILE` | Path to file containing Vault token (preferred for production) | - |
| `VAULT_BASE_URL` | Vault API base URL | `http://localhost:8200/v1` |
| `VAULT_KEY_NAME` | Transit key name for signing | `xrd-distribution` |

#### Usage Options

**Option 1: Token file (recommended for production parity)**
```bash
export VAULT_TOKEN_FILE="$(pwd)/vault/secrets/token"
```

**Option 2: Direct token (simpler for dev)**
```bash
export VAULT_TOKEN=root-token
```

The application checks `VAULT_TOKEN_FILE` first; if not set, falls back to `VAULT_TOKEN`.

### 9. Triggering Workers

To trigger the snapshot worker manually, you can use the following command. This is useful for testing purposes or when you need to process a snapshot job immediately.

1. Ensure your environment variables are set correctly, especially `DATABASE_URL`, `GATEWAY_URL`, `REDIS_HOST`, `REDIS_PORT`, and `REDIS_PASSWORD`.

2. Use the following command to add a job to the snapshot queue. Below code needs to be added to apps/workers/src/index.ts

   ```bash
    import { snapshotQueue } from "./snapshot/queue";
    import { getHourStartInUTC } from "./helpers/getHourStartInUTC";

    snapshotQueue.queue.add("snapshot", {
      addresses: ['address1', 'address2'], // Replace with actual addresses
      timestamp: getHourStartInUTC().toISOString(),
    });
   ```

> **Note**: Replace `'address1', 'address2'` with the actual addresses you want to process in the snapshot job.

To run the workers, use the following command:
`pnpm dev:workers`


