// Set a placeholder DATABASE_URL before any imports to prevent drizzle config errors
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder";

import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import postgres from "postgres";
import { describe, it, afterEach, beforeAll, afterAll } from "vitest";

import type { SnapshotWorkerInput } from "../incentives/snapshot/snapshotWorker.js";
import { createTestUserAndAccounts, getAccountHoldersForResource, getTotalUsdValueForActivity, runMigration, seedData, truncateAllTables } from "./utils.js";
import { drizzle } from "drizzle-orm/postgres-js";
import { WeftFinanceConstants } from "data/src/dapps/weftFinance/constants";
import { Effect, Layer } from "effect";
import { Assets } from "data";
import { GetUsdValueService, GetUsdValueLive } from "../incentives/token-price/getUsdValue.js";
import { AddressValidationServiceLive } from "../common/address-validation/addressValidation.js";
import { BigNumber } from "bignumber.js";

describe("Weft XRD-xUSDC Holders Snapshot Test", () => {
  let postgresContainer: StartedPostgreSqlContainer;
  let dbUrl: string;
  let teardownFn: (() => Promise<void>) | null = null;


  beforeAll(async () => {
    console.log("Setting up PostgreSQL container for snapshot test");

    // Start PostgreSQL container
    postgresContainer = await new PostgreSqlContainer("postgres:17").start();
    dbUrl = postgresContainer.getConnectionUri();

    // Set the DATABASE_URL environment variable for the dependency layer
    process.env.DATABASE_URL = dbUrl;
    console.log("DATABASE_URL", process.env.DATABASE_URL);

    // Wait for PostgreSQL to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));


    const { schema } = await import("db/incentives");

    const client = postgres(dbUrl);
    const db = drizzle(client, { schema });

    await runMigration(db);
    console.log("Migration run");
    await seedData(db);
    console.log("Seed data run");

    await client.end();


    teardownFn = async () => {
      console.log("Stopping PostgreSQL container");
      await postgresContainer.stop();

    };
  });

  afterEach(async () => {
    const { schema } = await import("db/incentives");

    const client = postgres(dbUrl);
    const db = drizzle(client, { schema });
    await truncateAllTables(db, dbUrl);
    await client.end();
  });

  afterAll(async () => {
    if (teardownFn) {
      await teardownFn();
    }
  });

  const runSnapshotWorker = async (input: SnapshotWorkerInput) => {
    // Use dynamic import to load dependency layer after DATABASE_URL is set
    const { dependencyLayer } = await import("../incentives/dependencyLayer.js");
    return dependencyLayer.snapshotWorker(input);
  };

  it("should process snapshot for Weft xwbtc holders", { retry: 0, timeout: 300000 }, async () => {
    // Use the same test accounts that were created in beforeAll
    const weftv2xwbtcResourceAddress = WeftFinanceConstants.v2.w2xwBTC.resourceAddress;
    const testAccounts = await getAccountHoldersForResource(weftv2xwbtcResourceAddress);

    const { schema } = await import("db/incentives");

    const client = postgres(dbUrl);
    const db = drizzle(client, { schema });


    createTestUserAndAccounts(db, testAccounts);

    const timestamp = new Date();
    const snapshotInput: SnapshotWorkerInput = {
      addresses: testAccounts,
      timestamp: timestamp,
      jobId: "test-weft-xwbtc-holders",
      batchSize: 10,
    };

    const result = await runSnapshotWorker(snapshotInput);

    console.log("Snapshot worker result:", result);
    if (result._tag === "Failure") {
      console.error("Snapshot worker failed:", result.cause);
      throw result.cause;
    }

    // Create the Effect program to get USD value
    const getUsdValueProgram = Effect.provide(
      Effect.gen(function* () {
        const getUsdValueService = yield* GetUsdValueService;

        const xwbtcPrice = yield* getUsdValueService({
          amount: new BigNumber(1),
          resourceAddress: Assets.Fungible.wxBTC,
          timestamp: timestamp,
        });        
        return xwbtcPrice;
      }),
      GetUsdValueLive.pipe(Layer.provide(AddressValidationServiceLive))
    );

    try {
      // Execute the Effect program and get the xwbtcPrice for use in subsequent operations
      const xwbtcPrice = await Effect.runPromise(getUsdValueProgram);
      console.log("wxBTC price:", xwbtcPrice.toString());

      const weftActivityId = "weft_lend_xwbtc"
      console.log("Getting total USD value for activity", weftActivityId);
      const totalUsdValue = await getTotalUsdValueForActivity(client, weftActivityId);
      console.log(`Total USD value for ${weftActivityId}: ${totalUsdValue}`);

      // Now xwbtcPrice can be used for further calculations
      console.log(`Price per unit: $${xwbtcPrice.toString()}`);
      if (totalUsdValue && Number(totalUsdValue) > 0) {
        const estimatedTokens = Number(totalUsdValue) / Number(xwbtcPrice.toString());
        console.log(`Estimated tokens based on price: ${estimatedTokens}`);
      }

    } finally {
      await client.end();
    }

  });

  it.skip("should process snapshot for Weft xETH holders", { retry: 0, timeout: 300000 }, async () => {
    // Use the same test accounts that were created in beforeAll
    const weftv2xethResourceAddress = WeftFinanceConstants.v2.w2wETH.resourceAddress;
    const testAccounts = await getAccountHoldersForResource(weftv2xethResourceAddress);

    const { schema } = await import("db/incentives");

    const client = postgres(dbUrl);
    const db = drizzle(client, { schema });

    console.log("Creating test user and accounts");
    await createTestUserAndAccounts(db, testAccounts);

    console.log("Database url", process.env.DATABASE_URL);
    const snapshotInput: SnapshotWorkerInput = {
      addresses: testAccounts,
      timestamp: new Date(),
      jobId: "test-weft-xeth-holders",
      batchSize: 10,
    };

    const result = await runSnapshotWorker(snapshotInput);

    console.log("Snapshot worker result:", result);
    if (result._tag === "Failure") {
      console.error("Snapshot worker failed:", result.cause);
      throw result.cause;
    }

    try {
      const weftActivityId = "weft_lend_xeth"
      console.log("Getting total USD value for activity", weftActivityId);
      const totalUsdValue = await getTotalUsdValueForActivity(client, weftActivityId);
      console.log(`Total USD value for ${weftActivityId}: ${totalUsdValue}`);

    } finally {
      await client.end();
    }
  });

  it.skip("should process snapshot for Weft xUSDCholders", { retry: 0, timeout: 300000 }, async () => {
    // Use the same test accounts that were created in beforeAll
    const weftv2xusdcResourceAddress = WeftFinanceConstants.v2.w2xUSDC.resourceAddress;
    const testAccounts = await getAccountHoldersForResource(weftv2xusdcResourceAddress);

    const { schema } = await import("db/incentives");

    const client = postgres(dbUrl);
    const db = drizzle(client, { schema });

    createTestUserAndAccounts(db, testAccounts);

    const snapshotInput: SnapshotWorkerInput = {
      addresses: testAccounts,
      timestamp: new Date(),
      jobId: "test-weft-xrd-xusdc-holders",
      batchSize: 10,
    };

    const result = await runSnapshotWorker(snapshotInput);

    console.log("Snapshot worker result:", result);
    if (result._tag === "Failure") {
      console.error("Snapshot worker failed:", result.cause);
      throw result.cause;
    }

    try {
      const weftActivityId = "weft_lend_xusdc"
      console.log("Getting total USD value for activity", weftActivityId);
      const totalUsdValue = await getTotalUsdValueForActivity(client, weftActivityId);
      console.log(`Total USD value for ${weftActivityId}: ${totalUsdValue}`);

    } finally {
      await client.end();
    }

  });

  it.skip("should process snapshot for Weft XRD holders", { retry: 0, timeout: 300000 }, async () => {
    // Use the same test accounts that were created in beforeAll
    const weftv2xrdResourceAddress = WeftFinanceConstants.v2.w2XRD.resourceAddress;
    const testAccounts = await getAccountHoldersForResource(weftv2xrdResourceAddress);

    const { schema } = await import("db/incentives");

    const client = postgres(dbUrl);
    const db = drizzle(client, { schema });

    
    createTestUserAndAccounts(db, testAccounts);

    const snapshotInput: SnapshotWorkerInput = {
      addresses: testAccounts,
      timestamp: new Date(),
      jobId: "test-weft-xrd-xusdc-holders",
      batchSize: 10,
    };

    const result = await runSnapshotWorker(snapshotInput);

    console.log("Snapshot worker result:", result);
    if (result._tag === "Failure") {
      console.error("Snapshot worker failed:", result.cause);
      throw result.cause;
    }
    try {
      const weftActivityId = "weft_lend_xrd"
      console.log("Getting total USD value for activity", weftActivityId);
      const totalUsdValue = await getTotalUsdValueForActivity(client, weftActivityId);
      console.log(`Total USD value for ${weftActivityId}: ${totalUsdValue}`);

    } finally {
      await client.end();
    }


  });
});
