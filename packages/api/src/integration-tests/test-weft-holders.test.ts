
import postgres from 'postgres';
import { describe, it, afterEach, beforeAll, inject } from 'vitest';

import {
  checkHolding,
  getAccountHoldersForResource,
  truncateAllTables,
} from './utils.js';
import { drizzle } from 'drizzle-orm/postgres-js';
import { WeftFinanceConstants } from 'data/src/dapps/weftFinance/constants';
import { ActivityId, Assets } from 'data';

describe('Weft Lending Holders Snapshot Test', () => {
  let dbUrl: string;
  process.env.SNAPSHOT_BATCH_SIZE = '1000';

  const values: Record<string, { totalUsdValue: string, price: string, estimatedTokens: number }> = {};

  beforeAll(async () => {
    console.log('Setting up PostgreSQL container for snapshot test');
    dbUrl = inject('testDbUrl');

    // Set the DATABASE_URL environment variable for the dependency layer
    process.env.DATABASE_URL = dbUrl;
    console.log('DATABASE_URL', process.env.DATABASE_URL);
  });

  afterEach(async () => {
    const { schema } = await import('db/incentives');

    const client = postgres(dbUrl);
    const db = drizzle(client, { schema });
    await truncateAllTables(db, dbUrl);
    await client.end();
  });

  afterAll(async () => {
    console.log('Values', values);
  });

  it(
    'should process snapshot for Weft xwbtc holders',
    { retry: 0, timeout: 300000 },
    async () => {
      const weftv2xwbtcResourceAddress =
        WeftFinanceConstants.v2.w2xwBTC.resourceAddress;
      const testAccounts = await getAccountHoldersForResource(
        weftv2xwbtcResourceAddress,
      );

      const weftV2ResourceAddresses =
        WeftFinanceConstants.v2.WeftyV2.resourceAddress;
      const testWeftyAccounts = await getAccountHoldersForResource(
        weftV2ResourceAddresses,
      );

      const mergedAccounts = [
        ...new Set([...testAccounts, ...testWeftyAccounts]),
      ];
      const { totalUsdValue, price, estimatedTokens } = await checkHolding(
        dbUrl,
        Assets.Fungible.wxBTC,
        ActivityId.we_le_blu_xwbtc,
        mergedAccounts,
      );
      values[ActivityId.we_le_blu_xwbtc] = {
        totalUsdValue: totalUsdValue.toString(),
        price: price.toString(),
        estimatedTokens,
      };
    },
  );

  it(
    'should process snapshot for Weft xETH holders',
    { retry: 0, timeout: 300000 },
    async () => {
      const weftv2xethResourceAddress =
        WeftFinanceConstants.v2.w2wETH.resourceAddress;
      const testAccounts = await getAccountHoldersForResource(
        weftv2xethResourceAddress,
      );

      const weftV2ResourceAddresses =
        WeftFinanceConstants.v2.WeftyV2.resourceAddress;
      const testWeftyAccounts = await getAccountHoldersForResource(
        weftV2ResourceAddresses,
      );

      const mergedAccounts = [
        ...new Set([...testAccounts, ...testWeftyAccounts]),
      ];
      const { totalUsdValue, price, estimatedTokens } = await checkHolding(
        dbUrl,
        Assets.Fungible.xETH,
        ActivityId.we_le_blu_xeth,
        mergedAccounts,
      );
      values[ActivityId.we_le_blu_xeth] = {
        totalUsdValue: totalUsdValue.toString(),
        price: price.toString(),
        estimatedTokens,
      };
    },
  );

  it(
    'should process snapshot for Weft xUSDCholders',
    { retry: 0, timeout: 300000 },
    async () => {
      const weftv2xusdcResourceAddress =
        WeftFinanceConstants.v2.w2xUSDC.resourceAddress;
      const testAccounts = await getAccountHoldersForResource(
        weftv2xusdcResourceAddress,
      );

      const weftV2ResourceAddresses =
        WeftFinanceConstants.v2.WeftyV2.resourceAddress;
      const testWeftyAccounts = await getAccountHoldersForResource(
        weftV2ResourceAddresses,
      );

      const mergedAccounts = [
        ...new Set([...testAccounts, ...testWeftyAccounts]),
      ];
      const { totalUsdValue, price, estimatedTokens } = await checkHolding(
        dbUrl,
        Assets.Fungible.xUSDC,
        ActivityId.we_le_sta_xusdc,
        mergedAccounts,
      );
      values[ActivityId.we_le_sta_xusdc] = {
        totalUsdValue: totalUsdValue.toString(),
        price: price.toString(),
        estimatedTokens,
      };
    },
  );

  it(
    'should process snapshot for Weft XRD holders',
    { retry: 0, timeout: 300000 },
    async () => {
      // Use the same test accounts that were created in beforeAll
      const weftv2xrdResourceAddress =
        WeftFinanceConstants.v2.w2XRD.resourceAddress;
      const testAccounts = await getAccountHoldersForResource(
        weftv2xrdResourceAddress,
      );
      const weftV2ResourceAddresses =
        WeftFinanceConstants.v2.WeftyV2.resourceAddress;
      const testWeftyAccounts = await getAccountHoldersForResource(
        weftV2ResourceAddresses,
      );

      const mergedAccounts = [
        ...new Set([...testAccounts, ...testWeftyAccounts]),
      ];
      const { totalUsdValue, price, estimatedTokens } = await checkHolding(
        dbUrl,
        Assets.Fungible.XRD,
        ActivityId.we_le_der_xrd,
        mergedAccounts,
      );
      values[ActivityId.we_le_der_xrd] = {
        totalUsdValue: totalUsdValue.toString(),
        price: price.toString(),
        estimatedTokens,
      };
    },
  );
});
