import { it } from '@effect/vitest';
import { marginAccounts, schema } from 'db/incentives';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { Effect } from 'effect';
import postgres from 'postgres';
import { beforeEach, describe, expect, inject } from 'vitest';
import { truncateAllTables } from '../../integration-tests/utils';
import { createDbClientLive } from '../db/dbClient';
import { MarginAccountDbService } from './marginAccountDbService';

describe('MarginAccountDbService', () => {
  const dbUrl = inject('testDbUrl');
  const client = postgres(dbUrl, { max: 1 });
  const db = drizzle(client, { schema });
  const dbClientLive = createDbClientLive(db);

  beforeEach(async () => {
    await truncateAllTables(db, dbUrl);
  });

  describe('getMarginAccountsByCollateralAddresses', () => {
    it.effect(
      'should return empty array when no collateral addresses provided',
      () =>
        Effect.gen(function* () {
          const marginAccountService = yield* MarginAccountDbService;

          const result =
            yield* marginAccountService.getMarginAccountsByCollateralAddresses(
              [],
              1000,
            );

          expect(result).toEqual([]);
        }).pipe(
          Effect.provide(MarginAccountDbService.Default),
          Effect.provide(dbClientLive),
        ),
    );

    it.effect(
      'should return margin account for exact collateral address match',
      () =>
        Effect.gen(function* () {
          const marginAccountService = yield* MarginAccountDbService;

          // Insert test data
          yield* Effect.promise(() =>
            db.insert(marginAccounts).values({
              marginAccountAddress: 'margin_account_1',
              recoveryAccountAddress: 'recovery_account_1',
              collateralAccountAddress: 'collateral_account_1',
              tradingAccountAddress: 'trading_account_1',
              stateVersion: 100,
            }),
          );

          const result =
            yield* marginAccountService.getMarginAccountsByCollateralAddresses(
              ['collateral_account_1'],
              1000,
            );

          expect(result).toHaveLength(1);
          expect(result[0]).toMatchObject({
            marginAccountAddress: 'margin_account_1',
            collateralAccountAddress: 'collateral_account_1',
            recoveryAccountAddress: 'recovery_account_1',
            tradingAccountAddress: 'trading_account_1',
            stateVersion: 100,
          });
        }).pipe(
          Effect.provide(MarginAccountDbService.Default),
          Effect.provide(dbClientLive),
        ),
    );

    it.effect(
      'should fallback to recovery account when collateral account is null',
      () =>
        Effect.gen(function* () {
          const marginAccountService = yield* MarginAccountDbService;

          // Insert margin account with null collateral address
          yield* Effect.promise(() =>
            db.insert(marginAccounts).values({
              marginAccountAddress: 'margin_account_fallback',
              recoveryAccountAddress: 'recovery_account_fallback',
              collateralAccountAddress: null,
              tradingAccountAddress: 'trading_account_fallback',
              stateVersion: 200,
            }),
          );

          const result =
            yield* marginAccountService.getMarginAccountsByCollateralAddresses(
              ['recovery_account_fallback'],
              1000,
            );

          expect(result).toHaveLength(1);
          expect(result[0]).toMatchObject({
            marginAccountAddress: 'margin_account_fallback',
            collateralAccountAddress: 'recovery_account_fallback', // Fallback to recovery account
            recoveryAccountAddress: 'recovery_account_fallback',
            tradingAccountAddress: 'trading_account_fallback',
            stateVersion: 200,
          });
        }).pipe(
          Effect.provide(MarginAccountDbService.Default),
          Effect.provide(dbClientLive),
        ),
    );

    it.effect(
      'should return latest valid state version for each margin account at target state version',
      () =>
        Effect.gen(function* () {
          const marginAccountService = yield* MarginAccountDbService;

          // Insert multiple state versions for the same margin account
          yield* Effect.promise(() =>
            db.insert(marginAccounts).values([
              {
                marginAccountAddress: 'margin_account_versioned',
                recoveryAccountAddress: 'recovery_account_versioned',
                collateralAccountAddress: 'collateral_account_versioned',
                tradingAccountAddress: 'trading_account_versioned_v1',
                stateVersion: 100,
              },
              {
                marginAccountAddress: 'margin_account_versioned',
                recoveryAccountAddress: 'recovery_account_versioned',
                collateralAccountAddress: 'collateral_account_versioned',
                tradingAccountAddress: 'trading_account_versioned_v2',
                stateVersion: 200,
              },
              {
                marginAccountAddress: 'margin_account_versioned',
                recoveryAccountAddress: 'recovery_account_versioned',
                collateralAccountAddress: 'collateral_account_versioned',
                tradingAccountAddress: 'trading_account_versioned_v3',
                stateVersion: 300,
              },
            ]),
          );

          // Query at state version 250 - should get version 200 record (highest <= 250)
          const result =
            yield* marginAccountService.getMarginAccountsByCollateralAddresses(
              ['collateral_account_versioned'],
              250,
            );

          expect(result).toHaveLength(1);
          expect(result[0]).toMatchObject({
            marginAccountAddress: 'margin_account_versioned',
            tradingAccountAddress: 'trading_account_versioned_v2',
            stateVersion: 200,
          });
        }).pipe(
          Effect.provide(MarginAccountDbService.Default),
          Effect.provide(dbClientLive),
        ),
    );

    it.effect(
      'should respect target state version boundary and exclude future records',
      () =>
        Effect.gen(function* () {
          const marginAccountService = yield* MarginAccountDbService;

          yield* Effect.promise(() =>
            db.insert(marginAccounts).values([
              {
                marginAccountAddress: 'margin_account_early',
                recoveryAccountAddress: 'recovery_early',
                collateralAccountAddress: 'collateral_early',
                tradingAccountAddress: 'trading_early',
                stateVersion: 100,
              },
              {
                marginAccountAddress: 'margin_account_late',
                recoveryAccountAddress: 'recovery_late',
                collateralAccountAddress: 'collateral_late',
                tradingAccountAddress: 'trading_late',
                stateVersion: 500,
              },
            ]),
          );

          // Query at state version 300 - should only get the early account
          const result =
            yield* marginAccountService.getMarginAccountsByCollateralAddresses(
              ['collateral_early', 'collateral_late'],
              300,
            );

          expect(result).toHaveLength(1);
          expect(result[0]).toMatchObject({
            marginAccountAddress: 'margin_account_early',
            stateVersion: 100,
          });
        }).pipe(
          Effect.provide(MarginAccountDbService.Default),
          Effect.provide(dbClientLive),
        ),
    );

    it.effect(
      'should handle mixed primary and fallback cases efficiently',
      () =>
        Effect.gen(function* () {
          const marginAccountService = yield* MarginAccountDbService;

          yield* Effect.promise(() =>
            db.insert(marginAccounts).values([
              // Primary case: collateral account match
              {
                marginAccountAddress: 'margin_account_mixed_1',
                recoveryAccountAddress: 'recovery_mixed_1',
                collateralAccountAddress: 'collateral_mixed_1',
                tradingAccountAddress: 'trading_mixed_1',
                stateVersion: 100,
              },
              // Another primary case
              {
                marginAccountAddress: 'margin_account_mixed_2',
                recoveryAccountAddress: 'recovery_mixed_2',
                collateralAccountAddress: 'collateral_mixed_2',
                tradingAccountAddress: 'trading_mixed_2',
                stateVersion: 200,
              },
              // Fallback case: null collateral, recovery account match
              {
                marginAccountAddress: 'margin_account_mixed_3',
                recoveryAccountAddress: 'recovery_mixed_3',
                collateralAccountAddress: null,
                tradingAccountAddress: 'trading_mixed_3',
                stateVersion: 150,
              },
            ]),
          );

          // Search for multiple addresses including fallback case
          const result =
            yield* marginAccountService.getMarginAccountsByCollateralAddresses(
              ['collateral_mixed_1', 'collateral_mixed_2', 'recovery_mixed_3'], // recovery_mixed_3 is fallback for margin_account_mixed_3
              1000,
            );

          expect(result).toHaveLength(3);

          // Test the important edge case: searching by recovery address when collateral address exists should return nothing
          const resultSearchByRecovery =
            yield* marginAccountService.getMarginAccountsByCollateralAddresses(
              ['recovery_mixed_1'], // This should NOT match margin_account_mixed_1 because it has a non-null collateral address
              1000,
            );

          expect(resultSearchByRecovery).toHaveLength(0); // Should return no results - fallback only works when collateral is null

          const marginAccount1 = result.find(
            (r) => r.marginAccountAddress === 'margin_account_mixed_1',
          );
          const marginAccount2 = result.find(
            (r) => r.marginAccountAddress === 'margin_account_mixed_2',
          );
          const marginAccount3 = result.find(
            (r) => r.marginAccountAddress === 'margin_account_mixed_3',
          );

          expect(marginAccount1).toMatchObject({
            collateralAccountAddress: 'collateral_mixed_1',
            stateVersion: 100,
          });
          expect(marginAccount2).toMatchObject({
            collateralAccountAddress: 'collateral_mixed_2',
            stateVersion: 200,
          });
          expect(marginAccount3).toMatchObject({
            collateralAccountAddress: 'recovery_mixed_3', // Fallback to recovery account
            recoveryAccountAddress: 'recovery_mixed_3',
            stateVersion: 150,
          });
        }).pipe(
          Effect.provide(MarginAccountDbService.Default),
          Effect.provide(dbClientLive),
        ),
    );

    it.effect(
      'should handle ownership transition from collateral to recovery fallback',
      () =>
        Effect.gen(function* () {
          const marginAccountService = yield* MarginAccountDbService;

          // Scenario: margin account ownership changes over time from having collateral account to null
          yield* Effect.promise(() =>
            db.insert(marginAccounts).values([
              // Early version with collateral account
              {
                marginAccountAddress: 'margin_account_transition',
                recoveryAccountAddress: 'recovery_transition',
                collateralAccountAddress: 'collateral_transition',
                tradingAccountAddress: 'trading_transition_v1',
                stateVersion: 100,
              },
              // Later version with null collateral account (fallback to recovery)
              {
                marginAccountAddress: 'margin_account_transition',
                recoveryAccountAddress: 'recovery_transition',
                collateralAccountAddress: null,
                tradingAccountAddress: 'trading_transition_v2',
                stateVersion: 200,
              },
            ]),
          );

          // Test querying with collateral address at early state version
          const resultEarly =
            yield* marginAccountService.getMarginAccountsByCollateralAddresses(
              ['collateral_transition'],
              150,
            );

          expect(resultEarly).toHaveLength(1);
          expect(resultEarly[0]).toMatchObject({
            marginAccountAddress: 'margin_account_transition',
            collateralAccountAddress: 'collateral_transition',
            tradingAccountAddress: 'trading_transition_v1',
            stateVersion: 100,
          });

          // Test querying with recovery address (fallback) at later state version
          const resultLate =
            yield* marginAccountService.getMarginAccountsByCollateralAddresses(
              ['recovery_transition'],
              250,
            );

          expect(resultLate).toHaveLength(1);
          expect(resultLate[0]).toMatchObject({
            marginAccountAddress: 'margin_account_transition',
            collateralAccountAddress: 'recovery_transition', // Fallback to recovery account
            tradingAccountAddress: 'trading_transition_v2',
            stateVersion: 200,
          });
        }).pipe(
          Effect.provide(MarginAccountDbService.Default),
          Effect.provide(dbClientLive),
        ),
    );

    it.effect(
      'should not return margin accounts with future state versions',
      () =>
        Effect.gen(function* () {
          const marginAccountService = yield* MarginAccountDbService;

          yield* Effect.promise(() =>
            db.insert(marginAccounts).values({
              marginAccountAddress: 'margin_account_future',
              recoveryAccountAddress: 'recovery_future',
              collateralAccountAddress: 'collateral_future',
              tradingAccountAddress: 'trading_future',
              stateVersion: 1000,
            }),
          );

          // Query at earlier state version - should return no results
          const result =
            yield* marginAccountService.getMarginAccountsByCollateralAddresses(
              ['collateral_future'],
              500,
            );

          expect(result).toHaveLength(0);
        }).pipe(
          Effect.provide(MarginAccountDbService.Default),
          Effect.provide(dbClientLive),
        ),
    );

    it.effect(
      'should handle complex state version ordering with multiple margin accounts',
      () =>
        Effect.gen(function* () {
          const marginAccountService = yield* MarginAccountDbService;

          // Complex scenario with multiple margin accounts having overlapping state versions
          yield* Effect.promise(() =>
            db.insert(marginAccounts).values([
              // Margin account A - multiple versions
              {
                marginAccountAddress: 'margin_A',
                recoveryAccountAddress: 'recovery_A',
                collateralAccountAddress: 'collateral_A',
                tradingAccountAddress: 'trading_A_v1',
                stateVersion: 100,
              },
              {
                marginAccountAddress: 'margin_A',
                recoveryAccountAddress: 'recovery_A',
                collateralAccountAddress: 'collateral_A',
                tradingAccountAddress: 'trading_A_v2',
                stateVersion: 300,
              },
              // Margin account B - single version
              {
                marginAccountAddress: 'margin_B',
                recoveryAccountAddress: 'recovery_B',
                collateralAccountAddress: 'collateral_B',
                tradingAccountAddress: 'trading_B',
                stateVersion: 200,
              },
              // Margin account C - fallback case
              {
                marginAccountAddress: 'margin_C',
                recoveryAccountAddress: 'recovery_C',
                collateralAccountAddress: null,
                tradingAccountAddress: 'trading_C',
                stateVersion: 250,
              },
            ]),
          );

          const result =
            yield* marginAccountService.getMarginAccountsByCollateralAddresses(
              ['collateral_A', 'collateral_B', 'recovery_C'],
              275, // Target state version
            );

          expect(result).toHaveLength(3);

          // Verify each result is the correct version for the target state version
          const marginA = result.find(
            (r) => r.marginAccountAddress === 'margin_A',
          );
          const marginB = result.find(
            (r) => r.marginAccountAddress === 'margin_B',
          );
          const marginC = result.find(
            (r) => r.marginAccountAddress === 'margin_C',
          );

          // Margin A should have version 100 (version 300 is > target 275)
          expect(marginA).toMatchObject({
            tradingAccountAddress: 'trading_A_v1',
            stateVersion: 100,
          });

          // Margin B should have version 200
          expect(marginB).toMatchObject({
            tradingAccountAddress: 'trading_B',
            stateVersion: 200,
          });

          // Margin C should have version 250
          expect(marginC).toMatchObject({
            tradingAccountAddress: 'trading_C',
            stateVersion: 250,
            collateralAccountAddress: 'recovery_C', // Fallback to recovery account
          });
        }).pipe(
          Effect.provide(MarginAccountDbService.Default),
          Effect.provide(dbClientLive),
        ),
    );

    it.effect('should handle margin accounts with all null addresses', () =>
      Effect.gen(function* () {
        const marginAccountService = yield* MarginAccountDbService;

        yield* Effect.promise(() =>
          db.insert(marginAccounts).values({
            marginAccountAddress: 'margin_account_all_null',
            recoveryAccountAddress: null,
            collateralAccountAddress: null,
            tradingAccountAddress: null,
            stateVersion: 100,
          }),
        );

        // Should return no results because there's no valid fallback
        const result =
          yield* marginAccountService.getMarginAccountsByCollateralAddresses(
            ['any_address'],
            1000,
          );

        expect(result).toHaveLength(0);
      }).pipe(
        Effect.provide(MarginAccountDbService.Default),
        Effect.provide(dbClientLive),
      ),
    );

    it.effect(
      'should handle fallback failure when recovery address is null',
      () =>
        Effect.gen(function* () {
          const marginAccountService = yield* MarginAccountDbService;

          yield* Effect.promise(() =>
            db.insert(marginAccounts).values({
              marginAccountAddress: 'margin_account_no_fallback',
              recoveryAccountAddress: null, // No fallback available
              collateralAccountAddress: null, // Would need fallback
              tradingAccountAddress: 'trading_account_exists', // Trading exists but not used for lookup
              stateVersion: 200,
            }),
          );

          // Should return no results because fallback to recovery fails (recovery is null)
          const result =
            yield* marginAccountService.getMarginAccountsByCollateralAddresses(
              ['trading_account_exists'], // Try searching by trading account (should not match)
              1000,
            );

          expect(result).toHaveLength(0);

          // Should also return no results when searching by any other address
          const result2 =
            yield* marginAccountService.getMarginAccountsByCollateralAddresses(
              ['some_other_address'],
              1000,
            );

          expect(result2).toHaveLength(0);
        }).pipe(
          Effect.provide(MarginAccountDbService.Default),
          Effect.provide(dbClientLive),
        ),
    );

    it.effect(
      'should filter out margin accounts that do not meet fallback requirements',
      () =>
        Effect.gen(function* () {
          const marginAccountService = yield* MarginAccountDbService;

          // Insert multiple margin accounts with different null scenarios
          yield* Effect.promise(() =>
            db.insert(marginAccounts).values([
              // Valid collateral account - should be found
              {
                marginAccountAddress: 'margin_account_valid',
                recoveryAccountAddress: 'recovery_valid',
                collateralAccountAddress: 'collateral_valid',
                tradingAccountAddress: 'trading_valid',
                stateVersion: 100,
              },
              // Valid fallback case - should be found
              {
                marginAccountAddress: 'margin_account_fallback_valid',
                recoveryAccountAddress: 'recovery_fallback_valid',
                collateralAccountAddress: null,
                tradingAccountAddress: 'trading_fallback_valid',
                stateVersion: 150,
              },
              // Invalid: both collateral and recovery are null - should NOT be found
              {
                marginAccountAddress: 'margin_account_invalid',
                recoveryAccountAddress: null,
                collateralAccountAddress: null,
                tradingAccountAddress: 'trading_invalid',
                stateVersion: 200,
              },
            ]),
          );

          const result =
            yield* marginAccountService.getMarginAccountsByCollateralAddresses(
              [
                'collateral_valid',
                'recovery_fallback_valid',
                'trading_invalid',
              ], // Last one should not match
              1000,
            );

          // Should only find the first two, not the invalid one
          expect(result).toHaveLength(2);

          const marginAccountAddresses = result.map(
            (r) => r.marginAccountAddress,
          );
          expect(marginAccountAddresses).toContain('margin_account_valid');
          expect(marginAccountAddresses).toContain(
            'margin_account_fallback_valid',
          );
          expect(marginAccountAddresses).not.toContain(
            'margin_account_invalid',
          );
        }).pipe(
          Effect.provide(MarginAccountDbService.Default),
          Effect.provide(dbClientLive),
        ),
    );
  });

  describe('bulk operations', () => {
    describe('getMarginAccountsByAddresses', () => {
      it.effect('should return empty array when no addresses provided', () =>
        Effect.gen(function* () {
          const marginAccountService = yield* MarginAccountDbService;

          const result =
            yield* marginAccountService.getMarginAccountsByAddresses([]);

          expect(result).toEqual([]);
        }).pipe(
          Effect.provide(MarginAccountDbService.Default),
          Effect.provide(dbClientLive),
        ),
      );

      it.effect('should return margin accounts for provided addresses', () =>
        Effect.gen(function* () {
          const marginAccountService = yield* MarginAccountDbService;

          // Insert test data
          yield* Effect.promise(() =>
            db.insert(marginAccounts).values([
              {
                marginAccountAddress: 'margin_account_1',
                recoveryAccountAddress: 'recovery_1',
                collateralAccountAddress: 'collateral_1',
                tradingAccountAddress: 'trading_1',
                stateVersion: 100,
              },
              {
                marginAccountAddress: 'margin_account_2',
                recoveryAccountAddress: 'recovery_2',
                collateralAccountAddress: null,
                tradingAccountAddress: 'trading_2',
                stateVersion: 150,
              },
              {
                marginAccountAddress: 'margin_account_3',
                recoveryAccountAddress: 'recovery_3',
                collateralAccountAddress: 'collateral_3',
                tradingAccountAddress: 'trading_3',
                stateVersion: 200,
              },
            ]),
          );

          const result =
            yield* marginAccountService.getMarginAccountsByAddresses([
              'margin_account_1',
              'margin_account_2',
              'non_existent_account',
            ]);

          expect(result).toHaveLength(2);
          expect(result.map((r) => r.marginAccountAddress)).toEqual([
            'margin_account_1',
            'margin_account_2',
          ]);
        }).pipe(
          Effect.provide(MarginAccountDbService.Default),
          Effect.provide(dbClientLive),
        ),
      );

      it.effect(
        'should return results ordered by address and state version (desc)',
        () =>
          Effect.gen(function* () {
            const marginAccountService = yield* MarginAccountDbService;

            // Insert test data with multiple state versions for same account
            yield* Effect.promise(() =>
              db.insert(marginAccounts).values([
                {
                  marginAccountAddress: 'margin_account_1',
                  recoveryAccountAddress: 'recovery_1_old',
                  collateralAccountAddress: 'collateral_1_old',
                  tradingAccountAddress: 'trading_1_old',
                  stateVersion: 100,
                },
                {
                  marginAccountAddress: 'margin_account_1',
                  recoveryAccountAddress: 'recovery_1_new',
                  collateralAccountAddress: 'collateral_1_new',
                  tradingAccountAddress: 'trading_1_new',
                  stateVersion: 200,
                },
              ]),
            );

            const result =
              yield* marginAccountService.getMarginAccountsByAddresses([
                'margin_account_1',
              ]);

            expect(result).toHaveLength(2);
            // Should be ordered by state version desc (newest first)
            expect(result[0]!.stateVersion).toBe(200);
            expect(result[1]!.stateVersion).toBe(100);
          }).pipe(
            Effect.provide(MarginAccountDbService.Default),
            Effect.provide(dbClientLive),
          ),
      );
    });

    describe('upsertMarginAccountOwnership - flexible input', () => {
      it.effect('should handle single margin account input', () =>
        Effect.gen(function* () {
          const marginAccountService = yield* MarginAccountDbService;

          const singleInput = {
            marginAccountAddress: 'margin_account_single',
            recoveryAccountAddress: 'recovery_single',
            collateralAccountAddress: 'collateral_single',
            tradingAccountAddress: 'trading_single',
            stateVersion: 100,
          };

          yield* marginAccountService.upsertMarginAccountOwnership(singleInput);

          const result = yield* Effect.promise(() =>
            db
              .select()
              .from(marginAccounts)
              .where(
                eq(
                  marginAccounts.marginAccountAddress,
                  'margin_account_single',
                ),
              ),
          );

          expect(result).toHaveLength(1);
          expect(result[0]).toMatchObject({
            marginAccountAddress: 'margin_account_single',
            recoveryAccountAddress: 'recovery_single',
            collateralAccountAddress: 'collateral_single',
            tradingAccountAddress: 'trading_single',
            stateVersion: 100,
          });
        }).pipe(
          Effect.provide(MarginAccountDbService.Default),
          Effect.provide(dbClientLive),
        ),
      );

      it.effect('should handle empty input array', () =>
        Effect.gen(function* () {
          const marginAccountService = yield* MarginAccountDbService;

          yield* marginAccountService.upsertMarginAccountOwnership([]);

          // Should complete without error
          const result = yield* Effect.promise(() =>
            db.select().from(marginAccounts),
          );
          expect(result).toHaveLength(0);
        }).pipe(
          Effect.provide(MarginAccountDbService.Default),
          Effect.provide(dbClientLive),
        ),
      );

      it.effect('should insert new margin account ownership records', () =>
        Effect.gen(function* () {
          const marginAccountService = yield* MarginAccountDbService;

          const inputs = [
            {
              marginAccountAddress: 'margin_account_1',
              recoveryAccountAddress: 'recovery_1',
              collateralAccountAddress: 'collateral_1',
              tradingAccountAddress: 'trading_1',
              stateVersion: 100,
            },
            {
              marginAccountAddress: 'margin_account_2',
              recoveryAccountAddress: 'recovery_2',
              collateralAccountAddress: null,
              tradingAccountAddress: 'trading_2',
              stateVersion: 150,
            },
          ];

          yield* marginAccountService.upsertMarginAccountOwnership(inputs);

          const result = yield* Effect.promise(() =>
            db
              .select()
              .from(marginAccounts)
              .orderBy(marginAccounts.marginAccountAddress),
          );

          expect(result).toHaveLength(2);
          expect(result[0]!.marginAccountAddress).toBe('margin_account_1');
          expect(result[0]!.recoveryAccountAddress).toBe('recovery_1');
          expect(result[1]!.marginAccountAddress).toBe('margin_account_2');
          expect(result[1]!.collateralAccountAddress).toBe(null);
        }).pipe(
          Effect.provide(MarginAccountDbService.Default),
          Effect.provide(dbClientLive),
        ),
      );

      it.effect('should update existing records on conflict', () =>
        Effect.gen(function* () {
          const marginAccountService = yield* MarginAccountDbService;

          // Insert initial record
          yield* Effect.promise(() =>
            db.insert(marginAccounts).values({
              marginAccountAddress: 'margin_account_1',
              recoveryAccountAddress: 'recovery_old',
              collateralAccountAddress: 'collateral_old',
              tradingAccountAddress: 'trading_old',
              stateVersion: 100,
            }),
          );

          // Update with new values
          const inputs = [
            {
              marginAccountAddress: 'margin_account_1',
              recoveryAccountAddress: 'recovery_new',
              collateralAccountAddress: 'collateral_new',
              tradingAccountAddress: 'trading_new',
              stateVersion: 100, // Same state version triggers update
            },
          ];

          yield* marginAccountService.upsertMarginAccountOwnership(inputs);

          const result = yield* Effect.promise(() =>
            db.select().from(marginAccounts),
          );

          expect(result).toHaveLength(1);
          expect(result[0]!.recoveryAccountAddress).toBe('recovery_new');
          expect(result[0]!.collateralAccountAddress).toBe('collateral_new');
          expect(result[0]!.tradingAccountAddress).toBe('trading_new');
        }).pipe(
          Effect.provide(MarginAccountDbService.Default),
          Effect.provide(dbClientLive),
        ),
      );

      it.effect('should handle mix of inserts and updates', () =>
        Effect.gen(function* () {
          const marginAccountService = yield* MarginAccountDbService;

          // Insert initial record
          yield* Effect.promise(() =>
            db.insert(marginAccounts).values({
              marginAccountAddress: 'margin_account_1',
              recoveryAccountAddress: 'recovery_old',
              collateralAccountAddress: 'collateral_old',
              tradingAccountAddress: 'trading_old',
              stateVersion: 100,
            }),
          );

          // Mix of update and new insert
          const inputs = [
            {
              marginAccountAddress: 'margin_account_1',
              recoveryAccountAddress: 'recovery_updated',
              collateralAccountAddress: 'collateral_updated',
              tradingAccountAddress: 'trading_updated',
              stateVersion: 100, // Update existing
            },
            {
              marginAccountAddress: 'margin_account_2',
              recoveryAccountAddress: 'recovery_new',
              collateralAccountAddress: 'collateral_new',
              tradingAccountAddress: 'trading_new',
              stateVersion: 150, // New insert
            },
          ];

          yield* marginAccountService.upsertMarginAccountOwnership(inputs);

          const result = yield* Effect.promise(() =>
            db
              .select()
              .from(marginAccounts)
              .orderBy(marginAccounts.marginAccountAddress),
          );

          expect(result).toHaveLength(2);

          // Updated record
          expect(result[0]!.marginAccountAddress).toBe('margin_account_1');
          expect(result[0]!.recoveryAccountAddress).toBe('recovery_updated');

          // New record
          expect(result[1]!.marginAccountAddress).toBe('margin_account_2');
          expect(result[1]!.recoveryAccountAddress).toBe('recovery_new');
        }).pipe(
          Effect.provide(MarginAccountDbService.Default),
          Effect.provide(dbClientLive),
        ),
      );
    });
  });
});
