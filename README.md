# Turborepo starter

This Turborepo starter is maintained by the Turborepo core team.

## Using this example

Run the following command:

```sh
npx create-turbo@latest
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo
pnpm dev
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)


#  Local setup for running environment locally
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
## 🚀 Getting Started with Radix Incentives

Follow these steps to get the project up and running locally, run migrations, and troubleshoot common issues.

---

### 1. Prerequisites

- **Node.js**: version **>= 20.0.0**  
  Download from https://nodejs.org/en/download/  
- **pnpm**: package manager  
  Install via  
  ```bash
  npm install -g pnpm
  ```
- **Docker & Docker-Compose**  
  Install from https://docs.docker.com/get-docker/

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
pnpm run db:migrate:incentives
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
pnpm run db:migrate:incentives
```




### 5. Port Forward Mainnet Gateway Service

To port forward the mainnet gateway service, ensure you have the `role-admin-developer` role assigned on the production cluster `rtjl-prod`. The active mainnet gateway namespace can be either `ng-babylon-mainnet-green` or `ng-babylon-mainnet-blue`.

1. Switch to the production context:
   ```bash
   kubectl config use-context rtlj-prod
   ```

2. Port forward the gateway API service:
   ```bash
   kubectl port-forward service/gateway-api 8080:8080 -n ng-babylon-mainnet-green
   ```

> **Note**: Verify the active namespace (`ng-babylon-mainnet-green` or `ng-babylon-mainnet-blue`) before executing the port forward command.


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


### 8. Triggering Workers

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


---

### 6. Useful Links

- **Node.js Downloads & Docs**  
  https://nodejs.org/en/download/  
- **pnpm Docs**  
  https://pnpm.io/  
- **Drizzle ORM Migrations**  
  https://orm.drizzle.team/docs/getting-started  
- **Docker-Compose Reference**  
  https://docs.docker.com/compose/

---