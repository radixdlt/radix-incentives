# Radix Incentives

A monorepo for the Radix Incentives Campaign

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

## Documentation

- [Architecture](docs/architecture.md) — Service diagram, data flow
- [Deployment Guide](docs/deployment.md) — Local dev setup, production deployment

## Quick Start

```bash
pnpm install
docker compose up -d
pnpm db:migrate
pnpm dev
```

See the [Deployment Guide](docs/deployment.md) for full local setup, environment variables, and production deployment.
