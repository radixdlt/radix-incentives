import { ActivityId, DefiPlazaConstants } from 'data';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { afterEach, beforeAll, describe, inject, it } from 'vitest';
import {
  checkHoldingForPool,
  getAccountHoldersForResource,
  truncateAllTables,
} from './utils';

describe.skipIf(process.env.SKIP_INTEGRATION_TESTS === 'true')(
  'DefiPlaza Lending Holders Snapshot Test',
  () => {
    let dbUrl: string;
    process.env.SNAPSHOT_BATCH_SIZE = '1000';
    process.env.DEBUG_STORE_METADATA = 'true';
    const values: Record<
      string,
      {
        totalWithinPriceBounds: string;
        totalOutsidePriceBounds: string;
        token: string;
      }
    > = {};

    beforeAll(async () => {
      console.log('Setting up PostgreSQL container for snapshot test');
      dbUrl = inject('testDbUrl');

      // Set the DATABASE_URL environment variable for the dependency layer
      process.env.DATABASE_URL = dbUrl;
      console.log('DATABASE_URL', process.env.DATABASE_URL);
    });

    afterEach(async () => {
      const { schema } = await import('db/incentives');

      const client = postgres(dbUrl, { max: 1 });
      const db = drizzle(client, { schema });
      await truncateAllTables(db, dbUrl);
      await client.end();
    });
    afterAll(async () => {
      console.log('Values', values);
    });

    //TODO Output  for dfp2 coming nearly twice the amount expected
    it(
      'should process snapshot for defiplaza xrd-dfp2 holders',
      { retry: 0, timeout: 300000 },
      async () => {
        const testAccounts = await getAccountHoldersForResource(
          DefiPlazaConstants.XRDPool.baseLpResourceAddress,
        );

        const testAccounts2 = await getAccountHoldersForResource(
          DefiPlazaConstants.XRDPool.quoteLpResourceAddress,
        );

        const mergedAccounts = [...testAccounts, ...testAccounts2];

        const { totalWithinPriceBounds, totalOutsidePriceBounds, token } =
          await checkHoldingForPool(
            dbUrl,
            ActivityId['dp_lp_der_dfp2-xrd'],
            mergedAccounts,
          );

        values[ActivityId['dp_lp_der_dfp2-xrd']] = {
          totalWithinPriceBounds: totalWithinPriceBounds.toString(),
          totalOutsidePriceBounds: totalOutsidePriceBounds.toString(),
          token: token || '',
        };

        const result = await checkHoldingForPool(
          dbUrl,
          ActivityId['dp_lp_nat_dfp2-xrd'],
          mergedAccounts,
        );

        values[ActivityId['dp_lp_nat_dfp2-xrd']] = {
          totalWithinPriceBounds: result.totalWithinPriceBounds.toString(),
          totalOutsidePriceBounds: result.totalOutsidePriceBounds.toString(),
          token: result.token || '',
        };
      },
    );

    //TODO Output to include ignition holdings
    it(
      'should process snapshot for defiplaza xrd-xusdc holders',
      { retry: 0, timeout: 300000 },
      async () => {
        const testAccounts = await getAccountHoldersForResource(
          DefiPlazaConstants.xUSDCPool.baseLpResourceAddress,
        );

        const testAccounts2 = await getAccountHoldersForResource(
          DefiPlazaConstants.xUSDCPool.quoteLpResourceAddress,
        );

        const mergedAccounts = [...testAccounts, ...testAccounts2];

        const { totalWithinPriceBounds, totalOutsidePriceBounds, token } =
          await checkHoldingForPool(
            dbUrl,
            ActivityId['dp_lp_sta_xrd-xusdc'],
            mergedAccounts,
          );

        values[ActivityId['dp_lp_sta_xrd-xusdc']] = {
          totalWithinPriceBounds: totalWithinPriceBounds.toString(),
          totalOutsidePriceBounds: totalOutsidePriceBounds.toString(),
          token: token || '',
        };

        const result2 = await checkHoldingForPool(
          dbUrl,
          ActivityId['dp_lp_der_xrd-xusdc'],
          mergedAccounts,
        );

        values[ActivityId['dp_lp_der_xrd-xusdc']] = {
          totalWithinPriceBounds: result2.totalWithinPriceBounds.toString(),
          totalOutsidePriceBounds: result2.totalOutsidePriceBounds.toString(),
          token: result2.token || '',
        };
      },
    );

    //TODO Output to include ignition holdings
    it(
      'should process snapshot for defiplaza xrd-xusdt holders',
      { retry: 0, timeout: 300000 },
      async () => {
        const testAccounts = await getAccountHoldersForResource(
          DefiPlazaConstants.xUSDTPool.baseLpResourceAddress,
        );

        const testAccounts2 = await getAccountHoldersForResource(
          DefiPlazaConstants.xUSDTPool.quoteLpResourceAddress,
        );

        const mergedAccounts = [...testAccounts, ...testAccounts2];

        const { totalWithinPriceBounds, totalOutsidePriceBounds, token } =
          await checkHoldingForPool(
            dbUrl,
            ActivityId['dp_lp_sta_xrd-xusdt'],
            mergedAccounts,
          );

        values[ActivityId['dp_lp_sta_xrd-xusdt']] = {
          totalWithinPriceBounds: totalWithinPriceBounds.toString(),
          totalOutsidePriceBounds: totalOutsidePriceBounds.toString(),
          token: token || '',
        };

        const result2 = await checkHoldingForPool(
          dbUrl,
          ActivityId['dp_lp_der_xrd-xusdt'],
          mergedAccounts,
        );

        values[ActivityId['dp_lp_der_xrd-xusdt']] = {
          totalWithinPriceBounds: result2.totalWithinPriceBounds.toString(),
          totalOutsidePriceBounds: result2.totalOutsidePriceBounds.toString(),
          token: result2.token || '',
        };
      },
    );

    //TODO Output to include ignition holdings
    it(
      'should process snapshot for defiplaza xrd-xwbtc holders',
      { retry: 0, timeout: 300000 },
      async () => {
        const testAccounts = await getAccountHoldersForResource(
          DefiPlazaConstants.xwBTCPool.baseLpResourceAddress,
        );

        const testAccounts2 = await getAccountHoldersForResource(
          DefiPlazaConstants.xwBTCPool.quoteLpResourceAddress,
        );

        const mergedAccounts = [...testAccounts, ...testAccounts2];

        const { totalWithinPriceBounds, totalOutsidePriceBounds, token } =
          await checkHoldingForPool(
            dbUrl,
            ActivityId['dp_lp_blu_xrd-xwbtc'],
            mergedAccounts,
          );

        values[ActivityId['dp_lp_blu_xrd-xwbtc']] = {
          totalWithinPriceBounds: totalWithinPriceBounds.toString(),
          totalOutsidePriceBounds: totalOutsidePriceBounds.toString(),
          token: token || '',
        };

        const result2 = await checkHoldingForPool(
          dbUrl,
          ActivityId['dp_lp_der_xrd-xwbtc'],
          mergedAccounts,
        );

        values[ActivityId['dp_lp_der_xrd-xwbtc']] = {
          totalWithinPriceBounds: result2.totalWithinPriceBounds.toString(),
          totalOutsidePriceBounds: result2.totalOutsidePriceBounds.toString(),
          token: result2.token || '',
        };
      },
    );

    //TODO Output to include ignition holdings
    it(
      'should process snapshot for defiplaza xrd-xeth holders',
      { retry: 0, timeout: 300000 },
      async () => {
        const testAccounts = await getAccountHoldersForResource(
          DefiPlazaConstants.xETHPool.baseLpResourceAddress,
        );

        const testAccounts2 = await getAccountHoldersForResource(
          DefiPlazaConstants.xETHPool.quoteLpResourceAddress,
        );

        const mergedAccounts = [...testAccounts, ...testAccounts2];

        const { totalWithinPriceBounds, totalOutsidePriceBounds, token } =
          await checkHoldingForPool(
            dbUrl,
            ActivityId['dp_lp_blu_xeth-xrd'],
            mergedAccounts,
          );

        values[ActivityId['dp_lp_blu_xeth-xrd']] = {
          totalWithinPriceBounds: totalWithinPriceBounds.toString(),
          totalOutsidePriceBounds: totalOutsidePriceBounds.toString(),
          token: token || '',
        };

        const result2 = await checkHoldingForPool(
          dbUrl,
          ActivityId['dp_lp_der_xeth-xrd'],
          mergedAccounts,
        );

        values[ActivityId['dp_lp_der_xeth-xrd']] = {
          totalWithinPriceBounds: result2.totalWithinPriceBounds.toString(),
          totalOutsidePriceBounds: result2.totalOutsidePriceBounds.toString(),
          token: result2.token || '',
        };
      },
    );

    //TODO Output needs to verified
    it(
      'should process snapshot for defiplaza AstroL holders',
      { retry: 0, timeout: 300000 },
      async () => {
        const testAccounts = await getAccountHoldersForResource(
          DefiPlazaConstants.ASTRLPool.baseLpResourceAddress,
        );

        const testAccounts2 = await getAccountHoldersForResource(
          DefiPlazaConstants.ASTRLPool.quoteLpResourceAddress,
        );

        const mergedAccounts = [...testAccounts, ...testAccounts2];

        const { totalWithinPriceBounds, totalOutsidePriceBounds, token } =
          await checkHoldingForPool(
            dbUrl,
            ActivityId['dp_lp_nat_astrl-dfp2'],
            mergedAccounts,
          );

        values[ActivityId['dp_lp_nat_astrl-dfp2']] = {
          totalWithinPriceBounds: totalWithinPriceBounds.toString(),
          totalOutsidePriceBounds: totalOutsidePriceBounds.toString(),
          token: token || '',
        };
      },
    );
  },
);
