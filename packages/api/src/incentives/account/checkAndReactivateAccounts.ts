import { ActivityCategoryId, ActivityId, activityData } from 'data';
import { accountBalances, accounts } from 'db/incentives';
import { eq, inArray } from 'drizzle-orm';
import { DateTime, Effect } from 'effect';
import { Thresholds } from '../../common/config/constants';
import { GetLedgerStateService } from '../../common/gateway/getLedgerState';
import { UpsertAccountBalancesService } from '../account-balance/upsertAccountBalance';
import { GetAccountBalancesAtStateVersionV2 } from '../account-balance/v2/getAccountBalances';
import { DbService } from '../db/dbClient';

type CheckAndReactivateAccountsInput = {
  userId: string;
  /**
   * TEST ONLY: Override state version for integration tests.
   * This parameter is ignored in production and will throw an error if used outside test environment.
   */
  __testStateVersion?: number;
};

/**
 * Service to check XRD balance for all user accounts and reactivate if threshold is met.
 * Used for manual balance checks and when users link new accounts.
 */
export class CheckAndReactivateAccountsService extends Effect.Service<CheckAndReactivateAccountsService>()(
  'CheckAndReactivateAccountsService',
  {
    dependencies: [
      DbService.Default,
      GetLedgerStateService.Default,
      GetAccountBalancesAtStateVersionV2.Default,
      UpsertAccountBalancesService.Default,
    ],
    effect: Effect.gen(function* () {
      const db = yield* DbService;
      const getLedgerState = yield* GetLedgerStateService;
      const getAccountBalancesV2 = yield* GetAccountBalancesAtStateVersionV2;
      const upsertAccountBalances = yield* UpsertAccountBalancesService;

      // Get all XRD holding activity IDs (maintainXrdBalance category)
      const xrdHoldingActivityIds = new Set(
        activityData
          .filter((a) => a.categoryId === ActivityCategoryId.maintainXrdBalance)
          .map((a) => a.activityId),
      );

      return Effect.fn(function* (input: CheckAndReactivateAccountsInput) {
        // Guard: Prevent __testStateVersion from being used in production
        if (input.__testStateVersion !== undefined) {
          const isTestEnv =
            process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
          if (!isTestEnv) {
            return yield* Effect.die(
              '__testStateVersion can only be used in test environment',
            );
          }
        }

        yield* Effect.log(`Checking XRD balance for user: ${input.userId}`);

        // Get all accounts for this user
        const userAccounts = yield* db.use((db) =>
          db
            .select({ address: accounts.address })
            .from(accounts)
            .where(eq(accounts.userId, input.userId)),
        );

        if (userAccounts.length === 0) {
          yield* Effect.log('No accounts found for user');
          return {
            reactivated: false,
            totalXrdValue: 0,
            accountCount: 0,
            accountAddresses: [],
          };
        }

        const accountAddresses = userAccounts.map((a) => a.address);

        yield* Effect.log(`Found ${accountAddresses.length} accounts for user`);

        // Fetch current balances WITHOUT persisting to check threshold first
        const now = DateTime.unsafeNow().pipe(DateTime.toDate);

        let stateVersion: number;

        // Use test state version if provided (test mode only)
        if (input.__testStateVersion !== undefined) {
          yield* Effect.log(
            `Using test state version: ${input.__testStateVersion}`,
          );
          stateVersion = input.__testStateVersion;
        } else {
          yield* Effect.log(
            'Fetching current balances from blockchain (not persisting yet)',
          );

          // Get current ledger state
          const ledgerState = yield* getLedgerState({
            at_ledger_state: {
              timestamp: now,
            },
          });

          stateVersion = ledgerState.state_version;
        }

        // Fetch balances from Gateway without persisting
        const balancesResult = yield* getAccountBalancesV2({
          addresses: accountAddresses,
          stateVersion,
        });

        // Check if we have any balance data
        const balanceEntries = Object.entries(balancesResult);
        if (balanceEntries.length === 0) {
          yield* Effect.log('No balance data fetched from blockchain');
          return {
            reactivated: false,
            totalXrdValue: 0,
            accountCount: accountAddresses.length,
            accountAddresses,
          };
        }

        // Calculate total XRD value across all accounts from fetched data
        let totalXrdValue = 0;

        for (const [_address, activities] of balanceEntries) {
          for (const [activityId, usdValue] of Object.entries(activities)) {
            if (xrdHoldingActivityIds.has(activityId)) {
              totalXrdValue += Number.parseFloat(usdValue);
            }
          }
        }

        yield* Effect.log(
          `Total XRD value across all accounts: $${totalXrdValue.toFixed(2)}`,
        );

        // Check if threshold is met
        if (totalXrdValue >= Thresholds.ACCOUNT_INACTIVITY_THRESHOLD) {
          yield* Effect.log(
            `Threshold met ($${Thresholds.ACCOUNT_INACTIVITY_THRESHOLD}), reactivating ${accountAddresses.length} accounts and persisting snapshot`,
          );

          // Now that we know threshold is met, persist the snapshot data
          const snapshotData = balanceEntries.map(([address, activities]) => ({
            accountAddress: address,
            timestamp: now,
            data: Object.entries(activities).map(([activityId, usdValue]) => ({
              activityId,
              usdValue,
            })),
          }));

          yield* upsertAccountBalances(snapshotData);

          // Reactivate all accounts
          yield* db.use((db) =>
            db
              .update(accounts)
              .set({ snapshotEnabled: true })
              .where(inArray(accounts.address, accountAddresses)),
          );

          return {
            reactivated: true,
            totalXrdValue,
            accountCount: accountAddresses.length,
            accountAddresses,
          };
        }

        // Threshold not met - disable accounts and insert zero-value snapshots as safety measure
        yield* Effect.log(
          `Threshold not met (${totalXrdValue} < ${Thresholds.ACCOUNT_INACTIVITY_THRESHOLD}), disabling accounts and inserting zero-value snapshots`,
        );

        // Disable all accounts
        yield* db.use((db) =>
          db
            .update(accounts)
            .set({ snapshotEnabled: false })
            .where(inArray(accounts.address, accountAddresses)),
        );

        const allActivityIds = Object.keys(ActivityId);
        const zeroValueData = allActivityIds.map((activityId) => ({
          activityId,
          usdValue: '0',
        }));

        const snapshotEntries = accountAddresses.map((address) => ({
          accountAddress: address,
          timestamp: now,
          data: zeroValueData,
        }));

        yield* db.use((db) =>
          db.insert(accountBalances).values(snapshotEntries),
        );

        yield* Effect.log(
          `Disabled ${accountAddresses.length} accounts and inserted zero-value snapshots`,
        );

        return {
          reactivated: false,
          totalXrdValue,
          accountCount: accountAddresses.length,
          accountAddresses,
        };
      });
    }),
  },
) {}

export const CheckAndReactivateAccountsServiceLive =
  CheckAndReactivateAccountsService.Default;
