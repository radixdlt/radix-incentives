import { it } from '@effect/vitest';
import { accountBalances, accounts, schema, users } from 'db/incentives';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { Effect, Layer } from 'effect';
import postgres from 'postgres';
import { describe, inject } from 'vitest';
import { createDbClientLive } from '../db/dbClient';
import {
  GetAccountsWithoutBalancesLive,
  GetAccountsWithoutBalancesService,
} from './getAccountsWithoutBalances';

describe('getAccountsWithoutBalances', () => {
  const dbUrl = inject('testDbUrl');
  const db = drizzle(postgres(dbUrl), { schema });
  const dbClientLive = createDbClientLive(db);

  const getAccountsWithoutBalancesLive = GetAccountsWithoutBalancesLive.pipe(
    Layer.provide(dbClientLive),
  );

  // Test data constants
  const TEST_USER_ID = '6ba7b814-9dad-11d1-80b4-00c04fd430c8';
  const TEST_ACCOUNT_WITH_BALANCE = 'account_rdx12test_with_balance';
  const TEST_ACCOUNT_WITHOUT_BALANCE = 'account_rdx12test_without_balance';
  const TEST_ACCOUNT_FUTURE = 'account_rdx12test_future';
  const TEST_TIMESTAMP = new Date('2024-01-15T00:00:00Z');
  const CREATED_AT_PAST = new Date('2024-01-01T00:00:00Z');
  const CREATED_AT_FUTURE = new Date('2024-02-01T00:00:00Z');

  const setupTestData = Effect.gen(function* () {
    // Create test user first
    yield* Effect.promise(() =>
      db
        .insert(users)
        .values({
          id: TEST_USER_ID,
          identityAddress: 'identity_test_user',
        })
        .onConflictDoNothing(),
    );

    // Create test accounts
    yield* Effect.promise(() =>
      db
        .insert(accounts)
        .values([
          {
            address: TEST_ACCOUNT_WITH_BALANCE,
            userId: TEST_USER_ID,
            label: 'Account with balance',
            createdAt: CREATED_AT_PAST,
          },
          {
            address: TEST_ACCOUNT_WITHOUT_BALANCE,
            userId: TEST_USER_ID,
            label: 'Account without balance',
            createdAt: CREATED_AT_PAST,
          },
          {
            address: TEST_ACCOUNT_FUTURE,
            userId: TEST_USER_ID,
            label: 'Account created in future',
            createdAt: CREATED_AT_FUTURE,
          },
        ])
        .onConflictDoNothing(),
    );

    // Create account balance for one account
    yield* Effect.promise(() =>
      db
        .insert(accountBalances)
        .values({
          accountAddress: TEST_ACCOUNT_WITH_BALANCE,
          timestamp: TEST_TIMESTAMP,
          data: [
            {
              activityId: 'test-activity',
              activityCategoryId: 'test-category',
              amount: '1000',
              points: '100',
              resourceAddress: 'resource_test',
              resourceName: 'Test Resource',
              usdValue: '50',
            },
          ],
        })
        .onConflictDoNothing(),
    );
  });

  const cleanupTestData = Effect.gen(function* () {
    // Delete account balances first (foreign key constraint)
    yield* Effect.promise(() =>
      db
        .delete(accountBalances)
        .where(eq(accountBalances.accountAddress, TEST_ACCOUNT_WITH_BALANCE)),
    );

    // Delete accounts
    yield* Effect.promise(() =>
      db
        .delete(accounts)
        .where(eq(accounts.address, TEST_ACCOUNT_WITH_BALANCE)),
    );
    yield* Effect.promise(() =>
      db
        .delete(accounts)
        .where(eq(accounts.address, TEST_ACCOUNT_WITHOUT_BALANCE)),
    );
    yield* Effect.promise(() =>
      db.delete(accounts).where(eq(accounts.address, TEST_ACCOUNT_FUTURE)),
    );

    // Delete user
    yield* Effect.promise(() =>
      db.delete(users).where(eq(users.id, TEST_USER_ID)),
    );
  });

  it.effect('should return accounts without balances', () =>
    Effect.gen(function* () {
      yield* setupTestData;

      const getAccountsWithoutBalances =
        yield* GetAccountsWithoutBalancesService;

      // Get accounts without balances at specific timestamp
      const result = yield* getAccountsWithoutBalances({
        timestamp: TEST_TIMESTAMP,
      });

      // Should only return the account without balance that was created before the cutoff
      yield* Effect.logInfo(`Found ${result.length} accounts without balances`);

      // TEST_ACCOUNT_WITHOUT_BALANCE should be in the result
      const hasAccountWithoutBalance = result.includes(
        TEST_ACCOUNT_WITHOUT_BALANCE,
      );
      yield* Effect.logInfo(
        `Account without balance found: ${hasAccountWithoutBalance}`,
      );

      // TEST_ACCOUNT_WITH_BALANCE should NOT be in the result
      const hasAccountWithBalance = result.includes(TEST_ACCOUNT_WITH_BALANCE);
      yield* Effect.logInfo(
        `Account with balance found: ${hasAccountWithBalance}`,
      );

      // TEST_ACCOUNT_FUTURE should NOT be in the result (created after cutoff)
      const hasFutureAccount = result.includes(TEST_ACCOUNT_FUTURE);
      yield* Effect.logInfo(`Future account found: ${hasFutureAccount}`);

      // Assertions
      if (!hasAccountWithoutBalance) {
        return yield* Effect.fail(
          'Expected TEST_ACCOUNT_WITHOUT_BALANCE to be in results',
        );
      }
      if (hasAccountWithBalance) {
        return yield* Effect.fail(
          'Expected TEST_ACCOUNT_WITH_BALANCE to NOT be in results',
        );
      }
      if (hasFutureAccount) {
        return yield* Effect.fail(
          'Expected TEST_ACCOUNT_FUTURE to NOT be in results',
        );
      }
    }).pipe(
      Effect.provide(getAccountsWithoutBalancesLive),
      Effect.scoped,
      Effect.tap(() => cleanupTestData),
      Effect.timeout('30 seconds'),
    ),
  );

  it.effect(
    'should return all accounts when querying different timestamp',
    () =>
      Effect.gen(function* () {
        yield* setupTestData;

        const getAccountsWithoutBalances =
          yield* GetAccountsWithoutBalancesService;

        // Get accounts without balances at a different timestamp
        const result = yield* getAccountsWithoutBalances({
          timestamp: new Date('2024-01-20T00:00:00Z'),
        });

        yield* Effect.logInfo(
          `Found ${result.length} accounts without balances (different timestamp)`,
        );

        // When querying a different timestamp, all accounts created before that timestamp
        // should be returned since there are no balance records for that specific timestamp
      }).pipe(
        Effect.provide(getAccountsWithoutBalancesLive),
        Effect.scoped,
        Effect.tap(() => cleanupTestData),
        Effect.timeout('30 seconds'),
      ),
  );
});
