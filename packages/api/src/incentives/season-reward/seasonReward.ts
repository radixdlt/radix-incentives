import BigNumber from 'bignumber.js';
import {
  userSeasonBonuses,
  userSeasonPoints,
  userSeasonReward,
} from 'db/incentives';
import { and, eq, sql, sum } from 'drizzle-orm';
import { Array as A, Effect, HashMap, Option, pipe, Schema } from 'effect';
import { DbService } from '../db/dbClient';
import { SeasonId, UserId } from '../schemas/brandedTypes';

/**
 * Branded type for season bonus values (decimal string representation)
 */
export const SeasonBonus = Schema.String.pipe(Schema.brand('SeasonBonus'));
export type SeasonBonus = typeof SeasonBonus.Type;

/**
 * Branded type for points values (decimal string representation)
 */
export const Points = Schema.String.pipe(Schema.brand('Points'));
export type Points = typeof Points.Type;

/**
 * Branded type for reward amount values (decimal string representation)
 */
export const RewardAmount = Schema.String.pipe(Schema.brand('RewardAmount'));
export type RewardAmount = typeof RewardAmount.Type;

/**
 * Branded type for reward budget values (decimal string representation)
 */
export const RewardBudget = Schema.String.pipe(Schema.brand('RewardBudget'));
export type RewardBudget = typeof RewardBudget.Type;

/**
 * Schema for calculating season rewards input
 */
export const CalculateSeasonRewardInputSchema = Schema.Struct({
  /** The season ID to calculate rewards for */
  seasonId: SeasonId,
  /** The total reward budget to distribute */
  rewardBudget: RewardBudget,
});

export type CalculateSeasonRewardInput =
  typeof CalculateSeasonRewardInputSchema.Type;

/**
 * Schema for a single user's season reward calculation result
 */
export const UserSeasonRewardResultSchema = Schema.Struct({
  userId: UserId,
  /** User's total season points */
  totalPoints: Points,
  /** User's season bonus multiplier (if any) */
  seasonBonus: SeasonBonus,
  /** Final calculated reward amount (proportional share of budget, then bonus applied) */
  rewardAmount: RewardAmount,
});

export type UserSeasonRewardResult = typeof UserSeasonRewardResultSchema.Type;

/**
 * Schema for a single user reward to save
 */
export const UserRewardToSaveSchema = Schema.Struct({
  userId: UserId,
  rewardAmount: RewardAmount,
});

export type UserRewardToSave = typeof UserRewardToSaveSchema.Type;

/**
 * Schema for the save season rewards input
 */
export const SaveSeasonRewardsInputSchema = Schema.Struct({
  seasonId: SeasonId,
  rewards: Schema.Array(UserRewardToSaveSchema),
});

export type SaveSeasonRewardsInput = typeof SaveSeasonRewardsInputSchema.Type;

/**
 * Schema for getting a user's season reward input
 */
export const GetUserSeasonRewardInputSchema = Schema.Struct({
  userId: UserId,
  seasonId: SeasonId,
});

export type GetUserSeasonRewardInput =
  typeof GetUserSeasonRewardInputSchema.Type;

/**
 * Schema for the user season reward output
 */
export const UserSeasonRewardOutputSchema = Schema.Struct({
  amount: RewardAmount,
});

export type UserSeasonRewardOutput = typeof UserSeasonRewardOutputSchema.Type;

export class SeasonRewardService extends Effect.Service<SeasonRewardService>()(
  'SeasonRewardService',
  {
    dependencies: [DbService.Default],
    effect: Effect.gen(function* () {
      const db = yield* DbService;

      /**
       * Get all users' total season points for a given season
       */
      const getUserSeasonPointTotals = (seasonId: SeasonId) =>
        db
          .use((db) =>
            db
              .select({
                userId: userSeasonPoints.userId,
                totalPoints: sum(userSeasonPoints.points),
              })
              .from(userSeasonPoints)
              .where(eq(userSeasonPoints.seasonId, seasonId))
              .groupBy(userSeasonPoints.userId),
          )
          .pipe(
            Effect.map((rows) =>
              rows.map((row) => ({
                userId: UserId.make(row.userId),
                totalPoints: Points.make(row.totalPoints ?? '0'),
              })),
            ),
            Effect.orDie,
          );

      /**
       * Get season bonuses for all users in a season
       * @returns A HashMap of UserId to SeasonBonus values
       */
      const getSeasonBonuses = (seasonId: SeasonId) =>
        db
          .use((db) =>
            db
              .select({
                userId: userSeasonBonuses.userId,
                seasonBonus: userSeasonBonuses.seasonBonus,
              })
              .from(userSeasonBonuses)
              .where(eq(userSeasonBonuses.seasonId, seasonId)),
          )
          .pipe(
            Effect.map((rows) =>
              pipe(
                rows,
                A.map(
                  (row) =>
                    [
                      UserId.make(row.userId),
                      SeasonBonus.make(row.seasonBonus ?? '0'),
                    ] as const,
                ),
                HashMap.fromIterable,
              ),
            ),
            Effect.orDie,
          );

      /**
       * Get total points across all users in the season
       */
      const getTotalSeasonPoints = (seasonId: SeasonId) =>
        db
          .use((db) =>
            db
              .select({
                totalPoints: sum(userSeasonPoints.points),
              })
              .from(userSeasonPoints)
              .where(eq(userSeasonPoints.seasonId, seasonId)),
          )
          .pipe(
            Effect.map((rows) =>
              pipe(
                rows,
                A.head,
                Option.flatMap((row) => Option.fromNullable(row.totalPoints)),
                Option.map((v) => new BigNumber(v)),
                Option.getOrElse(() => new BigNumber('0')),
              ),
            ),
            Effect.orDie,
          );

      /**
       * Calculate season rewards for all users in a season.
       *
       * The calculation follows this formula:
       * 1. Get each user's total season points (sum across all weeks)
       * 2. Calculate total points across all users
       * 3. Calculate each user's base reward as their proportional share of the budget:
       *    baseReward = (userPoints / totalPoints) * rewardBudget
       * 4. Apply season bonus multiplier to each user's base reward (1 + seasonBonus)
       *
       * This ensures users without a season bonus are not disadvantaged by users who have one.
       * The total rewards distributed may exceed the budget due to bonuses, which is intentional.
       *
       * @param input - Season ID and reward budget to calculate rewards for
       * @returns Array of user reward calculations with detailed breakdown
       */
      const calculateSeasonReward = (input: CalculateSeasonRewardInput) =>
        Effect.gen(function* () {
          const { seasonId, rewardBudget } = input;

          // Fetch all required data in parallel
          const [userPoints, seasonBonuses, totalPoints] = yield* Effect.all(
            [
              getUserSeasonPointTotals(seasonId),
              getSeasonBonuses(seasonId),
              getTotalSeasonPoints(seasonId),
            ],
            { concurrency: 'unbounded' },
          );

          // If no users have points, return empty array
          if (userPoints.length === 0) {
            return [];
          }

          const budget = new BigNumber(rewardBudget);

          // Calculate each user's reward:
          // 1. Base reward is their proportional share of the budget (ignoring bonuses)
          // 2. Then apply season bonus multiplier
          const rewards: UserSeasonRewardResult[] = userPoints.map((user) => {
            const seasonBonus = pipe(
              HashMap.get(seasonBonuses, user.userId),
              Option.getOrElse(() => SeasonBonus.make('0')),
            );

            // Calculate user's proportional share of the budget
            const userPointsNum = new BigNumber(user.totalPoints);
            const baseReward = userPointsNum
              .dividedBy(totalPoints)
              .multipliedBy(budget);

            // Apply season bonus multiplier to the base reward
            const multiplier = new BigNumber('1').plus(seasonBonus);
            const rewardAmount = RewardAmount.make(
              baseReward.multipliedBy(multiplier).toString(),
            );

            return {
              userId: user.userId,
              totalPoints: user.totalPoints,
              seasonBonus,
              rewardAmount,
            };
          });

          return rewards;
        });

      /**
       * Save calculated season rewards to the database.
       * This upserts rewards into the userSeasonReward table.
       *
       * @param input - Season ID and rewards array with user IDs, amounts, and account addresses
       */
      const saveSeasonRewards = (input: SaveSeasonRewardsInput) =>
        Effect.gen(function* () {
          const { seasonId, rewards } = input;

          if (rewards.length === 0) {
            return;
          }

          // Prepare values for upsert
          const values = rewards.map((reward) => ({
            userId: reward.userId,
            seasonId,
            amount: reward.rewardAmount.toString(),
          }));

          // Batch upsert in chunks
          const batchSize = 1000;
          const batches = pipe(values, A.chunksOf(batchSize));

          yield* Effect.forEach(
            batches,
            (batch) =>
              db
                .use((db) =>
                  db
                    .insert(userSeasonReward)
                    .values(batch)
                    .onConflictDoUpdate({
                      target: [
                        userSeasonReward.seasonId,
                        userSeasonReward.userId,
                      ],
                      set: {
                        amount: sql`excluded.amount`,
                      },
                    }),
                )
                .pipe(Effect.orDie),
            { discard: true },
          );
        });

      /**
       * Get a user's calculated season reward
       */
      const getUserSeasonReward = (input: GetUserSeasonRewardInput) =>
        db
          .use((db) =>
            db
              .select({
                amount: userSeasonReward.amount,
              })
              .from(userSeasonReward)
              .where(
                and(
                  eq(userSeasonReward.userId, input.userId),
                  eq(userSeasonReward.seasonId, input.seasonId),
                ),
              )
              .limit(1),
          )
          .pipe(
            Effect.map((rows) =>
              pipe(
                rows,
                A.head,
                Option.map(
                  (row) =>
                    ({
                      amount: RewardAmount.make(row.amount),
                    }) satisfies UserSeasonRewardOutput,
                ),
              ),
            ),
            Effect.orDie,
          );

      return {
        calculateSeasonReward,
        saveSeasonRewards,
        getUserSeasonReward,
        getUserSeasonPointTotals,
        getSeasonBonuses,
        getTotalSeasonPoints,
      };
    }),
  },
) {}
