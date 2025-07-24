import { describe, inject } from "vitest";
import { Effect, Layer } from "effect";
import { it } from "@effect/vitest";
import { createDbClientLive } from "../db/dbClient";
import { UserActivityPointsService } from "./userActivityPoints";
import { drizzle } from "drizzle-orm/postgres-js";
import BigNumber from "bignumber.js";
import { eq } from "drizzle-orm";

import {
  schema,
  users,
  accounts,
  accountActivityPoints,
  seasonPointsMultiplier,
} from "db/incentives";
import postgres from "postgres";

// TODO: Fix this test
describe.skip(
  "UserActivityPointsService",
  {
    timeout: 30_000,
  },
  () => {
    const dbUrl = inject("testDbUrl");
    const client = postgres(dbUrl);
    const db = drizzle(client, { schema });
    const dbLive = createDbClientLive(db);

    // Test data constants - using valid UUIDs
    const WEEK_ID = "30da196b-7602-4b06-a558-bbb5b5441186";
    const ACTIVITY_ID = "c9_hold_xrd-xusdc";
    const USER_1 = "11111111-1111-1111-1111-111111111111";
    const USER_2 = "22222222-2222-2222-2222-222222222222";
    const USER_3 = "33333333-3333-3333-3333-333333333333";
    const USER_4 = "44444444-4444-4444-4444-444444444444";
    const ACCOUNT_1 =
      "account_rdx12y7q2482p0dcnqh5gzxc7hgxr9fq2mdp8lcf3mnr2mwynbls5v";
    const ACCOUNT_2 =
      "account_rdx12x4u9wldswk5lzufz7ub25ch5w2h8xjs7rykqce0vckkcq3y7w";
    const ACCOUNT_3 =
      "account_rdx12xkm8qzxn5t3j8h4w2xvxvqz5p9q7y8m6n4r5s3t1a9b2c3d4e";
    const ACCOUNT_4 =
      "account_rdx12zlm9qvxn6t4j9h5w2xvxvqz6p0q8y9m7n5r6s4t2a0b3c4d5e";

    const setupTestData = Effect.fn(function* () {
      // Create users
      yield* Effect.promise(() =>
        db
          .insert(users)
          .values([
            { id: USER_1, identityAddress: `identity_${USER_1}` },
            { id: USER_2, identityAddress: `identity_${USER_2}` },
            { id: USER_3, identityAddress: `identity_${USER_3}` },
            { id: USER_4, identityAddress: `identity_${USER_4}` },
          ])
          .onConflictDoNothing()
      );

      // Create accounts
      yield* Effect.promise(() =>
        db
          .insert(accounts)
          .values([
            { address: ACCOUNT_1, userId: USER_1, label: "Account 1" },
            { address: ACCOUNT_2, userId: USER_2, label: "Account 2" },
            { address: ACCOUNT_3, userId: USER_3, label: "Account 3" },
            { address: ACCOUNT_4, userId: USER_4, label: "Account 4" },
          ])
          .onConflictDoNothing()
      );

      // Create season points multiplier data
      yield* Effect.promise(() =>
        db
          .insert(seasonPointsMultiplier)
          .values([
            {
              userId: USER_1,
              weekId: WEEK_ID,
              totalTWABalance: "100", // Above minimum
              cumulativeTWABalance: "100",
              multiplier: "1.5",
            },
            {
              userId: USER_2,
              weekId: WEEK_ID,
              totalTWABalance: "75", // Above minimum
              cumulativeTWABalance: "75",
              multiplier: "1.2",
            },
            {
              userId: USER_3,
              weekId: WEEK_ID,
              totalTWABalance: "200", // Above minimum
              cumulativeTWABalance: "200",
              multiplier: "2.0",
            },
            {
              userId: USER_4,
              weekId: WEEK_ID,
              totalTWABalance: "25", // Below minimum of 50
              cumulativeTWABalance: "25",
              multiplier: "1.0",
            },
          ])
          .onConflictDoNothing()
      );

      // Create account activity points
      yield* Effect.promise(() =>
        db
          .insert(accountActivityPoints)
          .values([
            {
              accountAddress: ACCOUNT_1,
              weekId: WEEK_ID,
              activityId: ACTIVITY_ID,
              activityPoints: "250",
            },
            {
              accountAddress: ACCOUNT_2,
              weekId: WEEK_ID,
              activityId: ACTIVITY_ID,
              activityPoints: "150",
            },
            {
              accountAddress: ACCOUNT_3,
              weekId: WEEK_ID,
              activityId: ACTIVITY_ID,
              activityPoints: "300",
            },
            {
              accountAddress: ACCOUNT_4,
              weekId: WEEK_ID,
              activityId: ACTIVITY_ID,
              activityPoints: "80", // This user has low TWA balance
            },
          ])
          .onConflictDoNothing()
      );
    });

    const cleanupTestData = Effect.gen(function* () {
      yield* Effect.promise(() => db.delete(accountActivityPoints));
      yield* Effect.promise(() => db.delete(seasonPointsMultiplier));
      yield* Effect.promise(() => db.delete(accounts));
      yield* Effect.promise(() => db.delete(users));
    });

    describe("getByWeekIdAndActivityId", () => {
      const validInput = {
        weekId: WEEK_ID,
        activityId: ACTIVITY_ID,
        minPoints: 100,
        minTWABalance: 50,
      };

      it.effect(
        "should return user activity points successfully with proper filtering",
        () =>
          Effect.gen(function* () {
            yield* setupTestData();

            const testLayer = UserActivityPointsService.Default.pipe(
              Layer.provide(dbLive)
            );

            const service = yield* Effect.provide(
              UserActivityPointsService,
              testLayer
            );

            const result = yield* service.getByWeekIdAndActivityId(validInput);

            // Should only return users who meet both minPoints and minTWABalance criteria
            // USER_4 is excluded due to low TWA balance (25 < 50)
            expect(result).toHaveLength(3);

            // Results should be ordered by points ascending
            expect(result[0]).toEqual({
              userId: USER_2,
              points: new BigNumber("150"),
            });
            expect(result[1]).toEqual({
              userId: USER_1,
              points: new BigNumber("250"),
            });
            expect(result[2]).toEqual({
              userId: USER_3,
              points: new BigNumber("300"),
            });

            yield* cleanupTestData;
          })
      );

      it.effect("should filter out users with points below minimum", () =>
        Effect.gen(function* () {
          yield* setupTestData();

          const testLayer = UserActivityPointsService.Default.pipe(
            Layer.provide(dbLive)
          );

          const service = yield* Effect.provide(
            UserActivityPointsService,
            testLayer
          );

          const input = {
            ...validInput,
            minPoints: 200, // Higher minimum
          };

          const result = yield* service.getByWeekIdAndActivityId(input);

          // Only users with 200+ points should be returned
          expect(result).toHaveLength(2);
          expect(result[0]).toEqual({
            userId: USER_1,
            points: new BigNumber("250"),
          });
          expect(result[1]).toEqual({
            userId: USER_3,
            points: new BigNumber("300"),
          });

          yield* cleanupTestData;
        })
      );

      it.effect("should filter out users with TWA balance below minimum", () =>
        Effect.gen(function* () {
          yield* setupTestData();

          const testLayer = UserActivityPointsService.Default.pipe(
            Layer.provide(dbLive)
          );

          const service = yield* Effect.provide(
            UserActivityPointsService,
            testLayer
          );

          const input = {
            ...validInput,
            minTWABalance: 100, // Higher TWA balance requirement
          };

          const result = yield* service.getByWeekIdAndActivityId(input);

          // Only users with TWA balance >= 100 should be returned
          expect(result).toHaveLength(2);
          expect(result[0]).toEqual({
            userId: USER_1,
            points: new BigNumber("250"),
          });
          expect(result[1]).toEqual({
            userId: USER_3,
            points: new BigNumber("300"),
          });

          yield* cleanupTestData;
        })
      );

      it.effect("should return empty array when no results meet criteria", () =>
        Effect.gen(function* () {
          yield* setupTestData();

          const testLayer = UserActivityPointsService.Default.pipe(
            Layer.provide(dbLive)
          );

          const service = yield* Effect.provide(
            UserActivityPointsService,
            testLayer
          );

          const input = {
            ...validInput,
            minPoints: 500, // Very high minimum that no user meets
          };

          const result = yield* service.getByWeekIdAndActivityId(input);

          expect(result).toEqual([]);

          yield* cleanupTestData;
        })
      );

      it.effect("should handle non-existent week or activity", () =>
        Effect.gen(function* () {
          yield* setupTestData();

          const testLayer = UserActivityPointsService.Default.pipe(
            Layer.provide(dbLive)
          );

          const service = yield* Effect.provide(
            UserActivityPointsService,
            testLayer
          );

          const input = {
            ...validInput,
            weekId: "99999999-9999-9999-9999-999999999999", // Valid UUID that doesn't exist
          };

          const result = yield* service.getByWeekIdAndActivityId(input);

          expect(result).toEqual([]);

          yield* cleanupTestData;
        })
      );

      it.effect("should handle large numbers correctly with BigNumber", () =>
        Effect.gen(function* () {
          const largeNumberUserId = "55555555-5555-5555-5555-555555555555";

          // Create test data with large numbers
          yield* Effect.promise(() =>
            db
              .insert(users)
              .values([
                {
                  id: largeNumberUserId,
                  identityAddress: "identity_large-number-user",
                },
              ])
              .onConflictDoNothing()
          );

          yield* Effect.promise(() =>
            db
              .insert(accounts)
              .values([
                {
                  address: "large_number_account",
                  userId: largeNumberUserId,
                  label: "Large Number Account",
                },
              ])
              .onConflictDoNothing()
          );

          yield* Effect.promise(() =>
            db
              .insert(seasonPointsMultiplier)
              .values([
                {
                  userId: largeNumberUserId,
                  weekId: WEEK_ID,
                  totalTWABalance: "999999999999.123456", // Large but safe balance
                  cumulativeTWABalance: "999999999999.123456",
                  multiplier: "1.0",
                },
              ])
              .onConflictDoNothing()
          );

          yield* Effect.promise(() =>
            db
              .insert(accountActivityPoints)
              .values([
                {
                  accountAddress: "large_number_account",
                  weekId: WEEK_ID,
                  activityId: ACTIVITY_ID,
                  activityPoints: "999999999", // Large number (within safe integer range)
                },
              ])
              .onConflictDoNothing()
          );

          const testLayer = UserActivityPointsService.Default.pipe(
            Layer.provide(dbLive)
          );

          const service = yield* Effect.provide(
            UserActivityPointsService,
            testLayer
          );

          const input = {
            ...validInput,
            minPoints: 0,
            minTWABalance: 50,
          };

          const result = yield* service.getByWeekIdAndActivityId(input);

          const largeNumberResult = result.find(
            (r) => r.userId === largeNumberUserId
          );
          expect(largeNumberResult).toBeDefined();
          if (largeNumberResult) {
            expect(largeNumberResult.points).toEqual(
              new BigNumber("999999999")
            );

            // Verify BigNumber precision is maintained
            expect(largeNumberResult.points.toString()).toBe("999999999");
          }

          // Cleanup
          yield* Effect.promise(() =>
            db
              .delete(accountActivityPoints)
              .where(
                eq(accountActivityPoints.accountAddress, "large_number_account")
              )
          );
          yield* Effect.promise(() =>
            db
              .delete(seasonPointsMultiplier)
              .where(eq(seasonPointsMultiplier.userId, largeNumberUserId))
          );
          yield* Effect.promise(() =>
            db
              .delete(accounts)
              .where(eq(accounts.address, "large_number_account"))
          );
          yield* Effect.promise(() =>
            db.delete(users).where(eq(users.id, largeNumberUserId))
          );
        })
      );

      it.effect("should filter out zero points from results", () =>
        Effect.gen(function* () {
          const zeroPointsUserId = "66666666-6666-6666-6666-666666666666";

          // Create test data with zero points
          yield* Effect.promise(() =>
            db
              .insert(users)
              .values([
                {
                  id: zeroPointsUserId,
                  identityAddress: "identity_zero-points-user",
                },
              ])
              .onConflictDoNothing()
          );

          yield* Effect.promise(() =>
            db
              .insert(accounts)
              .values([
                {
                  address: "zero_points_account",
                  userId: zeroPointsUserId,
                  label: "Zero Points Account",
                },
              ])
              .onConflictDoNothing()
          );

          yield* Effect.promise(() =>
            db
              .insert(seasonPointsMultiplier)
              .values([
                {
                  userId: zeroPointsUserId,
                  weekId: WEEK_ID,
                  totalTWABalance: "100",
                  cumulativeTWABalance: "100",
                  multiplier: "1.0",
                },
              ])
              .onConflictDoNothing()
          );

          yield* Effect.promise(() =>
            db
              .insert(accountActivityPoints)
              .values([
                {
                  accountAddress: "zero_points_account",
                  weekId: WEEK_ID,
                  activityId: ACTIVITY_ID,
                  activityPoints: "0", // Zero points
                },
              ])
              .onConflictDoNothing()
          );

          const testLayer = UserActivityPointsService.Default.pipe(
            Layer.provide(dbLive)
          );

          const service = yield* Effect.provide(
            UserActivityPointsService,
            testLayer
          );

          const input = {
            ...validInput,
            minPoints: 0, // Allow zero points in query
            minTWABalance: 50,
          };

          const result = yield* service.getByWeekIdAndActivityId(input);

          // Zero points should be filtered out by the service
          const zeroPointsResult = result.find(
            (r) => r.userId === zeroPointsUserId
          );
          expect(zeroPointsResult).toBeUndefined();

          // Cleanup
          yield* Effect.promise(() =>
            db
              .delete(accountActivityPoints)
              .where(
                eq(accountActivityPoints.accountAddress, "zero_points_account")
              )
          );
          yield* Effect.promise(() =>
            db
              .delete(seasonPointsMultiplier)
              .where(eq(seasonPointsMultiplier.userId, zeroPointsUserId))
          );
          yield* Effect.promise(() =>
            db
              .delete(accounts)
              .where(eq(accounts.address, "zero_points_account"))
          );
          yield* Effect.promise(() =>
            db.delete(users).where(eq(users.id, zeroPointsUserId))
          );
        })
      );

      it.effect(
        "should aggregate points from multiple accounts for same user",
        () =>
          Effect.gen(function* () {
            const multiAccountUserId = "77777777-7777-7777-7777-777777777777";
            const account1 = "account_rdx12multi1_account_address_example_1";
            const account2 = "account_rdx12multi2_account_address_example_2";
            const account3 = "account_rdx12multi3_account_address_example_3";

            // Create user with multiple accounts
            yield* Effect.promise(() =>
              db
                .insert(users)
                .values([
                  {
                    id: multiAccountUserId,
                    identityAddress: "identity_multi-account-user",
                  },
                ])
                .onConflictDoNothing()
            );

            yield* Effect.promise(() =>
              db
                .insert(accounts)
                .values([
                  {
                    address: account1,
                    userId: multiAccountUserId,
                    label: "Account 1",
                  },
                  {
                    address: account2,
                    userId: multiAccountUserId,
                    label: "Account 2",
                  },
                  {
                    address: account3,
                    userId: multiAccountUserId,
                    label: "Account 3",
                  },
                ])
                .onConflictDoNothing()
            );

            yield* Effect.promise(() =>
              db
                .insert(seasonPointsMultiplier)
                .values([
                  {
                    userId: multiAccountUserId,
                    weekId: WEEK_ID,
                    totalTWABalance: "500",
                    cumulativeTWABalance: "500",
                    multiplier: "1.5",
                  },
                ])
                .onConflictDoNothing()
            );

            // Create activity points for multiple accounts of the same user
            yield* Effect.promise(() =>
              db
                .insert(accountActivityPoints)
                .values([
                  {
                    accountAddress: account1,
                    weekId: WEEK_ID,
                    activityId: ACTIVITY_ID,
                    activityPoints: "100",
                  },
                  {
                    accountAddress: account2,
                    weekId: WEEK_ID,
                    activityId: ACTIVITY_ID,
                    activityPoints: "200",
                  },
                  {
                    accountAddress: account3,
                    weekId: WEEK_ID,
                    activityId: ACTIVITY_ID,
                    activityPoints: "150",
                  },
                ])
                .onConflictDoNothing()
            );

            const testLayer = UserActivityPointsService.Default.pipe(
              Layer.provide(dbLive)
            );

            const service = yield* Effect.provide(
              UserActivityPointsService,
              testLayer
            );

            const input = {
              ...validInput,
              minPoints: 0,
              minTWABalance: 50,
            };

            const result = yield* service.getByWeekIdAndActivityId(input);

            // Find the user with multiple accounts
            const multiAccountResult = result.find(
              (r) => r.userId === multiAccountUserId
            );

            expect(multiAccountResult).toBeDefined();
            if (multiAccountResult) {
              // Points should be aggregated: 100 + 200 + 150 = 450
              expect(multiAccountResult.points).toEqual(new BigNumber("450"));
            }

            // Cleanup
            yield* Effect.promise(() =>
              db
                .delete(accountActivityPoints)
                .where(eq(accountActivityPoints.accountAddress, account1))
            );
            yield* Effect.promise(() =>
              db
                .delete(accountActivityPoints)
                .where(eq(accountActivityPoints.accountAddress, account2))
            );
            yield* Effect.promise(() =>
              db
                .delete(accountActivityPoints)
                .where(eq(accountActivityPoints.accountAddress, account3))
            );
            yield* Effect.promise(() =>
              db
                .delete(seasonPointsMultiplier)
                .where(eq(seasonPointsMultiplier.userId, multiAccountUserId))
            );
            yield* Effect.promise(() =>
              db.delete(accounts).where(eq(accounts.address, account1))
            );
            yield* Effect.promise(() =>
              db.delete(accounts).where(eq(accounts.address, account2))
            );
            yield* Effect.promise(() =>
              db.delete(accounts).where(eq(accounts.address, account3))
            );
            yield* Effect.promise(() =>
              db.delete(users).where(eq(users.id, multiAccountUserId))
            );
          })
      );

      it.effect(
        "should aggregate multiple accounts to meet minPoints threshold",
        () =>
          Effect.gen(function* () {
            const thresholdUserId = "88888888-8888-8888-8888-888888888888";
            const accountA = "account_rdx12threshold_a_example_address";
            const accountB = "account_rdx12threshold_b_example_address";
            const accountC = "account_rdx12threshold_c_example_address";

            // Create user with multiple accounts that individually don't meet threshold
            yield* Effect.promise(() =>
              db
                .insert(users)
                .values([
                  {
                    id: thresholdUserId,
                    identityAddress: "identity_threshold-user",
                  },
                ])
                .onConflictDoNothing()
            );

            yield* Effect.promise(() =>
              db
                .insert(accounts)
                .values([
                  {
                    address: accountA,
                    userId: thresholdUserId,
                    label: "Threshold Account A",
                  },
                  {
                    address: accountB,
                    userId: thresholdUserId,
                    label: "Threshold Account B",
                  },
                  {
                    address: accountC,
                    userId: thresholdUserId,
                    label: "Threshold Account C",
                  },
                ])
                .onConflictDoNothing()
            );

            yield* Effect.promise(() =>
              db
                .insert(seasonPointsMultiplier)
                .values([
                  {
                    userId: thresholdUserId,
                    weekId: WEEK_ID,
                    totalTWABalance: "100",
                    cumulativeTWABalance: "100",
                    multiplier: "1.2",
                  },
                ])
                .onConflictDoNothing()
            );

            // Each account has points below the 200 threshold individually
            yield* Effect.promise(() =>
              db
                .insert(accountActivityPoints)
                .values([
                  {
                    accountAddress: accountA,
                    weekId: WEEK_ID,
                    activityId: ACTIVITY_ID,
                    activityPoints: "80", // Below 200 threshold
                  },
                  {
                    accountAddress: accountB,
                    weekId: WEEK_ID,
                    activityId: ACTIVITY_ID,
                    activityPoints: "70", // Below 200 threshold
                  },
                  {
                    accountAddress: accountC,
                    weekId: WEEK_ID,
                    activityId: ACTIVITY_ID,
                    activityPoints: "90", // Below 200 threshold
                  },
                ])
                .onConflictDoNothing()
            );

            const testLayer = UserActivityPointsService.Default.pipe(
              Layer.provide(dbLive)
            );

            const service = yield* Effect.provide(
              UserActivityPointsService,
              testLayer
            );

            // Set a high minPoints threshold that individual accounts don't meet
            const inputWithHighThreshold = {
              ...validInput,
              minPoints: 200, // Higher than any individual account
              minTWABalance: 50,
            };

            const result = yield* service.getByWeekIdAndActivityId(
              inputWithHighThreshold
            );

            // User should be included because aggregated points (80+70+90=240) exceed threshold
            const thresholdResult = result.find(
              (r) => r.userId === thresholdUserId
            );

            expect(thresholdResult).toBeDefined();
            if (thresholdResult) {
              // Total aggregated points: 80 + 70 + 90 = 240 (exceeds 200 threshold)
              expect(thresholdResult.points).toEqual(new BigNumber("240"));
            }

            // Test with an even higher threshold that aggregated points don't meet
            const inputWithVeryHighThreshold = {
              ...validInput,
              minPoints: 300, // Higher than aggregated points (240)
              minTWABalance: 50,
            };

            const resultHighThreshold = yield* service.getByWeekIdAndActivityId(
              inputWithVeryHighThreshold
            );

            // User should NOT be included because aggregated points (240) don't exceed threshold (300)
            const notIncludedResult = resultHighThreshold.find(
              (r) => r.userId === thresholdUserId
            );

            expect(notIncludedResult).toBeUndefined();

            // Cleanup
            yield* Effect.promise(() =>
              db
                .delete(accountActivityPoints)
                .where(eq(accountActivityPoints.accountAddress, accountA))
            );
            yield* Effect.promise(() =>
              db
                .delete(accountActivityPoints)
                .where(eq(accountActivityPoints.accountAddress, accountB))
            );
            yield* Effect.promise(() =>
              db
                .delete(accountActivityPoints)
                .where(eq(accountActivityPoints.accountAddress, accountC))
            );
            yield* Effect.promise(() =>
              db
                .delete(seasonPointsMultiplier)
                .where(eq(seasonPointsMultiplier.userId, thresholdUserId))
            );
            yield* Effect.promise(() =>
              db.delete(accounts).where(eq(accounts.address, accountA))
            );
            yield* Effect.promise(() =>
              db.delete(accounts).where(eq(accounts.address, accountB))
            );
            yield* Effect.promise(() =>
              db.delete(accounts).where(eq(accounts.address, accountC))
            );
            yield* Effect.promise(() =>
              db.delete(users).where(eq(users.id, thresholdUserId))
            );
          })
      );
    });
  }
);
