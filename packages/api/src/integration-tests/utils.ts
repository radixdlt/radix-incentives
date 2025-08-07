import type { ResourceHoldersCollectionItem } from '@radixdlt/babylon-gateway-api-sdk';
import { BigNumber } from 'bignumber.js';
import { Effect, Layer } from 'effect';
import { AddressValidationServiceLive } from '../common/address-validation/addressValidation.js';
import { GatewayApiClientLive } from '../common/gateway/gatewayApiClient.js';
import { GetResourceHoldersService } from '../common/gateway/getResourceHolders.js';
import {
  GetUsdValueLive,
  GetUsdValueService,
} from '../incentives/token-price/getUsdValue.js';

/**
 * Truncates all tables in the database, respecting foreign key constraints
 * @param db - Database client
 * @param dbUrl - Database URL
 */
// biome-ignore lint/suspicious/noExplicitAny: Database type varies between test environments
export const truncateAllTables = async (db: any, dbUrl: string) => {
  // Safety check: only allow truncation on localhost
  const databaseUrl = dbUrl;
  const isLocalhost = databaseUrl.includes('@localhost:') || !databaseUrl; // Allow if no URL (likely using testDbUrl from inject)

  if (!isLocalhost) {
    throw new Error(
      `Refusing to truncate tables: Database is not on localhost. URL: ${databaseUrl.replace(/\/\/.*@/, '//***@')}`,
    );
  }

  const { users, weeks, seasons, activityCategories } = await import(
    'db/incentives'
  );

  console.log('Truncating all tables...');

  await db.delete(users);
  await db.delete(weeks);
  await db.delete(seasons);
  await db.delete(activityCategories);

  console.log('All tables truncated successfully');
};

export const createTestUserAndAccounts = async (
  // biome-ignore lint/suspicious/noExplicitAny: Database client type not easily accessible
  db: any,
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
    // return [];
  }
};

export const getTotalUsdValueForActivity = async (
  // biome-ignore lint/suspicious/noExplicitAny: PostgreSQL client type not easily accessible
  client: any,
  weftActivityId: string,
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
  const weftQueryResult: QueryResultRow[] = queryResult.filter(
    (row) => row.activity_id === weftActivityId,
  );
  console.log(
    `Found ${weftQueryResult.length} account balance records for ${weftActivityId}`,
  );

  //sum up the usd_value for each account_address
  const totalUsdValue = weftQueryResult.reduce(
    (acc: number, row: QueryResultRow) => acc + Number(row.usd_value),
    0,
  );
  console.log(`Total USD value for ${weftActivityId}: ${totalUsdValue}`);
  return totalUsdValue;
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
    GetUsdValueLive.pipe(Layer.provide(AddressValidationServiceLive)),
  );

  const price = await Effect.runPromise(getUsdValueProgram);
  return price;
};
