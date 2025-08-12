# Base node image
FROM node:22.3.0-bullseye-slim AS base
WORKDIR /app

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
RUN turbo prune workers --docker

# Development dependencies installation stage
FROM base AS installer

COPY --from=builder /app/out/json/ .
RUN pnpm install

# Copy source code and build
COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=workers...

# Production image
FROM base AS runner
WORKDIR /app

# Copy built application
COPY --from=installer /app/apps/ apps
COPY --from=installer /app/packages/ packages
COPY --from=installer /app/node_modules/ node_modules

RUN apt-get update && apt-get install -y procps

RUN npm install pm2 -g && \
    pm2 install pm2-metrics

CMD ["pm2-runtime","apps/workers/dist/index.js"]