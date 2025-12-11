import { ActivityId, Assets, SurgeConstants } from 'data';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { afterAll, afterEach, beforeAll, describe, inject, it } from 'vitest';
import {
  checkHolding,
  getAccountHoldersForResource,
  truncateAllTables,
} from './utils';

describe.skipIf(process.env.SKIP_INTEGRATION_TESTS === 'true')(
  'Surgelp Lending Holders Snapshot Test',
  () => {
    let dbUrl: string;
    process.env.SNAPSHOT_BATCH_SIZE = '1000';

    const values: Record<
      string,
      { totalUsdValue: string; price: string; estimatedTokens: number }
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
      const db: PostgresJsDatabase<typeof schema> = drizzle(client, {
        schema,
      });
      await truncateAllTables(db, dbUrl);
      await client.end();
    });

    afterAll(async () => {
      console.log('Values', values);
    });

    it(
      'should process snapshot for root surg holder ',
      { retry: 0, timeout: 300000 },
      async () => {
        const testAccounts = await getAccountHoldersForResource(
          SurgeConstants.slp.resourceAddress,
        );

        const { totalUsdValue, price, estimatedTokens } = await checkHolding(
          dbUrl,
          Assets.Fungible.xUSDC,
          ActivityId.su_lp_sta_susd,
          testAccounts,
        );
        values[ActivityId.su_lp_sta_susd] = {
          totalUsdValue: totalUsdValue.toString(),
          price: price.toString(),
          estimatedTokens,
        };
      },
    );
  },
);
