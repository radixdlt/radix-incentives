import { marginAccounts } from 'db/incentives';
import { and, desc, eq, inArray, isNull, lte, or, sql } from 'drizzle-orm';
import { Effect } from 'effect';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';

export type InsertMarginAccountOwnershipInput = {
  marginAccountAddress: string;
  recoveryAccountAddress: string | null;
  collateralAccountAddress: string | null;
  tradingAccountAddress: string | null;
  stateVersion: number;
};

export class MarginAccountDbService extends Effect.Service<MarginAccountDbService>()(
  'MarginAccountDbService',
  {
    dependencies: [dbClientLive],
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;

      return {
        // Check if a margin account exists (any ownership record)
        getMarginAccount: Effect.fn(function* (marginAccountAddress: string) {
          return yield* Effect.tryPromise({
            try: () =>
              db
                .select()
                .from(marginAccounts)
                .where(
                  eq(marginAccounts.marginAccountAddress, marginAccountAddress),
                )
                .limit(1),
            catch: (error) => new DbError(error),
          });
        }),

        // Upsert margin account ownership record(s) - accepts single input or array (max 50)
        upsertMarginAccountOwnership: Effect.fn(function* (
          input:
            | InsertMarginAccountOwnershipInput
            | InsertMarginAccountOwnershipInput[],
        ) {
          const inputs = Array.isArray(input) ? input : [input];

          if (inputs.length === 0) {
            return;
          }

          if (inputs.length > 50) {
            yield* Effect.fail(
              new DbError(
                new Error('Cannot upsert more than 50 margin accounts at once'),
              ),
            );
            return;
          }

          return yield* Effect.tryPromise({
            try: () =>
              db
                .insert(marginAccounts)
                .values(
                  inputs.map((item) => ({
                    marginAccountAddress: item.marginAccountAddress,
                    recoveryAccountAddress: item.recoveryAccountAddress,
                    collateralAccountAddress: item.collateralAccountAddress,
                    tradingAccountAddress: item.tradingAccountAddress,
                    stateVersion: item.stateVersion,
                  })),
                )
                .onConflictDoUpdate({
                  target: [
                    marginAccounts.marginAccountAddress,
                    marginAccounts.stateVersion,
                  ],
                  set: {
                    recoveryAccountAddress: sql`excluded.recovery_account_address`,
                    collateralAccountAddress: sql`excluded.collateral_account_address`,
                    tradingAccountAddress: sql`excluded.trading_account_address`,
                  },
                }),
            catch: (error) => new DbError(error),
          });
        }),

        // Get the trading account address that was active at a specific state version
        // Returns trading account, or falls back to recovery account if trading account is null
        // Returns null if no ownership record exists at or before the target state version
        getTradingAccountAtStateVersion: Effect.fn(function* (
          marginAccountAddress: string,
          targetStateVersion: number,
        ) {
          return yield* Effect.tryPromise({
            try: () =>
              db
                .select({
                  tradingAccountAddress: marginAccounts.tradingAccountAddress,
                  recoveryAccountAddress: marginAccounts.recoveryAccountAddress,
                })
                .from(marginAccounts)
                .where(
                  and(
                    eq(
                      marginAccounts.marginAccountAddress,
                      marginAccountAddress,
                    ),
                    lte(marginAccounts.stateVersion, targetStateVersion),
                  ),
                )
                .orderBy(desc(marginAccounts.stateVersion))
                .limit(1),
            catch: (error) => new DbError(error),
          }).pipe(
            Effect.map((result) => {
              if (result.length === 0) {
                return null;
              }
              const record = result[0]!;
              // Return trading account if available, otherwise fall back to recovery account
              return (
                record.tradingAccountAddress || record.recoveryAccountAddress
              );
            }),
          );
        }),

        // Get the total count of unique margin accounts
        getCount: () =>
          Effect.gen(function* () {
            return yield* Effect.tryPromise({
              try: () =>
                db
                  .select({
                    count:
                      sql`COUNT(DISTINCT ${marginAccounts.marginAccountAddress})`.as(
                        'count',
                      ),
                  })
                  .from(marginAccounts),
              catch: (error) => new DbError(error),
            }).pipe(Effect.map((results) => Number(results[0]?.count) || 0));
          }),

        // Get the collateral account address for a margin account at a specific state version
        // Returns collateral account, or falls back to recovery account if collateral account is null
        // Returns null if no ownership record exists at or before the target state version
        getCollateralAccountAtStateVersion: Effect.fn(function* (
          marginAccountAddress: string,
          targetStateVersion: number,
        ) {
          return yield* Effect.tryPromise({
            try: () =>
              db
                .select({
                  collateralAccountAddress:
                    marginAccounts.collateralAccountAddress,
                  recoveryAccountAddress: marginAccounts.recoveryAccountAddress,
                })
                .from(marginAccounts)
                .where(
                  and(
                    eq(
                      marginAccounts.marginAccountAddress,
                      marginAccountAddress,
                    ),
                    lte(marginAccounts.stateVersion, targetStateVersion),
                  ),
                )
                .orderBy(desc(marginAccounts.stateVersion))
                .limit(1),
            catch: (error) => new DbError(error),
          }).pipe(
            Effect.map((result) => {
              if (result.length === 0) {
                return null;
              }
              const record = result[0]!;
              // Return collateral account if available, otherwise fall back to recovery account
              return (
                record.collateralAccountAddress || record.recoveryAccountAddress
              );
            }),
          );
        }),

        // Get multiple margin accounts by their addresses
        getMarginAccountsByAddresses: Effect.fn(function* (
          marginAccountAddresses: string[],
        ) {
          if (marginAccountAddresses.length === 0) {
            return [];
          }

          return yield* Effect.tryPromise({
            try: () =>
              db
                .select()
                .from(marginAccounts)
                .where(
                  inArray(
                    marginAccounts.marginAccountAddress,
                    marginAccountAddresses,
                  ),
                )
                .orderBy(
                  marginAccounts.marginAccountAddress,
                  desc(marginAccounts.stateVersion),
                ),
            catch: (error) => new DbError(error),
          });
        }),

        // Get margin accounts by collateral addresses for efficient batch processing
        // Returns the latest margin account for each collateral address at the target state version
        // If a margin account has no collateral account, falls back to recovery account
        getMarginAccountsByCollateralAddresses: Effect.fn(function* (
          collateralAddresses: string[],
          targetStateVersion: number,
        ) {
          if (collateralAddresses.length === 0) {
            return [];
          }

          return yield* Effect.tryPromise({
            try: () =>
              db
                .selectDistinctOn([marginAccounts.marginAccountAddress], {
                  marginAccountAddress: marginAccounts.marginAccountAddress,
                  collateralAccountAddress:
                    marginAccounts.collateralAccountAddress,
                  recoveryAccountAddress: marginAccounts.recoveryAccountAddress,
                  tradingAccountAddress: marginAccounts.tradingAccountAddress,
                  stateVersion: marginAccounts.stateVersion,
                })
                .from(marginAccounts)
                .where(
                  and(
                    or(
                      // Primary case: collateral account is in the list
                      inArray(
                        marginAccounts.collateralAccountAddress,
                        collateralAddresses,
                      ),
                      // Fallback case: collateral account is null AND recovery account is in the list
                      and(
                        isNull(marginAccounts.collateralAccountAddress),
                        inArray(
                          marginAccounts.recoveryAccountAddress,
                          collateralAddresses,
                        ),
                      ),
                    ),
                    lte(marginAccounts.stateVersion, targetStateVersion),
                  ),
                )
                .orderBy(
                  marginAccounts.marginAccountAddress,
                  desc(marginAccounts.stateVersion),
                ),
            catch: (error) => new DbError(error),
          }).pipe(
            Effect.map((results) =>
              results
                .filter(
                  (result) =>
                    // Include if collateral account exists, or if recovery account exists as fallback
                    result.collateralAccountAddress !== null ||
                    result.recoveryAccountAddress !== null,
                )
                .map((result) => ({
                  marginAccountAddress: result.marginAccountAddress,
                  // Use collateral account if available, otherwise fall back to recovery account
                  collateralAccountAddress:
                    result.collateralAccountAddress ||
                    result.recoveryAccountAddress!,
                  recoveryAccountAddress: result.recoveryAccountAddress,
                  tradingAccountAddress: result.tradingAccountAddress,
                  stateVersion: result.stateVersion,
                })),
            ),
          );
        }),
      };
    }),
  },
) {}

export const MarginAccountDbServiceLive = MarginAccountDbService.Default;
