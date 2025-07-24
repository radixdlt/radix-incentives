# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Radix Incentives Project

This is a Turborepo monorepo for the Radix Incentives Campaign - a blockchain incentive system designed to enhance significant and sustained on-chain economic activities on the Radix DLT network. The platform tracks user activities across DeFi protocols, calculates incentive points using time-weighted averages, and provides dashboards for both end users and administrators.

## Architecture Overview

### Applications
- **`apps/admin`** - Next.js admin dashboard for managing seasons, weeks, activities, and viewing analytics
- **`apps/incentives`** - Next.js user-facing dashboard where users connect wallets, view points, leaderboards, and activities  
- **`apps/consultation`** - Next.js app for user consultations and voting
- **`apps/workers`** - Background job processors using Bull queues for calculating points, snapshots, and processing events
- **`apps/streamer`** - Transaction stream processor that monitors Radix blockchain for relevant events

### Packages
- **`packages/api`** - Shared API layer containing business logic for all applications
- **`packages/db`** - Drizzle ORM database schemas and migrations for both incentives and consultation systems
- **`packages/data`** - Shared type definitions, constants, and validation schemas

### Key Data Flow
1. **Transaction Stream** → Events are captured from Radix blockchain via gateway API
2. **Event Processing** → Background workers match and process events for specific DApps (Ociswap, DefiPlaza, CaviarNine, etc.)
3. **Snapshot System** → Periodic account balance snapshots are taken for passive activities
4. **Points Calculation** → Activity points are calculated based on time-weighted averages and user actions
5. **Season Points** → Activity points are aggregated into season points with XRD/LSU holding multipliers

## Development Commands

### Environment Setup
```bash
# Install dependencies (use pnpm, not npm)
pnpm install

# Start database (requires Docker)
pnpm db:start

# Set required environment variable
export DATABASE_URL="postgres://postgres:password@localhost:5432/radix-incentives"

# Run database migrations
pnpm db:migrate

# Seed database with initial data
cd packages/db && pnpm db:seed
```

### Development
```bash
# Run all apps in development
pnpm dev

# Run specific applications
pnpm dev:admin      # Admin dashboard + db + workers
pnpm dev:fe         # User incentives app + db  
pnpm dev:workers    # Workers + db + streamer
pnpm dev:streamer   # Streamer + db
```

### Database Operations
```bash
# Generate new migrations after schema changes
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Launch Drizzle Studio
pnpm db:studio

# Reset database (drops all data)
pnpm db:reset
```

### Code Quality
```bash
# Format code with Biome
pnpm format

# Lint and fix issues
pnpm lint

# Type check all packages
pnpm check-types

# Run tests
pnpm test
```

### Build & Deploy
```bash
# Build all applications
pnpm build

# Build with cleanup
pnpm build:clean
```

## Core Development Principles

### Context and Rules
- **Incremental Changes**: Make changes file by file to allow for review
- **No Assumptions**: Do not invent changes, make assumptions, or speculate without evidence from the context

### Technology Stack Specifics
- **Frontend**: Next.js, ReactJS, TypeScript, TailwindCSS, Shadcn, Radix UI
- **Backend**: Node.js, TypeScript, tRPC v11
- **Database**: PostgreSQL with Drizzle ORM
- **Caching**: Redis
- **Job Processing**: Bull MQ
- **Blockchain**: Radix Gateway SDK, Radix-dApp-toolkit

### TypeScript Guidelines
- Use `type` over `interface`
- Use functions over classes
- Use named exports over default exports
- Use `const` arrow functions with types
- Document all functions
- Write Vitest unit tests covering all functions
- Use the `Effect` library for functional composition (`pipe`)
- Import types: `import type { FC } from "react"` not `import { type FC } from "react"`

### React/Next.js Guidelines
- Use Tailwind classes for styling (no inline CSS or `<style>` tags)
- Prefer `class:` over ternary operators in class attributes
- Implement accessibility features (`tabindex`, `aria-label`, keyboard events)
- Use early returns
- Use `~/` root alias, not `@/`

### tRPC Guidelines
- Use Zod for input validation
- Organize routers by feature
- Use middleware for common logic (auth)
- Use `TRPCError` for error handling
- Use SuperJSON transformer
- Create proper context (`server/context.ts`)
- Export only router types (`AppRouter`) to the client
- Use distinct procedure types (public, protected, admin)

### Database Guidelines
- All database changes occur in `./packages/db`
- Use Drizzle ORM with PostgreSQL
- Two main schemas: incentives and consultation
- Follow the database structure outlined in `.cursor/rules/database.mdc`

## Key Technical Concepts

### Points Calculation System
1. **Activity Points** - Calculated using time-weighted averages (TWA) of user balances/positions
2. **Season Points** - Aggregated activity points with XRD/LSU holding multipliers using S-curve distribution
3. **Multipliers** - Based on XRD/LSU holding amounts, capped at 3x for top 10% holders

### Background Job System
Uses Bull queues with Redis for:
- `calculate-activity-points` - Calculate user activity points for specific weeks
- `calculate-season-points` - Aggregate activity points into season points  
- `calculate-season-points-multiplier` - Apply XRD holding multipliers
- `snapshot` - Take account balance snapshots
- `event` - Process blockchain events

### Component Structure Guidelines
When working with React components:
- Break large components into smaller, focused components in dedicated directories
- Use TypeScript types (not interfaces) for props and shared types
- Place reusable components in `/components` with logical grouping
- Create index files for clean exports
- Follow the existing pattern of separating concerns (header, stats, controls, tables, etc.)

### Campaign Structure
- **Duration**: Each incentive season spans 12 weeks with weekly point calculations
- **Budget**: 1 Billion XRD total across multiple seasons with decreasing allocations
- **Eligibility**: Minimum $50 XRD holding requirement
- **Anti-Farming**: Minimum holdings, transaction fees, diversified activity weighting, retrospective adjustments

### Radix Integration
- Uses `@radixdlt/babylon-gateway-api-sdk` for blockchain data
- Integrates with multiple DeFi protocols (Ociswap, DefiPlaza, CaviarNine, Root Finance, Surge, Weft Finance)
- Implements ROLA (Radix Off-Ledger Authentication) for wallet connections
- Supports multi-account linking via RadixConnect

### Environment Requirements
- Node.js >= 20
- PostgreSQL database 
- Redis for queue management
- Docker for local development
- Access to Radix Gateway API (port-forward from production for local dev)

## Testing
- Backend API tests use Vitest with Effect framework
- Database tests use Testcontainers for PostgreSQL
- Individual test files are located next to source files with `.test.ts` extension
- All functions should be covered by unit tests
- **Test Implementation Guideline**:
  - Don't use mock implementations of the db in tests

## Package Management
- Use `pnpm` only (not npm or yarn)
- Install dependencies within specific packages, not at root level
- Reference the catalog when adding dependencies
- Use workspace protocol for internal package dependencies
- **Always use pnpm or pnpm dlx**

## Linting 
- Use pnpm biome lint to check for linting errors