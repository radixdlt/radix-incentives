import { ActivityCategoryId, ActivityId, activityData } from 'data';
import { accountBalances, accounts } from 'db/incentives';
import { inArray, sql } from 'drizzle-orm';
import { Config, DateTime, Effect } from 'effect';
import { chunker } from '../../common';
import { Thresholds } from '../../common/config/constants';
import { DbService } from '../db/dbClient';

/**
 * Service for deactivating accounts with XRD balance below threshold
 */
export class DeactivateInactiveAccountsService extends Effect.Service<DeactivateInactiveAccountsService>()(
  'DeactivateInactiveAccountsService',
  {
    dependencies: [DbService.Default],
    effect: Effect.gen(function* () {
      const db = yield* DbService;

      const BATCH_SIZE = yield* Config.number('CLEANUP_BATCH_SIZE').pipe(
        Config.withDefault(1000),
      );

      // Get all XRD holding activity IDs (maintainXrdBalance category)
      const xrdHoldingActivityIds = new Set(
        activityData
          .filter((a) => a.categoryId === ActivityCategoryId.maintainXrdBalance)
          .map((a) => a.activityId),
      );

      return Effect.fn(function* () {
        yield* Effect.log(
          'Starting deactivation of inactive accounts (XRD balance < $1)',
        );

        // Build the list of XRD holding activity IDs for the SQL query
        const xrdActivityIdsArray = Array.from(xrdHoldingActivityIds);

        // If no XRD holding activities are defined, skip deactivation
        if (xrdActivityIdsArray.length === 0) {
          yield* Effect.log(
            'No XRD holding activities defined, skipping deactivation',
          );
          return { deactivatedCount: 0, accounts: [] };
        }

        // Single query to efficiently deactivate all users:
        // 1. Get latest snapshot for each account using DISTINCT ON
        // 2. Extract XRD balances from the JSONB data array
        // 3. Identify users where ALL enabled accounts have recent snapshots
        // 4. Group by user to sum total XRD holdings
        // 5. Filters users below threshold
        // 6. Returns all enabled accounts for those users
        //
        // IMPORTANT: We only process users where ALL their enabled accounts have snapshots.
        // If some accounts are missing snapshots (e.g., due to snapshotting issues), we skip
        // that user entirely rather than partially deactivating their accounts. This ensures
        // we only deactivate when we have complete data.
        const accountsToDeactivate = yield* db.use((db) =>
          db.execute<{ address: string }>(sql`
            WITH latest_snapshots AS (
              SELECT DISTINCT ON (account_address)
                account_address,
                data
              FROM ${accountBalances}
              WHERE timestamp > NOW() - INTERVAL '24 hours'
              ORDER BY account_address, timestamp DESC
            ),
            expanded_data AS (
              SELECT
                ls.account_address,
                elem->>'activityId' as activity_id,
                CAST(elem->>'usdValue' AS DECIMAL) as usd_value
              FROM latest_snapshots ls,
              LATERAL jsonb_array_elements(ls.data) as elem
            ),
            account_xrd_values AS (
              SELECT
                account_address,
                COALESCE(SUM(usd_value), 0) as xrd_value
              FROM expanded_data
              WHERE activity_id = ANY(ARRAY[${sql.join(
                xrdActivityIdsArray.map((id) => sql`${id}`),
                sql`, `,
              )}]::text[])
              GROUP BY account_address
            ),
            users_with_all_snapshots AS (
              SELECT
                a.user_id,
                COUNT(*) as total_enabled_accounts,
                COUNT(ls.account_address) as accounts_with_snapshots
              FROM ${accounts} a
              LEFT JOIN latest_snapshots ls ON a.address = ls.account_address
              WHERE a.snapshot_enabled = true
              GROUP BY a.user_id
              HAVING COUNT(*) = COUNT(ls.account_address)
            ),
            user_xrd_totals AS (
              SELECT
                a.user_id,
                SUM(COALESCE(axv.xrd_value, 0)) as total_xrd_value
              FROM ${accounts} a
              INNER JOIN users_with_all_snapshots uwas ON a.user_id = uwas.user_id
              LEFT JOIN account_xrd_values axv ON a.address = axv.account_address
              GROUP BY a.user_id
              HAVING SUM(COALESCE(axv.xrd_value, 0)) < ${Thresholds.ACCOUNT_INACTIVITY_THRESHOLD}
            )
            SELECT a.address
            FROM ${accounts} a
            INNER JOIN user_xrd_totals uxt ON a.user_id = uxt.user_id
            WHERE a.snapshot_enabled = true
          `),
        );

        const accountAddresses = accountsToDeactivate.map((row) => row.address);

        if (accountAddresses.length === 0) {
          yield* Effect.log('No accounts to deactivate');
          return { deactivatedCount: 0, accounts: [] };
        }

        yield* Effect.log(
          `Deactivating ${accountAddresses.length} accounts with XRD balance < $1, processing in batches of ${BATCH_SIZE}`,
        );

        // Deactivate accounts in batches
        const accountBatches = chunker(accountAddresses, BATCH_SIZE);

        for (const [index, batch] of accountBatches.entries()) {
          yield* Effect.log(
            `Deactivating batch ${index + 1}/${accountBatches.length} (${batch.length} accounts)`,
          );

          yield* db.use((db) =>
            db
              .update(accounts)
              .set({ snapshotEnabled: false })
              .where(inArray(accounts.address, batch)),
          );
        }

        // Insert zero-value snapshots for deactivated accounts in batches
        const now = DateTime.unsafeNow().pipe(DateTime.toDate);

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

        const snapshotBatches = chunker(snapshotEntries, BATCH_SIZE);

        for (const [index, batch] of snapshotBatches.entries()) {
          yield* Effect.log(
            `Inserting zero-value snapshots batch ${index + 1}/${snapshotBatches.length} (${batch.length} snapshots)`,
          );

          yield* db.use((db) => db.insert(accountBalances).values(batch));
        }

        yield* Effect.log(
          `Deactivated ${accountAddresses.length} accounts and inserted zero-value snapshots`,
        );

        return {
          deactivatedCount: accountAddresses.length,
          accounts: accountAddresses,
        };
      });
    }),
  },
) {}

export const DeactivateInactiveAccountsServiceLive =
  DeactivateInactiveAccountsService.Default;
