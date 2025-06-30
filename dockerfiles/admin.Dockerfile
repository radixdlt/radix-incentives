# Base node image
FROM node:22.3.0-bullseye-slim AS base
WORKDIR /app

ENV DATABASE_URL="postgres://postgres:password@localhost:5432/radix-incentives"
ENV WORKERS_API_BASE_URL="http://localhost:3003"

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate 

# Install Turbo globally
FROM base AS builder

RUN pnpm add -g turbo@2.3.3

# Copy all files
COPY . .

# Prune the monorepo for the clinch package
RUN turbo prune admin --docker

# Development dependencies installation stage
FROM base AS installer

COPY --from=builder /app/out/json/ .
RUN pnpm install

# Copy source code and build
COPY --from=builder /app/out/full/ .
RUN --mount=type=secret,id=TURBO_TOKEN,required=false \
  if [ -f /run/secrets/TURBO_TOKEN ]; then \
    export TURBO_TOKEN=$(cat /run/secrets/TURBO_TOKEN) && \
    export TURBO_TEAM=radixdlt; \
    echo "TURBO_TOKEN provided."; \
  else \
    echo "TURBO_TOKEN not provided."; \
  fi; \
  pnpm turbo run build --filter=admin...

# Production image
FROM base AS runner
WORKDIR /app

# Copy built application
COPY --from=installer /app/apps/ apps
COPY --from=installer /app/packages/ packages
COPY --from=installer /app/node_modules/ node_modules
COPY --from=installer /app/apps/admin/public/ /app/apps/admin/.next/standalone/apps/admin/public
COPY --from=installer /app/apps/admin/.next/static /app/apps/admin/.next/standalone/apps/admin/.next/static

CMD node apps/admin/.next/standalone/apps/admin/server.js
