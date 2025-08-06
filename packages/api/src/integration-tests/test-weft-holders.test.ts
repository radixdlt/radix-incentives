// Set a placeholder DATABASE_URL before any imports to prevent drizzle config errors

// import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import postgres from "postgres";
import { describe, it, afterEach, beforeAll, inject } from "vitest";

import type { SnapshotWorkerInput } from "../incentives/snapshot/snapshotWorker.js";
import {
  createTestUserAndAccounts,
  getAccountHoldersForResource,
  getPriceForResource,
  getTotalUsdValueForActivity,
  truncateAllTables,
} from "./utils.js";
import { drizzle } from "drizzle-orm/postgres-js";
import { WeftFinanceConstants } from "data/src/dapps/weftFinance/constants";
import { Assets } from "data";

describe.skipIf(process.env.SKIP_INTEGRATION_TESTS === "true")(
  "Weft Lending Holders Snapshot Test",
  () => {
    // let postgresContainer: StartedPostgreSqlContainer;
    let dbUrl: string;
    process.env.SNAPSHOT_BATCH_SIZE = "1000";
    // let teardownFn: (() => Promise<void>) | null = null;

    beforeAll(async () => {
      console.log("Setting up PostgreSQL container for snapshot test");

      dbUrl = inject("testDbUrl");

      // Set the DATABASE_URL environment variable for the dependency layer
      process.env.DATABASE_URL = dbUrl;
      console.log("DATABASE_URL", process.env.DATABASE_URL);
    });

    afterEach(async () => {
      const { schema } = await import("db/incentives");

      const client = postgres(dbUrl);
      const db = drizzle(client, { schema });
      await truncateAllTables(db, dbUrl);
      await client.end();
    });

    const runSnapshotWorker = async (input: SnapshotWorkerInput) => {
      // Use dynamic import to load dependency layer after DATABASE_URL is set
      const { dependencyLayer } = await import(
        "../incentives/dependencyLayer.js"
      );
      return dependencyLayer.snapshotWorker(input);
    };

    it(
      "should process snapshot for Weft xwbtc holders",
      { retry: 0, timeout: 300000 },
      async () => {
        const weftv2xwbtcResourceAddress =
          WeftFinanceConstants.v2.w2xwBTC.resourceAddress;
        const testAccounts = await getAccountHoldersForResource(
          weftv2xwbtcResourceAddress
        );

        const weftV2ResourceAddresses =
          WeftFinanceConstants.v2.WeftyV2.resourceAddress;
        const testWeftyAccounts = await getAccountHoldersForResource(
          weftV2ResourceAddresses
        );

        const mergedAccounts = [
          ...new Set([...testAccounts, ...testWeftyAccounts]),
        ];
        const { schema } = await import("db/incentives");

        const client = postgres(dbUrl);
        const db = drizzle(client, { schema });

        await createTestUserAndAccounts(db, mergedAccounts);

        const timestamp = new Date();
        const snapshotInput: SnapshotWorkerInput = {
          timestamp: timestamp,
          jobId: "test-weft-xwbtc-holders",
        };

        const result = await runSnapshotWorker(snapshotInput);

        console.log("Snapshot worker result:", result);
        if (result._tag === "Failure") {
          console.error("Snapshot worker failed:", result.cause);
          throw result.cause;
        }

        try {
          const xwbtcPrice = await getPriceForResource(
            Assets.Fungible.wxBTC,
            timestamp
          );
          console.log("wxBTC price:", xwbtcPrice.toString());

          const weftActivityId = "we_le_blu_xwbtc";
          console.log("Getting total USD value for activity", weftActivityId);
          const totalUsdValue = await getTotalUsdValueForActivity(
            client,
            weftActivityId
          );
          console.log(
            `Total USD value for ${weftActivityId}: ${totalUsdValue}`
          );

          console.log(`Price per unit: $${xwbtcPrice.toString()}`);
          if (totalUsdValue && Number(totalUsdValue) > 0) {
            const estimatedTokens =
              Number(totalUsdValue) / Number(xwbtcPrice.toString());
            console.log(`Estimated tokens based on price: ${estimatedTokens}`);
          }
        } finally {
          await client.end();
        }
      }
    );

    it(
      "should process snapshot for Weft xETH holders",
      { retry: 0, timeout: 300000 },
      async () => {
        const weftv2xethResourceAddress =
          WeftFinanceConstants.v2.w2wETH.resourceAddress;
        const testAccounts = await getAccountHoldersForResource(
          weftv2xethResourceAddress
        );

        const weftV2ResourceAddresses =
          WeftFinanceConstants.v2.WeftyV2.resourceAddress;
        const testWeftyAccounts = await getAccountHoldersForResource(
          weftV2ResourceAddresses
        );

        const mergedAccounts = [
          ...new Set([...testAccounts, ...testWeftyAccounts]),
        ];
        const { schema } = await import("db/incentives");

        const client = postgres(dbUrl);
        const db = drizzle(client, { schema });

        console.log("Creating test user and accounts");
        await createTestUserAndAccounts(db, mergedAccounts);
        console.log("Database url", process.env.DATABASE_URL);
        const timestamp = new Date();
        const snapshotInput: SnapshotWorkerInput = {
          timestamp: timestamp,
          jobId: "test-weft-xeth-holders",
        };

        const result = await runSnapshotWorker(snapshotInput);

        console.log("Snapshot worker result:", result);
        if (result._tag === "Failure") {
          console.error("Snapshot worker failed:", result.cause);
          throw result.cause;
        }

        try {
          const xethPrice = await getPriceForResource(
            Assets.Fungible.xETH,
            timestamp
          );
          console.log("wETH price:", xethPrice.toString());
          const weftActivityId = "we_le_blu_xeth";
          console.log("Getting total USD value for activity", weftActivityId);
          const totalUsdValue = await getTotalUsdValueForActivity(
            client,
            weftActivityId
          );
          console.log(
            `Total USD value for ${weftActivityId}: ${totalUsdValue}`
          );
          console.log(`Price per unit: $${xethPrice.toString()}`);
          if (totalUsdValue && Number(totalUsdValue) > 0) {
            const estimatedTokens =
              Number(totalUsdValue) / Number(xethPrice.toString());
            console.log(`Estimated tokens based on price: ${estimatedTokens}`);
          }
        } finally {
          await client.end();
        }
      }
    );

    it.skip(
      "should process snapshot for Weft xUSDCholders",
      { retry: 0, timeout: 300000 },
      async () => {
        const weftv2xusdcResourceAddress =
          WeftFinanceConstants.v2.w2xUSDC.resourceAddress;
        const testAccounts = await getAccountHoldersForResource(
          weftv2xusdcResourceAddress
        );

        const weftV2ResourceAddresses =
          WeftFinanceConstants.v2.WeftyV2.resourceAddress;
        const testWeftyAccounts = await getAccountHoldersForResource(
          weftV2ResourceAddresses
        );

        const mergedAccounts = [
          ...new Set([...testAccounts, ...testWeftyAccounts]),
        ];
        const { schema } = await import("db/incentives");

        const client = postgres(dbUrl);
        const db = drizzle(client, { schema });

        await createTestUserAndAccounts(db, mergedAccounts);

        const timestamp = new Date();
        const snapshotInput: SnapshotWorkerInput = {
          timestamp: timestamp,
          jobId: "test-weft-xrd-xusdc-holders",
        };

        const result = await runSnapshotWorker(snapshotInput);

        console.log("Snapshot worker result:", result);
        if (result._tag === "Failure") {
          console.error("Snapshot worker failed:", result.cause);
          throw result.cause;
        }

        try {
          const xusdcPrice = await getPriceForResource(
            Assets.Fungible.xUSDC,
            timestamp
          );
          console.log("wUSDC price:", xusdcPrice.toString());
          const weftActivityId = "we_le_sta_xusdc";
          console.log("Getting total USD value for activity", weftActivityId);
          const totalUsdValue = await getTotalUsdValueForActivity(
            client,
            weftActivityId
          );
          console.log(
            `Total USD value for ${weftActivityId}: ${totalUsdValue}`
          );
          console.log(`Price per unit: $${xusdcPrice.toString()}`);
          if (totalUsdValue && Number(totalUsdValue) > 0) {
            const estimatedTokens =
              Number(totalUsdValue) / Number(xusdcPrice.toString());
            console.log(`Estimated tokens based on price: ${estimatedTokens}`);
          }
        } finally {
          await client.end();
        }
      }
    );

    it.skip(
      "should process snapshot for Weft XRD holders",
      { retry: 0, timeout: 300000 },
      async () => {
        // Use the same test accounts that were created in beforeAll
        const weftv2xrdResourceAddress =
          WeftFinanceConstants.v2.w2XRD.resourceAddress;
        const testAccounts = await getAccountHoldersForResource(
          weftv2xrdResourceAddress
        );
        const weftV2ResourceAddresses =
          WeftFinanceConstants.v2.WeftyV2.resourceAddress;
        const testWeftyAccounts = await getAccountHoldersForResource(
          weftV2ResourceAddresses
        );

        const mergedAccounts = [
          ...new Set([...testAccounts, ...testWeftyAccounts]),
        ];
        const { schema } = await import("db/incentives");

        const client = postgres(dbUrl);
        const db = drizzle(client, { schema });

        await createTestUserAndAccounts(db, mergedAccounts);

        const timestamp = new Date();
        const snapshotInput: SnapshotWorkerInput = {
          timestamp: timestamp,
          jobId: "test-weft-xrd-xusdc-holders",
        };

        const result = await runSnapshotWorker(snapshotInput);

        console.log("Snapshot worker result:", result);
        if (result._tag === "Failure") {
          console.error("Snapshot worker failed:", result.cause);
          throw result.cause;
        }
        try {
          const xrdPrice = await getPriceForResource(
            Assets.Fungible.XRD,
            timestamp
          );
          console.log("XRD price:", xrdPrice.toString());
          const weftActivityId = "weft_lend_xrd";
          console.log("Getting total USD value for activity", weftActivityId);
          const totalUsdValue = await getTotalUsdValueForActivity(
            client,
            weftActivityId
          );
          console.log(
            `Total USD value for ${weftActivityId}: ${totalUsdValue}`
          );

          // Now xrdPrice can be used for further calculations
          console.log(`Price per unit: $${xrdPrice.toString()}`);
          if (totalUsdValue && Number(totalUsdValue) > 0) {
            const estimatedTokens =
              Number(totalUsdValue) / Number(xrdPrice.toString());
            console.log(`Estimated tokens based on price: ${estimatedTokens}`);
          }
        } finally {
          await client.end();
        }
      }
    );
  }
);
