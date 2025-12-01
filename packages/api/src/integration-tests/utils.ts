import type { ResourceHoldersCollectionItem } from '@radixdlt/babylon-gateway-api-sdk';
import { BigNumber } from 'bignumber.js';
import type { ActivityId } from 'data';
import type { schema } from 'db/incentives';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Effect, Layer } from 'effect';
import postgres from 'postgres';
import { AddressValidationServiceLive } from '../common/address-validation/addressValidation.js';
import { GatewayApiClientLive } from '../common/gateway/gatewayApiClient.js';
import { GetResourceHoldersService } from '../common/gateway/getResourceHolders.js';
import { FetchService } from '../common/helpers/index.js';
import type { SnapshotWorkerInput } from '../incentives/snapshot/snapshotWorker.js';
import {
  GetUsdValueLive,
  GetUsdValueService,
} from '../incentives/token-price/getUsdValue.js';

/**
 * Truncates all tables in the database, respecting foreign key constraints
 * @param db - Database client
 * @param dbUrl - Database URL
 */
export const truncateAllTables = async (
  db: PostgresJsDatabase<typeof schema>,
  dbUrl: string,
) => {
  // Safety check: only allow truncation on localhost
  const databaseUrl = dbUrl;
  const isLocalhost = databaseUrl.includes('@localhost:') || !databaseUrl; // Allow if no URL (likely using testDbUrl from inject)

  if (!isLocalhost) {
    throw new Error(
      `Refusing to truncate tables: Database is not on localhost. URL: ${databaseUrl.replace(/\/\/.*@/, '//***@')}`,
    );
  }

  const { users, weeks, seasons, activityCategories, marginAccounts } =
    await import('db/incentives');

  console.log('Truncating all tables...');

  await db.delete(users);
  await db.delete(weeks);
  await db.delete(seasons);
  await db.delete(activityCategories);
  await db.delete(marginAccounts);

  console.log('All tables truncated successfully');
};

export const runSnapshotWorker = async (input: SnapshotWorkerInput) => {
  // Use dynamic import to load dependency layer after DATABASE_URL is set
  const { dependencyLayer } = await import('../incentives/dependencyLayer.js');
  return dependencyLayer.snapshotWorker(input);
};
export const createTestUserAndAccounts = async (
  db: PostgresJsDatabase<typeof schema>,
  accountAddresses: string[],
) => {
  const { accounts, users } = await import('db/incentives');
  // Create test user and accounts for the snapshot worker
  const TEST_USER_ID = '12345678-1234-1234-1234-123456789abc';
  const TEST_IDENTITY_ADDRESS =
    'identity_rdx1test12345678901234567890123456789012345678901234567890';

  await db
    .insert(users)
    .values([
      {
        id: TEST_USER_ID,
        identityAddress: TEST_IDENTITY_ADDRESS,
        label: 'Test User',
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(accounts)
    .values(
      accountAddresses.map((address) => ({
        userId: TEST_USER_ID,
        address: address,
        label: `Test Account ${address.slice(-8)}`,
      })),
    )
    .onConflictDoNothing();
  await new Promise((resolve) => setTimeout(resolve, 3000));
  console.log('Test user and accounts created');
};

/**
 * Gets account holders for a specific resource address
 * @param resourceAddress - The resource address to get holders for (e.g., resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf)
 * @returns Promise<string[]> - Array of account addresses that hold the resource
 */
export const getAccountHoldersForResource = async (
  resourceAddress: string,
): Promise<string[]> => {
  try {
    console.log(`Getting holders for resource: ${resourceAddress}`);

    // Set up the GetResourceHoldersService
    const getResourceHoldersEffect = Effect.provide(
      GetResourceHoldersService,
      GetResourceHoldersService.Default.pipe(
        Layer.provide(GatewayApiClientLive),
      ),
    );

    // Get resource holders
    const resourceHoldersEffect = Effect.gen(function* () {
      const getResourceHolders = yield* getResourceHoldersEffect;

      const result = yield* getResourceHolders({
        resourceAddress: resourceAddress,
      });

      return result;
    });

    const holders = await Effect.runPromise(resourceHoldersEffect);

    // Filter to only include account addresses (exclude component addresses)
    const accountHolders = holders
      .filter((holder: ResourceHoldersCollectionItem) =>
        holder.holder_address.startsWith('account_rdx'),
      )
      .map((holder: ResourceHoldersCollectionItem) => holder.holder_address);

    console.log(
      `Found ${accountHolders.length} account holders out of ${holders.length} total holders`,
    );

    return accountHolders;
  } catch (error) {
    console.error('Error getting account holders for resource:', error);
    throw error;
  }
};

export const getLendingHoldingUsdValue = async (
  client: postgres.Sql,
  activityId: ActivityId,
) => {
  // Check if account_balances table exists and what's in it
  const accountBalanceCount = await client`
            SELECT COUNT(*) as count FROM account_balances
            `;
  console.log(
    'Total records in account_balances:',
    accountBalanceCount[0]?.count,
  );

  const accountBalanceRowCount = await client`
            SELECT COUNT(*) as count FROM account_balances
            `;
  console.log(
    'Total records in account_balances:',
    accountBalanceRowCount[0]?.count,
  );

  type QueryResultRow = {
    timestamp: string;
    account_address: string;
    activity_id: string;
    usd_value: string;
  };
  // Now try our original query
  const queryResult: QueryResultRow[] = await client`
            SELECT 
                ab.timestamp,
                ab.account_address,
                activity_item->>'activityId' AS activity_id,
                (activity_item->>'usdValue')::decimal AS usd_value
            FROM account_balances ab
            CROSS JOIN jsonb_array_elements(ab.data) AS activity_item
            ORDER BY ab.account_address, activity_id
            `;

  //filter for the weft activity id
  const filteredQueryResult: QueryResultRow[] = queryResult.filter(
    (row) => row.activity_id === activityId,
  );
  console.log(
    `Found ${filteredQueryResult.length} account balance records for ${activityId}`,
  );

  console.log('First row:', filteredQueryResult[0]);
  console.log('Second row:', filteredQueryResult[1]);
  //sum up the usd_value for each account_address
  const totalUsdValue = filteredQueryResult.reduce(
    (acc: number, row: QueryResultRow) => acc + Number(row.usd_value),
    0,
  );
  console.log(`Total USD value for ${activityId}: ${totalUsdValue}`);
  return totalUsdValue;
};

export const getPoolHoldingQuantity = async (
  client: postgres.Sql,
  activityId: ActivityId,
) => {
  // Check if account_balances table exists and what's in it
  const accountBalanceCount = await client`
            SELECT COUNT(*) as count FROM account_balances
            `;
  console.log(
    'Total records in account_balances:',
    accountBalanceCount[0]?.count,
  );

  type PoolQueryResultRow = {
    timestamp: string;
    account_address: string;
    activity_id: string;
    usd_value: string;
    token: string | null;
    total_within_price_bounds: string | null;
    total_outside_price_bounds: string | null;
  };

  // print first 2 rows of account_balances
  const accountBalances = await client`
            SELECT * FROM account_balances
            WHERE account_address = 'account_rdx128mjf7c8ukgp9uwswmnkal2wj0ugzuv3gmuna2fzvntxweyu0e0jp0'
            ORDER BY timestamp DESC
            LIMIT 2
            `;
  console.log(
    'First 2 rows of account_balances:',
    JSON.stringify(accountBalances, null, 2),
  );

  // Query for pool data with base and quote token amounts
  const queryResult: PoolQueryResultRow[] = await client`
            SELECT 
                ab.timestamp,
                ab.account_address,
                activity_item->>'activityId' AS activity_id,
                (activity_item->>'usdValue')::decimal AS usd_value,
                activity_item->'metadata'->'items'->0->'tokens' AS token,
                activity_item->'metadata'->'quoteToken'->>'resourceAddress' AS quote_token_resource,
                (activity_item->'metadata'->'items'->0->>'totalWithinPriceBounds')::decimal AS total_within_price_bounds,
                (activity_item->'metadata'->'items'->0->>'totalOutsidePriceBounds')::decimal AS total_outside_price_bounds
            FROM account_balances ab
            CROSS JOIN jsonb_array_elements(ab.data) AS activity_item
            WHERE (activity_item->'metadata'->'baseToken' IS NOT NULL
              AND activity_item->'metadata'->'quoteToken' IS NOT NULL)
              OR (activity_item->'metadata'->'items' IS NOT NULL)
            ORDER BY ab.account_address, activity_id
            `;

  console.log('Total rows:', queryResult.length);
  //print first 3 rows
  console.log('First 3 rows:', queryResult.slice(0, 3));

  // Filter for the specific activity id
  const filteredQueryResult: PoolQueryResultRow[] = queryResult.filter(
    (row) => row.activity_id === activityId,
  );

  console.log(
    `Found ${filteredQueryResult.length} pool records for ${activityId}`,
  );

  console.log('First pool record:', filteredQueryResult[0]);
  console.log('Second pool record:', filteredQueryResult[1]);

  // Calculate totals

  const totalWithinPriceBounds = filteredQueryResult.reduce(
    (acc: number, row: PoolQueryResultRow) =>
      acc + Number(row.total_within_price_bounds || 0),
    0,
  );

  const totalOutsidePriceBounds = filteredQueryResult.reduce(
    (acc: number, row: PoolQueryResultRow) =>
      acc + Number(row.total_outside_price_bounds || 0),
    0,
  );

  console.log(
    `Total within price bounds for ${activityId}: ${totalWithinPriceBounds}`,
  );
  console.log(
    `Total outside price bounds for ${activityId}: ${totalOutsidePriceBounds}`,
  );

  return {
    totalWithinPriceBounds,
    totalOutsidePriceBounds,
    token: filteredQueryResult[0].token,
  };
};

export const getPriceForResource = async (
  resourceAddress: string,
  timestamp: Date,
) => {
  const getUsdValueProgram = Effect.provide(
    Effect.gen(function* () {
      const getUsdValueService = yield* GetUsdValueService;

      const xwbtcPrice = yield* getUsdValueService({
        amount: new BigNumber(1),
        resourceAddress: resourceAddress,
        timestamp: timestamp,
      });
      return xwbtcPrice;
    }),
    GetUsdValueLive.pipe(Layer.provide(AddressValidationServiceLive)).pipe(
      Layer.provide(FetchService.Default),
    ),
  );

  const price = await Effect.runPromise(getUsdValueProgram);
  return price;
};

export const checkHoldingForPool = async (
  dbUrl: string,
  activityId: ActivityId,
  testAccounts: string[],
) => {
  const { schema } = await import('db/incentives');

  const client = postgres(dbUrl, { max: 1 });
  const db = drizzle(client, { schema });

  await createTestUserAndAccounts(db, testAccounts);

  const timestamp = new Date();

  const snapshotInput: SnapshotWorkerInput = {
    timestamp: timestamp,
    jobId: `snapshot-holders-${activityId}`,
  };
  const result = await runSnapshotWorker(snapshotInput);

  console.log('Snapshot worker result:', result);
  if (result._tag === 'Failure') {
    console.error('Snapshot worker failed:', result.cause);
    throw result.cause;
  }

  const { totalWithinPriceBounds, totalOutsidePriceBounds, token } =
    await getPoolHoldingQuantity(client, activityId);

  console.log(
    `Total within price bounds for ${activityId}: ${totalWithinPriceBounds}`,
  );
  console.log(
    `Total outside price bounds for ${activityId}: ${totalOutsidePriceBounds}`,
  );

  return {
    totalWithinPriceBounds: totalWithinPriceBounds.toString(),
    totalOutsidePriceBounds: totalOutsidePriceBounds.toString(),
    token: token,
  };
};

export const checkHolding = async (
  dbUrl: string,
  asset: string,
  activityId: ActivityId,
  testAccounts: string[],
) => {
  const { schema } = await import('db/incentives');

  const client = postgres(dbUrl, { max: 1 });
  const db = drizzle(client, { schema });

  await createTestUserAndAccounts(db, testAccounts);

  const timestamp = new Date();
  const snapshotInput: SnapshotWorkerInput = {
    timestamp: timestamp,
    jobId: `snapshot-holders-${activityId}`,
  };
  const result = await runSnapshotWorker(snapshotInput);

  console.log('Snapshot worker result:', result);
  if (result._tag === 'Failure') {
    console.error('Snapshot worker failed:', result.cause);
    throw result.cause;
  }

  try {
    const price = await getPriceForResource(asset, timestamp);
    console.log('price:', price.toString());

    console.log('Getting total USD value for activity', activityId);
    const totalUsdValue = await getLendingHoldingUsdValue(client, activityId);
    console.log(`Total USD value for ${activityId}: ${totalUsdValue}`);

    console.log(`Price per unit: $${price.toString()}`);
    let estimatedTokens = 0;
    if (totalUsdValue && Number(totalUsdValue) > 0) {
      estimatedTokens = Number(totalUsdValue) / Number(price.toString());
      console.log(`Estimated tokens based on price: ${estimatedTokens}`);
    }
    return {
      totalUsdValue,
      price,
      estimatedTokens,
    };
  } finally {
    await client.end();
  }
};
