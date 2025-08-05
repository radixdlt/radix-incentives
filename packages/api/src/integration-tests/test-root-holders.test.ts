import postgres from 'postgres';
import { checkHolding, getAccountHoldersForResource, truncateAllTables } from './utils';
import { drizzle } from 'drizzle-orm/postgres-js';
import { describe, it, afterEach, beforeAll, inject } from 'vitest';
import { RootFinanceConstants } from 'data/src/dapps/rootFinance/constants';
import { ActivityId, Assets } from 'data';

describe('Root Lending Holders Snapshot Test', () => {
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


    it('should process snapshot for root xusdc holders', { retry: 0, timeout: 300000 }, async () => {

        const testAccounts = await getAccountHoldersForResource(
            RootFinanceConstants.receiptResourceAddress,
        );

        const { totalUsdValue, price, estimatedTokens } = await checkHolding(
            dbUrl,
            Assets.Fungible.xUSDC,
            ActivityId.ro_le_sta_xusdc,
            testAccounts,
        );
        values[ActivityId.ro_le_sta_xusdc] = {
            totalUsdValue: totalUsdValue.toString(),
            price: price.toString(),
            estimatedTokens,
        };
    });

    it('should process snapshot for root xETH holders', { retry: 0, timeout: 300000 }, async () => {

        const testAccounts = await getAccountHoldersForResource(
            RootFinanceConstants.receiptResourceAddress,
        );

        const { totalUsdValue, price, estimatedTokens } = await checkHolding(
            dbUrl,
            Assets.Fungible.xETH,
            ActivityId.ro_le_blu_xeth,
            testAccounts,
        );
        values[ActivityId.ro_le_blu_xeth] = {
            totalUsdValue: totalUsdValue.toString(),
            price: price.toString(),
            estimatedTokens,
        };
    });

    it('should process snapshot for root xwbtc holders', { retry: 0, timeout: 300000 }, async () => {

        const testAccounts = await getAccountHoldersForResource(
            RootFinanceConstants.receiptResourceAddress,
        );

        const { totalUsdValue, price, estimatedTokens } = await checkHolding(
            dbUrl,
            Assets.Fungible.wxBTC,
            ActivityId.ro_le_blu_xwbtc,
            testAccounts,
        );
        values[ActivityId.ro_le_blu_xwbtc] = {
            totalUsdValue: totalUsdValue.toString(),
            price: price.toString(),
            estimatedTokens,
        };
    });

    it('should process snapshot for root xrd holders', { retry: 0, timeout: 300000 }, async () => {
        const testAccounts = await getAccountHoldersForResource(
            RootFinanceConstants.receiptResourceAddress,
        );


        const { totalUsdValue, price, estimatedTokens } = await checkHolding(
            dbUrl,
            Assets.Fungible.XRD,
            ActivityId.ro_le_der_xrd,
            testAccounts,
        );

        values[ActivityId.ro_le_der_xrd] = {
            totalUsdValue: totalUsdValue.toString(),
            price: price.toString(),
            estimatedTokens,
        };
    });

    it('should process snapshot for root xUSDT holders', { retry: 0, timeout: 300000 }, async () => {
        const testAccounts = await getAccountHoldersForResource(
            RootFinanceConstants.receiptResourceAddress,
        );

        const { totalUsdValue, price, estimatedTokens } = await checkHolding(
            dbUrl,
            Assets.Fungible.xUSDT,
            ActivityId.ro_le_sta_xusdt,
            testAccounts,
        );

        values[ActivityId.ro_le_sta_xusdt] = {
            totalUsdValue: totalUsdValue.toString(),
            price: price.toString(),
            estimatedTokens,
        };
    });

    it('should process snapshot for root lsulp holders', { retry: 0, timeout: 300000 }, async () => {
        const testAccounts = await getAccountHoldersForResource(
            RootFinanceConstants.receiptResourceAddress,
        );

        const { totalUsdValue, price, estimatedTokens } = await checkHolding(
            dbUrl,
            Assets.Fungible.LSULP,
            ActivityId.ro_le_der_lsulp,
            testAccounts,
        );

        values[ActivityId.ro_le_der_lsulp] = {
            totalUsdValue: totalUsdValue.toString(),
            price: price.toString(),
            estimatedTokens,
        };
    });
}); 