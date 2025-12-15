import BigNumber from 'bignumber.js';
import {
  userSeasonBonuses,
  userSeasonPoints,
  userSeasonReward,
} from 'db/incentives';
import { and, eq, sql, sum } from 'drizzle-orm';
import {
  Array as A,
  Brand,
  Data,
  Effect,
  HashMap,
  Option,
  pipe,
  Schema,
} from 'effect';
import {
  AccountAddress,
  BigNumberSchema,
  ComponentAddress,
} from '../account-balance/v2/schemas';
import { DbService } from '../db/dbClient';
import { NetworkId, SeasonId, UserId } from '../schemas/brandedTypes';
import { IncentivesVesterStateService } from './incentives-vester/incentivesVester';

/**
 * Branded type for season bonus values (decimal string representation)
 */
export type SeasonBonus = string & Brand.Brand<'SeasonBonus'>;
export const SeasonBonus = Brand.nominal<SeasonBonus>();
export const SeasonBonusSchema = Schema.String.pipe(
  Schema.fromBrand(SeasonBonus),
);

/**
 * Branded type for points values (decimal string representation)
 */
export type Points = string & Brand.Brand<'Points'>;
export const Points = Brand.nominal<Points>();
export const PointsSchema = Schema.String.pipe(Schema.fromBrand(Points));

/**
 * Schema for calculating season rewards input
 */
export const CalculateSeasonRewardInputSchema = Schema.Struct({
  /** The season ID to calculate rewards for */
  seasonId: SeasonId,
  /** Total XRD reward budget for the season */
  rewardBudget: BigNumberSchema,
  /** The component address of the incentives vester */
  componentAddress: Schema.String.pipe(Schema.fromBrand(ComponentAddress)),
  /** The network ID of the incentives vester */
  networkId: NetworkId,
});

export type CalculateSeasonRewardInput =
  typeof CalculateSeasonRewardInputSchema.Type;

/**
 * Schema for a single user's season reward calculation result
 */
export const UserSeasonRewardResultSchema = Schema.Struct({
  userId: UserId,
  /** User's total season points */
  totalPoints: PointsSchema,
  /** User's season bonus multiplier (if any) */
  seasonBonus: SeasonBonusSchema,
  /** User's share of total points pool (0-1) */
  poolShare: BigNumberSchema,
  /** Final calculated reward amount in XRD */
  rewardAmount: BigNumberSchema,
});

export type UserSeasonRewardResult = typeof UserSeasonRewardResultSchema.Type;

/**
 * Schema for the save season rewards input
 */
export const SaveSeasonRewardsInputSchema = Schema.Struct({
  seasonId: SeasonId,
  rewards: Schema.Array(UserSeasonRewardResultSchema),
  accountAddresses: Schema.Map({
    key: UserId,
    value: Schema.String.pipe(Schema.fromBrand(AccountAddress)),
  }),
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
  amount: BigNumberSchema,
  accountAddress: Schema.String.pipe(Schema.fromBrand(AccountAddress)),
});

export type UserSeasonRewardOutput = typeof UserSeasonRewardOutputSchema.Type;

class TotalTokensToVestError extends Data.TaggedError(
  'TotalTokensToVestError',
)<{
  message: string;
}> {}

export class SeasonRewardService extends Effect.Service<SeasonRewardService>()(
  'SeasonRewardService',
  {
    dependencies: [DbService.Default, IncentivesVesterStateService.Default],
    effect: Effect.gen(function* () {
      const db = yield* DbService;
      const incentivesVesterStateService = yield* IncentivesVesterStateService;

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
                totalPoints: Points(row.totalPoints ?? '0'),
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
                      SeasonBonus(row.seasonBonus ?? '0'),
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
       * 2. Apply season bonus multiplier if applicable (1 + seasonBonus)
       * 3. Calculate user's share of the total adjusted points pool
       * 4. Distribute the reward budget proportionally based on shares
       *
       * @param input - Season ID and total reward budget
       * @returns Array of user reward calculations with detailed breakdown
       */
      const calculateSeasonReward = (input: CalculateSeasonRewardInput) =>
        Effect.gen(function* () {
          const { seasonId, rewardBudget } = input;

          const totalTokensToVest = yield* incentivesVesterStateService({
            componentAddress: input.componentAddress,
            networkId: input.networkId,
          }).pipe(
            Effect.map((state) => new BigNumber(state.total_tokens_to_vest)),
          );

          // Fetch all required data in parallel
          const [userPoints, seasonBonuses] = yield* Effect.all(
            [getUserSeasonPointTotals(seasonId), getSeasonBonuses(seasonId)],
            { concurrency: 'unbounded' },
          );

          // If no users have points, return empty array
          if (userPoints.length === 0) {
            return [];
          }

          // Calculate adjusted points for each user (points * (1 + bonus))
          const usersWithAdjustedPoints = userPoints.map((user) => {
            const seasonBonus = pipe(
              HashMap.get(seasonBonuses, user.userId),
              Option.getOrElse(() => SeasonBonus('0')),
            );
            const multiplier = new BigNumber('1').plus(seasonBonus);
            const adjustedPoints = new BigNumber(user.totalPoints).multipliedBy(
              multiplier,
            );

            return {
              ...user,
              seasonBonus,
              adjustedPoints,
            };
          });

          // If total is zero, everyone gets zero rewards
          if (totalTokensToVest.isZero()) {
            return yield* new TotalTokensToVestError({
              message: 'Total tokens to vest is zero',
            });
          }

          // Calculate each user's reward
          const rewards: UserSeasonRewardResult[] = usersWithAdjustedPoints.map(
            (user) => {
              const poolShare =
                user.adjustedPoints.dividedBy(totalTokensToVest);
              const rewardAmount = rewardBudget.multipliedBy(poolShare);

              return {
                userId: user.userId,
                totalPoints: user.totalPoints,
                seasonBonus: user.seasonBonus,
                poolShare,
                rewardAmount,
              };
            },
          );

          return rewards;
        });

      /**
       * Save calculated season rewards to the database.
       * This upserts rewards into the userSeasonReward table.
       *
       * @param input - Season ID, rewards array, and account addresses map
       */
      const saveSeasonRewards = (input: SaveSeasonRewardsInput) =>
        Effect.gen(function* () {
          const { seasonId, rewards, accountAddresses } = input;

          if (rewards.length === 0) {
            return;
          }

          // Prepare values for upsert
          const values = rewards
            .filter((reward) => accountAddresses.has(reward.userId))
            .map((reward) => ({
              userId: reward.userId,
              seasonId,
              amount: reward.rewardAmount.toString(),
              accountAddress: accountAddresses.get(reward.userId) as string,
            }));

          if (values.length === 0) {
            return;
          }

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
                        accountAddress: sql`excluded.account_address`,
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
                accountAddress: userSeasonReward.accountAddress,
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
                      amount: new BigNumber(row.amount),
                      accountAddress: AccountAddress(row.accountAddress),
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
