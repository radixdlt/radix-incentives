import BigNumber from 'bignumber.js';
import {
  seasons,
  user,
  userSeasonBonuses,
  userSeasonPoints,
  userSeasonReward,
  userSeasonRewardClaims,
} from 'db/incentives';
import { and, asc, count, desc, eq, inArray, sql, sum } from 'drizzle-orm';
import {
  Array as A,
  Data,
  Effect,
  HashMap,
  Option,
  pipe,
  Schema,
} from 'effect';
import { SeasonId, UserId } from 'shared/brandedTypes';
import { DbService } from '../db/dbClient';

export class SeasonRewardNotFoundError extends Data.TaggedError(
  'SeasonRewardNotFoundError',
)<{
  message: string;
}> {}

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

/**
 * Schema for listing user season rewards input (admin)
 */
export const ListUserSeasonRewardsInputSchema = Schema.Struct({
  seasonId: Schema.String,
  page: Schema.optionalWith(
    Schema.Number.pipe(Schema.greaterThanOrEqualTo(1)),
    {
      default: () => 1,
    },
  ),
  limit: Schema.optionalWith(
    Schema.Number.pipe(
      Schema.greaterThanOrEqualTo(1),
      Schema.lessThanOrEqualTo(100),
    ),
    { default: () => 50 },
  ),
  sortField: Schema.optionalWith(
    Schema.Literal('label', 'amount', 'claimedAmount', 'claimStatus'),
    { default: () => 'amount' as const },
  ),
  sortDirection: Schema.optionalWith(Schema.Literal('asc', 'desc'), {
    default: () => 'desc' as const,
  }),
});

export type ListUserSeasonRewardsInput =
  typeof ListUserSeasonRewardsInputSchema.Type;

/**
 * Schema for season reward stats input (admin)
 */
export const GetSeasonRewardStatsInputSchema = Schema.Struct({
  seasonId: Schema.String,
});

export type GetSeasonRewardStatsInput =
  typeof GetSeasonRewardStatsInputSchema.Type;

/**
 * Claim status for user season rewards
 */
export type ClaimStatus = 'unclaimed' | 'partial' | 'claimed' | 'pending';

/**
 * User season reward item in list response
 */
export type UserSeasonRewardListItem = {
  userId: string;
  userLabel: string | null;
  amount: string;
  claimedAmount: string;
  claimStatus: ClaimStatus;
};

/**
 * Response type for listing user season rewards
 */
export type ListUserSeasonRewardsOutput = {
  rewards: UserSeasonRewardListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/**
 * Response type for season reward stats
 */
export type GetSeasonRewardStatsOutput = {
  seasonName: string;
  totalUsers: number;
  totalRewardAmount: string;
  totalClaimedAmount: string;
};

/**
 * Schema for getting user season rewards by userId
 */
export const GetUserSeasonRewardsByUserInputSchema = Schema.Struct({
  userId: Schema.String,
});

export type GetUserSeasonRewardsByUserInput =
  typeof GetUserSeasonRewardsByUserInputSchema.Type;

/**
 * Schema for getting user season reward claims by userId and seasonId
 */
export const GetUserSeasonRewardClaimsInputSchema = Schema.Struct({
  userId: Schema.String,
  seasonId: Schema.String,
});

export type GetUserSeasonRewardClaimsInput =
  typeof GetUserSeasonRewardClaimsInputSchema.Type;

/**
 * Response type for user season reward
 */
export type UserSeasonRewardItem = {
  userId: string;
  seasonId: string;
  amount: string;
};

/**
 * Response type for user season reward claim
 */
export type GetUserSeasonRewardClaimOutput = {
  amount: string;
  status: 'pending' | 'success' | 'failed';
  transactionId: string;
  accountAddress: string;
};

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
                Option.getOrNull,
              ),
            ),
            Effect.orDie,
          );

      /**
       * List user season rewards with pagination and sorting (admin)
       */
      const listUserSeasonRewards = (input: ListUserSeasonRewardsInput) =>
        Effect.gen(function* () {
          const { seasonId, page, limit, sortField, sortDirection } = input;
          const offset = (page - 1) * limit;

          // Filter condition: seasonId matches and amount > 0
          const filterCondition = and(
            eq(userSeasonReward.seasonId, seasonId),
            sql`${userSeasonReward.amount} > 0`,
          );

          // Get total count (excluding zero amounts)
          const [totalResult] = yield* db
            .use((database) =>
              database
                .select({ count: count() })
                .from(userSeasonReward)
                .where(filterCondition),
            )
            .pipe(Effect.orDie);

          const total = totalResult?.count ?? 0;

          // Apply sorting and pagination
          const orderByClause =
            sortField === 'label'
              ? sortDirection === 'asc'
                ? asc(user.label)
                : desc(user.label)
              : sortDirection === 'asc'
                ? asc(userSeasonReward.amount)
                : desc(userSeasonReward.amount);

          // Build query for rewards with user info (excluding zero amounts)
          const rewards = yield* db
            .use((database) =>
              database
                .select({
                  odUserId: userSeasonReward.userId,
                  seasonId: userSeasonReward.seasonId,
                  amount: userSeasonReward.amount,
                  userLabel: user.label,
                })
                .from(userSeasonReward)
                .innerJoin(user, eq(userSeasonReward.userId, user.id))
                .where(filterCondition)
                .orderBy(orderByClause)
                .limit(limit)
                .offset(offset),
            )
            .pipe(Effect.orDie);

          // Get claim data for these users
          const userIds = rewards.map((r) => r.odUserId);

          const claimsData =
            userIds.length > 0
              ? yield* db
                  .use((database) =>
                    database
                      .select({
                        odUserId: userSeasonRewardClaims.userId,
                        totalClaimed: sum(userSeasonRewardClaims.amount),
                        latestStatus: userSeasonRewardClaims.status,
                      })
                      .from(userSeasonRewardClaims)
                      .where(
                        and(
                          eq(userSeasonRewardClaims.seasonId, seasonId),
                          inArray(userSeasonRewardClaims.userId, userIds),
                        ),
                      )
                      .groupBy(
                        userSeasonRewardClaims.userId,
                        userSeasonRewardClaims.status,
                      ),
                  )
                  .pipe(Effect.orDie)
              : [];

          // Build claims map using Effect's groupBy and reduce
          const claimsMap = pipe(
            claimsData,
            A.groupBy((claim) => claim.odUserId),
            (grouped) =>
              pipe(
                Object.entries(grouped),
                A.map(
                  ([userId, claims]) =>
                    [
                      userId,
                      pipe(
                        claims,
                        A.reduce(
                          {
                            totalClaimed: new BigNumber('0'),
                            statuses: [] as string[],
                          },
                          (acc, claim) => ({
                            totalClaimed: acc.totalClaimed.plus(
                              claim.totalClaimed ?? '0',
                            ),
                            statuses: claim.latestStatus
                              ? [...acc.statuses, claim.latestStatus]
                              : acc.statuses,
                          }),
                        ),
                        ({ totalClaimed, statuses }) => ({
                          totalClaimed: totalClaimed.toString(),
                          statuses,
                        }),
                      ),
                    ] as const,
                ),
                HashMap.fromIterable,
              ),
          );

          // Combine data
          const result: UserSeasonRewardListItem[] = rewards.map((reward) => {
            const claimData = pipe(
              HashMap.get(claimsMap, reward.odUserId),
              Option.getOrUndefined,
            );
            const amount = new BigNumber(reward.amount);
            const claimedAmount = new BigNumber(claimData?.totalClaimed ?? '0');

            let claimStatus: ClaimStatus = 'unclaimed';
            if (claimData?.statuses.includes('pending')) {
              claimStatus = 'pending';
            } else if (claimedAmount.gte(amount)) {
              claimStatus = 'claimed';
            } else if (claimedAmount.gt(0)) {
              claimStatus = 'partial';
            }

            return {
              userId: reward.odUserId,
              userLabel: reward.userLabel,
              amount: amount.toString(),
              claimedAmount: claimedAmount.toString(),
              claimStatus,
            };
          });

          // Sort by claimedAmount or claimStatus if needed (post-query sorting)
          if (sortField === 'claimedAmount') {
            result.sort((a, b) => {
              const comparison =
                new BigNumber(a.claimedAmount).comparedTo(
                  new BigNumber(b.claimedAmount),
                ) ?? 0;
              return sortDirection === 'asc' ? comparison : -comparison;
            });
          } else if (sortField === 'claimStatus') {
            const statusOrder = {
              unclaimed: 0,
              pending: 1,
              partial: 2,
              claimed: 3,
            };
            result.sort((a, b) => {
              const comparison =
                statusOrder[a.claimStatus] - statusOrder[b.claimStatus];
              return sortDirection === 'asc' ? comparison : -comparison;
            });
          }

          return {
            rewards: result,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          };
        });

      /**
       * Get season reward statistics (admin)
       */
      const getSeasonRewardStats = (input: GetSeasonRewardStatsInput) =>
        Effect.gen(function* () {
          const { seasonId } = input;

          // Get season info
          const [season] = yield* db
            .use((database) =>
              database
                .select({ name: seasons.name })
                .from(seasons)
                .where(eq(seasons.id, seasonId)),
            )
            .pipe(Effect.orDie);

          // Get total rewards and user count
          const [rewardStats] = yield* db
            .use((database) =>
              database
                .select({
                  totalUsers: count(),
                  totalRewardAmount: sum(userSeasonReward.amount),
                })
                .from(userSeasonReward)
                .where(eq(userSeasonReward.seasonId, seasonId)),
            )
            .pipe(Effect.orDie);

          // Get claim statistics
          const [claimStats] = yield* db
            .use((database) =>
              database
                .select({
                  totalClaimedAmount: sum(userSeasonRewardClaims.amount),
                })
                .from(userSeasonRewardClaims)
                .where(
                  and(
                    eq(userSeasonRewardClaims.seasonId, seasonId),
                    eq(userSeasonRewardClaims.status, 'success'),
                  ),
                ),
            )
            .pipe(Effect.orDie);

          return {
            seasonName: season?.name ?? 'Unknown',
            totalUsers: rewardStats?.totalUsers ?? 0,
            totalRewardAmount: rewardStats?.totalRewardAmount ?? '0',
            totalClaimedAmount: claimStats?.totalClaimedAmount ?? '0',
          };
        });

      /**
       * Get all season rewards for a user
       */
      const getUserSeasonRewardsByUser = (
        input: GetUserSeasonRewardsByUserInput,
      ) =>
        db
          .use((database) =>
            database
              .select({
                userId: userSeasonReward.userId,
                seasonId: userSeasonReward.seasonId,
                amount: userSeasonReward.amount,
              })
              .from(userSeasonReward)
              .where(eq(userSeasonReward.userId, input.userId)),
          )
          .pipe(Effect.orDie);

      /**
       * Get claims for a user's season reward by userId and seasonId
       */
      const getUserSeasonRewardClaims = (
        input: GetUserSeasonRewardClaimsInput,
      ) =>
        db
          .use((database) =>
            database
              .select({
                amount: userSeasonRewardClaims.amount,
                status: userSeasonRewardClaims.status,
                transactionId: userSeasonRewardClaims.transactionId,
                createdAt: userSeasonRewardClaims.createdAt,
                accountAddress: userSeasonRewardClaims.accountAddress,
              })
              .from(userSeasonRewardClaims)
              .where(
                and(
                  eq(userSeasonRewardClaims.userId, input.userId),
                  eq(userSeasonRewardClaims.seasonId, input.seasonId),
                ),
              )
              .orderBy(desc(userSeasonRewardClaims.createdAt)),
          )
          .pipe(Effect.orDie);

      /**
       * Get all claims for a user across all seasons
       */
      const getAllUserSeasonRewardClaims = (
        input: GetUserSeasonRewardsByUserInput,
      ) =>
        db
          .use((database) =>
            database
              .select({
                seasonId: userSeasonRewardClaims.seasonId,
                amount: userSeasonRewardClaims.amount,
                status: userSeasonRewardClaims.status,
                transactionId: userSeasonRewardClaims.transactionId,
                createdAt: userSeasonRewardClaims.createdAt,
                accountAddress: userSeasonRewardClaims.accountAddress,
              })
              .from(userSeasonRewardClaims)
              .where(eq(userSeasonRewardClaims.userId, input.userId))
              .orderBy(desc(userSeasonRewardClaims.createdAt)),
          )
          .pipe(Effect.orDie);

      return {
        calculateSeasonReward,
        saveSeasonRewards,
        getUserSeasonReward,
        getUserSeasonPointTotals,
        getSeasonBonuses,
        getTotalSeasonPoints,
        listUserSeasonRewards,
        getSeasonRewardStats,
        getUserSeasonRewardsByUser,
        getUserSeasonRewardClaims,
        getAllUserSeasonRewardClaims,
      };
    }),
  },
) {}
