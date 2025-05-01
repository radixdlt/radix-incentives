FROM node:22.3.0-bullseye-slim AS base

ARG NPM_LOCAL_CACHE=.cache

RUN apt update && apt install -y make && apt install -y gcc

FROM base AS prepare-build

WORKDIR /app

RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=transaction-stream --docker

FROM base AS build

WORKDIR /app

COPY --from=prepare-build /app/out/json/ .
COPY --from=prepare-build /app/out/package-lock.json ./package-lock.json

RUN npm install

COPY --from=prepare-build /app/out/full/ .

COPY turbo.json turbo.json

RUN npx turbo run build --filter=transaction-stream

FROM base AS application

WORKDIR /app

COPY --from=build /app/apps/ apps
COPY --from=build /app/packages/ packages
COPY --from=build /app/packages/database/src/ .
COPY --from=build /app/node_modules node_modules

RUN npm install pm2 -g && \
    pm2 install pm2-metrics

CMD ["pm2-runtime","apps/transaction-stream/dist/index.cjs"]