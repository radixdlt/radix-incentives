
import postgres from 'postgres';
import { checkHoldingForPool, getAccountHoldersForResource, truncateAllTables } from './utils';
import { drizzle } from 'drizzle-orm/postgres-js';
import { describe, it, afterEach, afterAll, beforeAll, inject } from 'vitest';
import { ActivityId, DefiPlazaConstants } from 'data';

describe('DefiPlaza Lending Holders Snapshot Test', () => {
    let dbUrl: string;
    process.env.SNAPSHOT_BATCH_SIZE = '1000';
    process.env.DEBUG_STORE_METADATA = 'true';
    const values: Record<string, { totalWithinPriceBounds: string, totalOutsidePriceBounds: string, token: string }> = {};

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

    it('should process snapshot for defiplaza xrd-dfp2 holders', { retry: 0, timeout: 300000 }, async () => {
        const testAccounts = await getAccountHoldersForResource(
            DefiPlazaConstants.XRDPool.baseLpResourceAddress,
        );

        const testAccounts2 = await getAccountHoldersForResource(
            DefiPlazaConstants.XRDPool.quoteLpResourceAddress,
        );

        const mergedAccounts = [...testAccounts, ...testAccounts2];

        const { totalWithinPriceBounds, totalOutsidePriceBounds, token } = await checkHoldingForPool(
            dbUrl,
            ActivityId['dp_lp_der_dfp2-xrd'],
            mergedAccounts,
        );

        values[ActivityId['dp_lp_der_dfp2-xrd']] = {
            totalWithinPriceBounds: totalWithinPriceBounds.toString(),
            totalOutsidePriceBounds: totalOutsidePriceBounds.toString(),
            token: token || ''
        };

        const result = await checkHoldingForPool(
            dbUrl,
            ActivityId['dp_lp_nat_dfp2-xrd'],
            mergedAccounts,
        );


        values[ActivityId['dp_lp_nat_dfp2-xrd']] = {
            totalWithinPriceBounds: result.totalWithinPriceBounds.toString(),
            totalOutsidePriceBounds: result.totalOutsidePriceBounds.toString(),
            token: result.token || ''
        };
    });

    it('should process snapshot for defiplaza xrd-xusdc holders', { retry: 0, timeout: 300000 }, async () => {
        const testAccounts = await getAccountHoldersForResource(
            DefiPlazaConstants.xUSDCPool.baseLpResourceAddress,
        );

        const testAccounts2 = await getAccountHoldersForResource(
            DefiPlazaConstants.xUSDCPool.quoteLpResourceAddress,
        );

        const mergedAccounts = [...testAccounts, ...testAccounts2];

        const { totalWithinPriceBounds, totalOutsidePriceBounds, token } = await checkHoldingForPool(
            dbUrl,
            ActivityId['dp_lp_sta_xrd-xusdc'],
            mergedAccounts,
        );

        values[ActivityId['dp_lp_sta_xrd-xusdc']] = {
            totalWithinPriceBounds: totalWithinPriceBounds.toString(),
            totalOutsidePriceBounds: totalOutsidePriceBounds.toString(),
            token: token || ''
        };

        const result2 = await checkHoldingForPool(
            dbUrl,
            ActivityId['dp_lp_der_xrd-xusdc'],
            mergedAccounts,
        );

        values[ActivityId['dp_lp_der_xrd-xusdc']] = {
            totalWithinPriceBounds: result2.totalWithinPriceBounds.toString(),
            totalOutsidePriceBounds: result2.totalOutsidePriceBounds.toString(),
            token: result2.token || ''
        };
    });
});