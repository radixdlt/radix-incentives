import { layer } from '@effect/vitest';
import { accounts, users } from 'db/incentives';
import { eq } from 'drizzle-orm';
import { Effect, Logger } from 'effect';
import { truncateTables } from '../../test-helpers/truncateTables';
import { DbService } from '../db/dbClient';
import { CheckAndReactivateAccountsService } from './checkAndReactivateAccounts';

/**
 * Integration tests for CheckAndReactivateAccountsService using real blockchain data.
 *
 * These tests use a fixed state version (419574584) to ensure deterministic results.
 * The accounts used have known XRD balances at this state version.
 */

const TEST_STATE_VERSION = 419574584;

const testSetup = (
  identityAddress: string,
  accountAddresses: string[],
  snapshotEnabled = false,
) =>
  Effect.gen(function* () {
    const db = yield* DbService;

    const data = yield* db.use(async (db) => {
      // Create test user
      const [user] = await db
        .insert(users)
        .values({ identityAddress })
        .returning();

      // Create accounts (disabled by default for reactivation tests)
      const createdAccounts = await db
        .insert(accounts)
        .values(
          accountAddresses.map((address, idx) => ({
            userId: user.id,
            address,
            label: `Account ${idx + 1}`,
            snapshotEnabled,
          })),
        )
        .returning();

      return { user, accounts: createdAccounts };
    });

    return data;
  });

layer(CheckAndReactivateAccountsService.Default)(
  'CheckAndReactivateAccountsService Integration Tests',
  (it) => {
    // Use beforeAll instead of beforeEach to avoid concurrent truncation deadlocks
    beforeAll(async () => {
      await truncateTables();
    }, 30_000); // 30 second timeout for database setup

    it.effect(
      'should reactivate account with multiple XRD activities that sum >= $1',
      () =>
        Effect.gen(function* () {
          const service = yield* CheckAndReactivateAccountsService;
          const db = yield* DbService;

          // This account has 2 XRD activities, both needed to reach $1 threshold
          const accountAddress =
            'account_rdx129ky0qmad6p7k0x5ck94dsyxgz4fjsg8w6cxx5dekz6yvg2mmcwgsx';

          const { user } = yield* testSetup('user_single_account', [
            accountAddress,
          ]);

          // Verify account starts disabled
          const accountBefore = yield* db.use((db) =>
            db
              .select()
              .from(accounts)
              .where(eq(accounts.address, accountAddress))
              .then((results) => results[0]),
          );
          expect(accountBefore?.snapshotEnabled).toBe(false);

          // Check and reactivate using fixed state version
          const result = yield* service({
            userId: user.id,
            stateVersion: TEST_STATE_VERSION,
          });

          // Should reactivate (both activities together >= $1)
          expect(result.reactivated).toBe(true);
          expect(result.totalXrdValue).toBeGreaterThanOrEqual(1);
          expect(result.accountCount).toBe(1);
          expect(result.accountAddresses).toContain(accountAddress);

          // Verify account is now enabled
          const accountAfter = yield* db.use((db) =>
            db
              .select()
              .from(accounts)
              .where(eq(accounts.address, accountAddress))
              .then((results) => results[0]),
          );
          expect(accountAfter?.snapshotEnabled).toBe(true);
        }).pipe(
          Effect.provide(Logger.pretty),
          Effect.provide(DbService.Default),
        ),
      60_000, // 60 second timeout for Gateway API calls
    );

    it.effect(
      'should reactivate multiple accounts when combined XRD >= $1',
      () =>
        Effect.gen(function* () {
          const service = yield* CheckAndReactivateAccountsService;
          const db = yield* DbService;

          // These two accounts individually have < $1, but combined >= $1
          const account1 =
            'account_rdx12ywgk7hjfg2pyc3670p6ew7py40r9tlefj47fnugxmp4vm845l4mc7';
          const account2 =
            'account_rdx12x9r8u2tucsslq6judslyqzz5tujax2j2gecgs84gfl37vpshnyxpy';

          const { user } = yield* testSetup('user_multiple_accounts', [
            account1,
            account2,
          ]);

          // Verify accounts start disabled
          const accountsBefore = yield* db.use((db) =>
            db.select().from(accounts).where(eq(accounts.userId, user.id)),
          );
          for (const account of accountsBefore) {
            expect(account.snapshotEnabled).toBe(false);
          }

          // Check and reactivate using fixed state version
          const result = yield* service({
            userId: user.id,
            stateVersion: TEST_STATE_VERSION,
          });

          // Should reactivate (combined >= $1)
          expect(result.reactivated).toBe(true);
          expect(result.totalXrdValue).toBeGreaterThanOrEqual(1);
          expect(result.accountCount).toBe(2);
          expect(result.accountAddresses).toContain(account1);
          expect(result.accountAddresses).toContain(account2);

          // Verify both accounts are now enabled
          const accountsAfter = yield* db.use((db) =>
            db.select().from(accounts).where(eq(accounts.userId, user.id)),
          );
          for (const account of accountsAfter) {
            expect(account.snapshotEnabled).toBe(true);
          }
        }).pipe(
          Effect.provide(Logger.pretty),
          Effect.provide(DbService.Default),
        ),
      60_000, // 60 second timeout for Gateway API calls
    );

    it.effect(
      'should not reactivate single account with XRD < $1',
      () =>
        Effect.gen(function* () {
          const service = yield* CheckAndReactivateAccountsService;
          const db = yield* DbService;

          // This account has < $1 on its own
          const accountAddress =
            'account_rdx129zryfdcuyvwl00rxkscec24re8wts0526fqqfphuv37n9z0cyd307';

          const { user } = yield* testSetup('user_insufficient_single', [
            accountAddress,
          ]);

          // Verify account starts disabled
          const accountBefore = yield* db.use((db) =>
            db
              .select()
              .from(accounts)
              .where(eq(accounts.address, accountAddress))
              .then((results) => results[0]),
          );
          expect(accountBefore?.snapshotEnabled).toBe(false);

          // Check balance using fixed state version
          const result = yield* service({
            userId: user.id,
            stateVersion: TEST_STATE_VERSION,
          });

          // Should NOT reactivate (< $1)
          expect(result.reactivated).toBe(false);
          expect(result.totalXrdValue).toBeLessThan(1);
          expect(result.accountCount).toBe(1);
          expect(result.accountAddresses).toContain(accountAddress);

          // Verify account remains disabled
          const accountAfter = yield* db.use((db) =>
            db
              .select()
              .from(accounts)
              .where(eq(accounts.address, accountAddress))
              .then((results) => results[0]),
          );
          expect(accountAfter?.snapshotEnabled).toBe(false);
        }).pipe(
          Effect.provide(Logger.pretty),
          Effect.provide(DbService.Default),
        ),
      60_000, // 60 second timeout for Gateway API calls
    );
  },
);
