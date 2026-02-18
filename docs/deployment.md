# Deployment Guide

This guide covers local development setup and production deployment of the Radix Incentives stack. See [architecture.md](./architecture.md) for the service diagram and data flow overview.

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | >= 22 | Runtime for all services |
| pnpm | >= 10 | Package manager (do **not** use npm or yarn) |
| Docker & Docker Compose | Latest | Local PostgreSQL, Redis, Vault, Jaeger |
| kubectl | >= 1.28 | Kubernetes cluster management (production) |
| Helm | >= 3 | Chart deployment (production) |
| Helmfile | >= 0.160 | Multi-chart orchestration (production) |

### External Services

| Service | Version | Notes |
|---------|---------|-------|
| PostgreSQL | 17+ | Primary datastore for events, points, seasons |
| Redis | 7+ | BullMQ job queue backend (used by Workers) |
| Radix Gateway API | Babylon | Transaction stream and balance queries (`https://mainnet-gateway.radixdlt.com`) |
| HashiCorp Vault | Latest | Transaction signing for reward distribution |

---

## Architecture Overview

The stack consists of four services:

| Service | Default Port | Exposure | Description |
|---------|-------------|----------|-------------|
| **Incentives** | 3000 | **Public** | Next.js user-facing dashboard (wallet connect, points, leaderboards) |
| **Admin** | 3000 | **Private** (network-protected only) | Next.js admin dashboard (seasons, weeks, activities, analytics) |
| **Workers** | 3003 | **Internal** (no ingress) | Hono HTTP server + BullMQ job processors (points, snapshots, events) |
| **Streamer** | 3004 | **Internal** (no ingress) | Hono HTTP server that tails the Radix transaction stream |

> **Network topology:** Only **Incentives** requires a public-facing ingress. **Workers** and **Streamer** are cluster-internal services (ClusterIP, no ingress) — Workers is called over HTTP by Incentives, Admin, and Streamer; Streamer is called by Admin for stream state control. All Kubernetes services use `type: ClusterIP`.
>
> **⚠ Admin has no application-level authentication** — there is no login page, auth middleware, or session gating. Anyone with network access to the Admin ingress has full administrative access (manage seasons, trigger calculations, view all data). You **must** protect it via an OAuth2 proxy (e.g. oauth2-proxy), VPN, or IP allowlist at the ingress/network layer. This is not optional.

**Data flow:** Streamer &rarr; PostgreSQL + Workers &rarr; Redis queues &rarr; Workers process jobs &rarr; PostgreSQL &rarr; Incentives/Admin read via tRPC.

Workers also exposes a metrics endpoint on port **9210** (Prometheus) and an embedded Bull Board UI at `/ui`.

---

## Environment Variables

### Incentives App

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | &mdash; | PostgreSQL connection string |
| `PORT` | No | `3000` | HTTP server port |
| `WORKERS_API_BASE_URL` | Yes | &mdash; | Workers service URL (e.g. `http://localhost:3003`) |
| `APP_URL` | No | `http://localhost:3000` | Public URL of this app (used for ROLA validation) |
| `DAPP_DEFINITION_ADDRESS` | Yes | &mdash; | Radix dApp definition address for ROLA authentication |
| `NEXT_PUBLIC_DAPP_DEFINITION_ADDRESS` | Yes | &mdash; | Client-side dApp definition address (build-time) |
| `NEXT_PUBLIC_PREVIEW_BLOCK_ENABLED` | No | &mdash; | ISO timestamp to block preview access (unset = disabled) |
| `NEXT_PUBLIC_LIMIT_ACCESS_ENABLED` | No | `false` | Enable access limitation feature |
| `RADIX_CHARTS_AUTHORIZATION_TOKEN` | Yes | &mdash; | API token for Radix Charts integration |
| `MAX_USER_PER_IP` | No | `4` | Rate limit: max connected users per IP |
| `SESSION_TTL` | No | `15 days` | User session time-to-live |

### Admin Dashboard

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | &mdash; | PostgreSQL connection string |
| `PORT` | No | `3000` | HTTP server port |
| `WORKERS_API_BASE_URL` | Yes | &mdash; | Workers service URL (e.g. `http://localhost:3003`) |
| `STREAMER_API_BASE_URL` | No | &mdash; | Streamer service URL (e.g. `http://localhost:3004`) |
| `PUBLIC_INCENTIVES_API_URL` | No | &mdash; | Public Incentives app URL (for links) |
| `PUBLIC_LOG_LEVEL` | No | &mdash; | Client-side log level (`debug`, `info`, etc.) |

### Workers

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | &mdash; | PostgreSQL connection string |
| `PORT` | No | `3003` | HTTP server port |
| `METRICS_PORT` | No | `9210` | Prometheus metrics port |
| `GATEWAY_URL` | No | `https://mainnet-gateway.radixdlt.com` | Radix Gateway API endpoint |
| `GATEWAY_BASIC_AUTH` | No | &mdash; | Basic auth header for Gateway API (if behind auth proxy) |
| `GATEWAY_RETRY_ATTEMPTS` | No | `5` | Retry attempts for Gateway API calls |
| `NETWORK_ID` | No | `1` | Radix network ID (`1` = mainnet, `2` = stokenet) |
| `EVENT_WORKER_CONCURRENCY` | No | `20` | Concurrency for event processing workers |
| `TRANSACTION_WORKER_CONCURRENCY` | No | `20` | Concurrency for transaction processing workers |
| `SNAPSHOT_BATCH_SIZE` | No | `30000` | Batch size for snapshot database inserts |
| `NODE_MAX_OLD_SPACE_SIZE` | No | &mdash; | Node.js max old space size in MB (e.g. `3072`) |
| `DISABLE_SCHEDULED_CALCULATIONS` | No | `false` | Disable automatic scheduled calculation jobs |
| `DISABLE_SCHEDULED_SNAPSHOT` | No | `false` | Disable automatic scheduled snapshot jobs |
| `DISABLE_VESTER_REFILL` | No | `false` | Disable automatic vester refill scheduling |
| `DISABLE_MAINTENANCE` | No | `false` | Disable automatic maintenance jobs |
| `VAULT_BASE_URL` | No | `http://localhost:8200` | HashiCorp Vault URL (for reward signing) |
| `VAULT_KEY_NAME` | No | `xrd-distribution` | Vault key name for transaction signing |
| `VAULT_TOKEN` | Conditional | &mdash; | Vault authentication token (or use `VAULT_TOKEN_FILE`) |
| `VAULT_TOKEN_FILE` | Conditional | &mdash; | Path to file containing Vault token |
| `INCENTIVES_VESTER_COMPONENT_ADDRESS` | Conditional | &mdash; | Vester smart contract component address (required for reward distribution) |
| `INCENTIVES_VESTER_REWARDS_RESOURCE_ADDRESS` | Conditional | &mdash; | Rewards resource address for vesting |
| `INCENTIVES_VESTER_ADMIN_BADGE_RESOURCE_ADDRESS` | Conditional | &mdash; | Admin badge resource address |
| `INCENTIVES_VESTER_SUPER_ADMIN_BADGE_RESOURCE_ADDRESS` | Conditional | &mdash; | Super admin badge resource address |
| `INCENTIVES_VESTER_ADMIN_ACCOUNT_ADDRESS` | Conditional | &mdash; | Admin account address for vester operations |
| `INCENTIVES_VESTER_SUPER_ADMIN_ACCOUNT_ADDRESS` | Conditional | &mdash; | Super admin account address |
| `INCENTIVES_VESTER_ACCESS_CONTROLLER_ADDRESS` | Conditional | &mdash; | Access controller component address |
| `INCENTIVES_VESTER_SUPER_ADMIN_ACCESS_CONTROLLER_ADDRESS` | Conditional | &mdash; | Super admin access controller address |

> **Note:** The `INCENTIVES_VESTER_*` variables are only required if you deploy the on-ledger vester component for XRD reward distribution. They can be omitted if rewards are distributed manually.

### Streamer

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | &mdash; | PostgreSQL connection string |
| `PORT` | No | `3004` | HTTP server port |
| `GATEWAY_URL` | No | `https://mainnet-gateway.radixdlt.com` | Radix Gateway API endpoint |
| `WORKERS_API_BASE_URL` | Yes | &mdash; | Workers service URL (e.g. `http://localhost:3003`) |
| `NETWORK_ID` | No | `1` | Radix network ID |
| `TRANSACTION_STREAM_ENABLED` | No | `true` | Enable transaction stream processing |
| `TRANSACTION_STREAM_SLEEP_DURATION` | No | `1 minute` | Sleep between poll cycles when idle |
| `START_TIMESTAMP` | No | &mdash; | ISO timestamp to start streaming from (first run) |

---

## Local Development

### 1. Start Infrastructure

The `docker-compose.yml` at the project root starts PostgreSQL, Redis, Vault, and Jaeger:

```bash
docker compose up -d
```

This provisions:
- **PostgreSQL 17** on `localhost:5432` (user: `postgres`, password: `password`)
- **Redis 7** on `localhost:6379`
- **HashiCorp Vault** on `localhost:8200` (auto-initialized via `vault-init`)
- **Vault Agent** on `localhost:8100` (proxy for app token renewal)
- **Jaeger** UI on `localhost:16686`, OTLP on `localhost:4318`

The `postgres-init/init-db.sh` script auto-creates the `radix-incentives` databases.

### 2. Install Dependencies and Prepare Database

```bash
pnpm install
pnpm db:migrate
```

### 3. Configure Environment

Install [direnv](https://direnv.net) to automatically load environment variables when you enter the project directory:

```bash
# macOS
brew install direnv

# Then add the shell hook (bash example — see direnv.net for zsh/fish)
eval "$(direnv hook bash)"
```

Create a `.envrc` file in the project root:

```bash
export DATABASE_URL="postgresql://postgres:password@localhost:5432/radix-incentives"
export REDIS_HOST="localhost"
export REDIS_PORT=6379
export REDIS_PASSWORD=password
export WORKERS_API_BASE_URL="http://localhost:3003"
export STREAMER_API_BASE_URL="http://localhost:3004"
export DAPP_DEFINITION_ADDRESS="account_rdx129zzrj4mwjwec8e6rmsvcz0hx4lp7uj3kf73w8rd2fek4cryaemewh"
export NEXT_PUBLIC_DAPP_DEFINITION_ADDRESS="$DAPP_DEFINITION_ADDRESS"
export GATEWAY_URL="https://mainnet-gateway.radixdlt.com"
export TOKEN_PRICE_SERVICE_API_KEY="your_token_here"
export VAULT_BASE_URL="http://localhost:8200/v1"
export VAULT_TOKEN_FILE="$(pwd)/vault/secrets/token"
```

Then allow direnv to load it:

```bash
direnv allow
```

The Next.js apps (Incentives, Admin) also read `.env` files at build time. Copy the examples if needed:

```bash
cp apps/incentives/.env.example apps/incentives/.env
cp apps/admin/.env.example apps/admin/.env
```

### 4. Configure Vault (Optional)

Vault provides Ed25519 key management and transaction signing via the Transit secrets engine. It is only needed for reward distribution.

The `docker compose up -d` command in step 1 already starts the Vault services:
- **vault** — HashiCorp Vault server in dev mode (port 8200)
- **vault-init** — Initializes the Transit engine with an Ed25519 key (`xrd-distribution`)
- **vault-agent** — API proxy with token caching (port 8100)

#### Vault Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VAULT_TOKEN` | Static Vault token (for dev/testing) | — |
| `VAULT_TOKEN_FILE` | Path to file containing Vault token (preferred for production) | — |
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

> The application checks `VAULT_TOKEN_FILE` first; if not set, falls back to `VAULT_TOKEN`.

### 5. Run Services

```bash
# All services
pnpm dev

# Or individually
pnpm dev:fe         # Incentives app + db
pnpm dev:admin      # Admin dashboard + db + workers
pnpm dev:workers    # Workers + db + streamer
pnpm dev:streamer   # Streamer + db
```

### 6. Verify

| Endpoint | Expected |
|----------|----------|
| `http://localhost:3000` | Incentives app |
| `http://localhost:3003/health` | `ok` (Workers) |
| `http://localhost:3003/ui` | Bull Board dashboard |
| `http://localhost:3004/health` | `ok` (Streamer) |

---

## Docker Images

All Dockerfiles live in `dockerfiles/` and use a consistent multi-stage build pattern:

1. **base** &mdash; `node:22.21.0-bullseye-slim` with pnpm 10.24.0 enabled via corepack
2. **builder** &mdash; Installs Turbo 2.6.2 and runs `turbo prune <app> --docker`
3. **installer** &mdash; Installs dependencies and builds the app
4. **runner** &mdash; Copies built artifacts and runs the server

### Build Commands

```bash
# Incentives App
docker build -f dockerfiles/incentives.Dockerfile \
  --build-arg NEXT_PUBLIC_DAPP_DEFINITION_ADDRESS="account_rdx12..." \
  -t radixdlt/incentives:latest .

# Admin Dashboard
docker build -f dockerfiles/admin.Dockerfile \
  -t radixdlt/incentives-admin:latest .

# Workers
docker build -f dockerfiles/workers.Dockerfile \
  -t radixdlt/incentives-worker:latest .

# Streamer
docker build -f dockerfiles/streamer.Dockerfile \
  -t radixdlt/incentives-transaction-stream:latest .
```

### Build Arguments

| Image | Build Arg | Description |
|-------|-----------|-------------|
| `incentives` | `NEXT_PUBLIC_DAPP_DEFINITION_ADDRESS` | dApp definition address baked into the Next.js client bundle |

### Image Registry

| Image | Registry Path |
|-------|---------------|
| Incentives | `docker.io/radixdlt/incentives` |
| Admin | `docker.io/radixdlt/incentives-admin` |
| Workers | `docker.io/radixdlt/incentives-worker` |
| Streamer | `docker.io/radixdlt/incentives-transaction-stream` |

---

## Production Deployment (Kubernetes)

### Helm Chart Structure

```
deploy/helm/
  helmfile.yaml              # Orchestrates all releases
  incentives/                # Incentives app chart
  admin/                     # Admin dashboard chart
  worker/                    # Workers chart
  transaction-stream/        # Streamer chart
  taskforce-connector/       # Optional BullMQ monitoring
  environments/
    dev/                     # Dev environment overrides
    perftest/                # Performance testing overrides
    pr/                      # PR preview overrides
    prod/                    # Production overrides
```

Each chart follows the same template pattern:
- `values.yaml` &mdash; default values (image, ports, resources)
- `templates/deployment.yaml` &mdash; Deployment with env vars from `params` and `secrets`
- `templates/secrets.yaml` &mdash; ExternalSecret CRDs for sensitive values
- `templates/service.yaml` &mdash; ClusterIP service
- `templates/ingress.yaml` &mdash; Ingress (frontends only)
- `templates/hpa.yaml` &mdash; Horizontal Pod Autoscaler
- `templates/servicemonitor.yaml` &mdash; Prometheus ServiceMonitor

### Helmfile Environments

The helmfile defines four environments: `dev`, `perftest`, `pr`, `prod`.

```bash
# Deploy to dev
cd deploy/helm
helmfile -e dev apply

# Deploy to production
helmfile -e prod apply
```

Required environment variables for Helmfile:
- `HELM_GH_USER` / `HELM_GH_PASS` &mdash; GitHub credentials for the `rdx-works` Helm chart repository

### Configuration Pattern

Environment variables are injected into pods via two mechanisms:

**1. Plain values (`params`)** &mdash; Non-sensitive config set directly in environment override files:

```yaml
# environments/<env>/worker.yaml.gotmpl
params:
  REDIS_HOST: "redis-master"
  REDIS_PORT: "6379"
  GATEWAY_URL: "https://mainnet-gateway.radixdlt.com"
  SNAPSHOT_BATCH_SIZE: 1000
```

**2. Secrets (`secrets`)** &mdash; Sensitive values pulled via External Secrets Operator:

```yaml
secrets:
  - external_secret_name: workers-postgres-url
    env_variable: "DATABASE_URL"
    aws_secret_name: "my-project/eks/incentives/prod/postgres"
    aws_secret_key: "database-url"
    secret_key: "database-url"
```

### Required Infrastructure

| Component | Purpose | Notes |
|-----------|---------|-------|
| PostgreSQL (managed) | Primary datastore | RDS, Cloud SQL, or self-hosted |
| Redis | BullMQ job queues | Bitnami Redis chart included in helmfile |
| Ingress Controller | Route external traffic | nginx-ingress recommended |
| External Secrets Operator | Sync secrets from a secret store | Supports AWS Secrets Manager, Vault, GCP Secret Manager, etc. |
| HashiCorp Vault | Transaction signing | Required only for reward distribution |

### Secrets Management

The charts use the [External Secrets Operator](https://external-secrets.io/) to sync secrets from your secret store into Kubernetes Secrets. Each secret in `values.yaml` maps to a `ClusterSecretStore` named `main`.

To adapt for your secret store:
1. Install the External Secrets Operator
2. Create a `ClusterSecretStore` named `main` pointing to your provider
3. Adjust `aws_secret_name` and `aws_secret_key` in your environment override files

Secrets you need to provision per environment:

| Secret | Used By | Description |
|--------|---------|-------------|
| Database URL | All services | PostgreSQL connection string |
| Token Price Service API Key | Incentives, Workers, Streamer | API key for price data |
| Radix Charts API Key | Incentives | Authorization token for Radix Charts |
| Admin JWT Secret | Admin | JWT signing key for admin authentication |

### Vault Setup (Optional)

Vault is used for signing reward distribution transactions. In Kubernetes, Vault Agent Injector handles token injection:

```yaml
podAnnotations:
  vault.hashicorp.com/agent-inject: 'true'
  vault.hashicorp.com/agent-inject-token: 'true'
  vault.hashicorp.com/role: 'role-incentives-prod'
```

Configure these Workers env vars:
- `VAULT_BASE_URL` &mdash; Vault server URL
- `VAULT_KEY_NAME` &mdash; Signing key name in Vault
- `VAULT_TOKEN_FILE` &mdash; Path to injected token (e.g. `/vault/secrets/token`)

If you do not need reward distribution, you can skip Vault entirely.

### Resource Recommendations

Based on production configuration:

| Service | CPU Request | Memory Request | Notes |
|---------|------------|----------------|-------|
| Incentives | 500m | 1.5Gi | HPA: 1-4 replicas |
| Admin | 50m | 256Mi | Single replica typical |
| Workers | 1500m | 4Gi | Memory-intensive calculations |
| Streamer | 200m | 384Mi | Single replica (must be exactly 1) |

---

## Health Checks

| Service | Endpoint | Port | Response |
|---------|----------|------|----------|
| Workers | `GET /health` | 3003 | `ok` (text) |
| Streamer | `GET /health` | 3004 | `ok` (text) |
| Incentives | `GET /health` | 3000 | `{ status: "ok" }` (JSON) |
| Admin | `GET /health` | 3000 | `{ status: "ok" }` (JSON) |

Kubernetes liveness and readiness probes are pre-configured in all Helm deployment templates to use `GET /health` on the HTTP port. The Streamer deployment adds `initialDelaySeconds: 10` to both probes.

### Metrics

Workers exposes Prometheus-compatible metrics at `GET /metrics` on port **9210**. This includes per-queue BullMQ metrics (active, completed, failed, waiting counts). Enable collection via the `metrics.enabled` Helm value and the included `ServiceMonitor` template.

---

## Queue Management

We **strongly recommend [Taskforce](https://taskforce.sh)** for managing BullMQ queues. Taskforce provides a hosted dashboard with real-time monitoring, job inspection, retry/removal controls, and alerting — all purpose-built for BullMQ. It is the official monitoring solution from the BullMQ maintainers.

### Local Setup

Add these environment variables to your `.envrc` (or export them directly):

```bash
export TASKFORCE_TOKEN="<your-token>"       # Obtain from https://taskforce.sh (free tier available)
export TASKFORCE_TEAM="<your-team-name>"
export TASKFORCE_CONNECTION="<connection-label>"  # Descriptive name, e.g. "local-dev"
```

Then start Workers normally (`pnpm dev:workers`). The Taskforce connector runs in-process and connects your local queues to the Taskforce dashboard automatically.

See the [Taskforce documentation](https://docs.taskforce.sh) for token creation and team setup.

### Production Setup

A dedicated **taskforce-connector** Helm chart is included at `deploy/helm/taskforce-connector/`. It runs the `ghcr.io/taskforcesh/taskforce-connector` image as a standalone deployment that bridges the Redis-backed queues to the Taskforce cloud dashboard.

Deployment is controlled by the `INSTALL_TASKFORCE_CONNECTOR` helmfile state value (`ci.install_connector`). When enabled, the chart:

- Reads `TASKFORCE_TOKEN` from an ExternalSecret (`taskforce-token-secret` backed by AWS Secrets Manager)
- Configures `TASKFORCE_TEAM`, `TASKFORCE_CONNECTION`, and `REDIS_HOST` via Helm values
- Runs with minimal resources (50m CPU / 128Mi memory request)

Per-environment values live in `deploy/helm/environments/<env>/taskforce-connector.yaml.gotmpl`.

### Bull Board (Lightweight Alternative)

Workers includes a built-in [Bull Board](https://github.com/felixmosh/bull-board) UI at the `/ui` path on port **3003**. It starts automatically with the Workers process — no extra configuration required.

Bull Board is useful for quick local inspection but lacks the alerting, historical analytics, and multi-environment views that Taskforce provides. For production monitoring, prefer Taskforce.

---

## Troubleshooting

### Common Issues

**`Failed to add workspace, it already exists`**
Next.js standalone builds can create duplicate `package.json` files. Fix:
```bash
pnpm clean
pnpm build
```

**Workers high memory usage**
Set `NODE_MAX_OLD_SPACE_SIZE` (in MB) to cap V8 heap. Production uses `3072` (3 GB).

**Streamer not processing transactions**
- Verify `GATEWAY_URL` is reachable
- Check `TRANSACTION_STREAM_ENABLED` is `true`
- Ensure exactly **one** Streamer replica is running (multiple replicas will cause duplicate processing)

**Database migrations**
```bash
pnpm db:migrate    # Apply pending migrations
pnpm db:generate   # Generate migrations after schema changes
pnpm db:studio     # Launch Drizzle Studio for inspection
```
