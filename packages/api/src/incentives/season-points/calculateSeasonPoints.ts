import BigNumber from 'bignumber.js';
import { ActivityCategoryId } from 'data';
import { users } from 'db/incentives';
import { Data, Effect } from 'effect';
import { groupBy } from 'effect/Array';
import { type ZodError, z } from 'zod';
import { Thresholds } from '../../common/config/constants';
import { ActivityCategoryWeekService } from '../activity-category-week/activityCategoryWeek';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';
import { SeasonService } from '../season/season';
import { GetSeasonPointMultiplierService } from '../season-point-multiplier/getSeasonPointMultiplier';
import { UserActivityPointsService } from '../user/userActivityPoints';
import { UpdateWeekStatusService } from '../week/updateWeekStatus';
import { WeekService } from '../week/week';
import { AddSeasonPointsToUserService } from './addSeasonPointsToUser';
import { CalculateReferralPoints } from './calculateReferralPoints';
import { CalculateResourceRewardPointsService } from './calculateResourceRewardPoints';
import { createUserBands } from './createUserBands';
import { detectOutliers } from './detectOutliers';
import { distributeSeasonPoints } from './distributePoints';
import { supplyPercentileTrim } from './supplyPercentileTrim';

export const calculateSeasonPointsInputSchema = z.object({
  weekId: z.string(),
  force: z.boolean().optional(),
  markAsProcessed: z.boolean(),
  dryRun: z.boolean().optional(),
});

export type CalculateSeasonPointsInput = z.infer<
  typeof calculateSeasonPointsInputSchema
>;

const InputValidationError = Data.TaggedError('InputValidationError')<
  ZodError<CalculateSeasonPointsInput>
>;

const InvalidStateError = Data.TaggedError('InvalidStateError')<{
  message: string;
}>;

export class CalculateSeasonPointsService extends Effect.Service<CalculateSeasonPointsService>()(
  'CalculateSeasonPointsService',
  {
    dependencies: [
      dbClientLive,
      SeasonService.Default,
      WeekService.Default,
      UserActivityPointsService.Default,
      AddSeasonPointsToUserService.Default,
      UpdateWeekStatusService.Default,
      GetSeasonPointMultiplierService.Default,
      ActivityCategoryWeekService.Default,
      CalculateReferralPoints.Default,
      CalculateResourceRewardPointsService.Default,
    ],
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      const seasonService = yield* SeasonService;
      const weekService = yield* WeekService;
      const userActivityPointsService = yield* UserActivityPointsService;
      const _addSeasonPointsToUser = yield* AddSeasonPointsToUserService;
      const updateWeekStatus = yield* UpdateWeekStatusService;
      const getSeasonPointMultiplier = yield* GetSeasonPointMultiplierService;
      const activityCategoryWeekService = yield* ActivityCategoryWeekService;
      const _calculateReferralPoints = yield* CalculateReferralPoints;
      const _calculateResourceRewardPoints =
        yield* CalculateResourceRewardPointsService;

      const minimumBalance = Thresholds.XRD_BALANCE_THRESHOLD;

      const minimumAPThresholdMap = new Map<ActivityCategoryId, number>([
        [ActivityCategoryId.common, 1],
        [ActivityCategoryId.tradingVolume, 1],
        [ActivityCategoryId.componentCalls, 1],
        [ActivityCategoryId.transactionFees, 1],
      ]);

      const parseInput = Effect.fn(function* (
        input: CalculateSeasonPointsInput,
      ) {
        const parsedInput = calculateSeasonPointsInputSchema.safeParse(input);

        if (parsedInput.error)
          return yield* Effect.fail(
            new InputValidationError(parsedInput.error),
          );

        return parsedInput.data;
      });

      const validateSeason = Effect.fn(function* (input: {
        seasonId: string;
        force?: boolean;
        dryRun?: boolean;
      }) {
        const season = yield* seasonService.getById(input.seasonId);

        if (season.status === 'completed' && !input.force && !input.dryRun) {
          yield* Effect.log(`season ${input.seasonId} is completed`);
          return yield* Effect.fail(
            new InvalidStateError({
              message: `season ${input.seasonId} is in completed state`,
            }),
          );
        }
      });

      const validateWeek = Effect.fn(function* (
        input: CalculateSeasonPointsInput,
      ) {
        const week = yield* weekService.getById(input.weekId);

        yield* Effect.log(
          `processing week: ${week.startDate.toISOString()} - ${week.endDate.toISOString()}`,
        );

        if (week.processed && !input.force && !input.dryRun) {
          yield* Effect.log(`week ${input.weekId} is already processed`);
          return yield* Effect.fail(
            new InvalidStateError({
              message: `week ${input.weekId} is already processed`,
            }),
          );
        }
      });

      const getMinimumAPThreshold = Effect.fn(function* (
        categoryId: ActivityCategoryId,
      ) {
        // all thresholds in the map are 1, and the ACTIVITY_POINTS_THRESHOLD is too
        // so this might be unnecessary, but let's keep the structure for now
        return (
          minimumAPThresholdMap.get(categoryId) ??
          Thresholds.ACTIVITY_POINTS_THRESHOLD
        );
      });

      const getUserIdAndReferredBy = Effect.fn(function* () {
        // Get all user IDs directly from database
        return yield* Effect.tryPromise({
          try: () =>
            db
              .select({ id: users.id, referredBy: users.referredBy })
              .from(users)
              .then((result) =>
                result.map((row) => ({
                  userId: row.id,
                  referredBy: row.referredBy,
                })),
              ),
          catch: (error) => new DbError(error),
        });
      });

      const _markAsProcessed = Effect.fn(function* (
        input: CalculateSeasonPointsInput,
      ) {
        if (input.markAsProcessed) {
          yield* updateWeekStatus.run({
            id: input.weekId,
            processed: true,
          });
        }
      });

      return {
        run: Effect.fn(function* (input: CalculateSeasonPointsInput) {
          yield* Effect.log('calculating season points', input);

          yield* parseInput(input);

          const season = yield* seasonService.getByWeekId(input.weekId);

          yield* validateSeason({
            seasonId: season.id,
            force: input.force,
            dryRun: input.dryRun,
          });

          yield* validateWeek(input);

          const activityCategories =
            yield* activityCategoryWeekService.getByWeekId({
              weekId: input.weekId,
            });

          const seasonPointMultipliers = yield* getSeasonPointMultiplier
            .run({
              weekId: input.weekId,
            })
            .pipe(Effect.map((items) => groupBy(items, (item) => item.userId)));

          const userActivityPointsGroupedByActivityCategory =
            yield* Effect.forEach(
              activityCategories,
              Effect.fn(function* (activityCategory) {
                const users = yield* Effect.forEach(
                  activityCategory.activities,
                  Effect.fn(function* (activity) {
                    // get user activity points for activity
                    return yield* userActivityPointsService
                      .getByWeekIdAndActivityId({
                        weekId: input.weekId,
                        activityId: activity.id,
                        minPoints: yield* getMinimumAPThreshold(
                          activityCategory.categoryId,
                        ),
                        minTWABalance: minimumBalance,
                      })
                      .pipe(
                        // multiply user AP by activity multiplier
                        Effect.map((items) =>
                          items.map((item) => ({
                            ...item,
                            points: item.points.multipliedBy(
                              activity.multiplier,
                            ),
                            activityId: activity.id,
                          })),
                        ),
                      );
                  }),
                ).pipe(
                  Effect.map((items) => items.flat()),
                  // aggregate user points by user
                  Effect.map((items) =>
                    items.reduce<Record<string, BigNumber>>((acc, item) => {
                      if (!acc[item.userId]) {
                        acc[item.userId] = new BigNumber(0);
                      }

                      acc[item.userId] = acc[item.userId]!.plus(item.points);

                      return acc;
                    }, {}),
                  ),
                );

                return {
                  categoryId: activityCategory.categoryId,
                  pointsPool: activityCategory.pointsPool,
                  lowerBoundsPercentage: activityCategory.lowerBoundsPercentage,
                  outlierThresholdPercentage:
                    activityCategory.outlierThresholdPercentage,
                  enableOutlierDetection:
                    activityCategory.enableOutlierDetection,
                  users: Object.entries(users).map(([userId, points]) => ({
                    userId,
                    points,
                    multiplier:
                      seasonPointMultipliers[userId]?.[0]?.multiplier ?? '0',
                  })),
                };
              }),
            );

          // Track category statistics
          const categoryStatistics: Array<{
            categoryId: string;
            usersWithActivityPoints: number;
            finalUsersReceivingPoints: number;
            lowestApReceivingPoints: string | null;
          }> = [];

          const userSeasonPoints = yield* Effect.forEach(
            userActivityPointsGroupedByActivityCategory,
            Effect.fn(function* (activityCategory) {
              yield* Effect.log('--------------------------------');
              yield* Effect.log(
                `processing category: ${activityCategory.categoryId} with points pool: ${activityCategory.pointsPool}`,
              );

              // should not happen at this point, but just in case
              if (activityCategory.pointsPool.isZero()) {
                yield* Effect.log(
                  `activity category ${activityCategory.categoryId} has no points, skipping`,
                );
                return;
              }

              if (activityCategory.users.length === 0) {
                yield* Effect.log('no users found, skipping');
                return;
              }

              yield* Effect.log(
                `processing ${activityCategory.users.length} users`,
              );

              // Track initial count
              const usersWithActivityPoints = activityCategory.users.length;

              // conditionally detect outliers but keep them separate for later
              let withoutOutliers: typeof activityCategory.users;
              let outliers: typeof activityCategory.users;

              if (activityCategory.enableOutlierDetection) {
                const detected = yield* detectOutliers(
                  activityCategory.users,
                  activityCategory.outlierThresholdPercentage,
                  activityCategory.categoryId,
                );
                const outlierUserIds = new Set(
                  activityCategory.users
                    .filter(
                      (user) => !detected.some((d) => d.userId === user.userId),
                    )
                    .map((user) => user.userId),
                );
                withoutOutliers = detected;
                outliers = activityCategory.users.filter((user) =>
                  outlierUserIds.has(user.userId),
                );
              } else {
                withoutOutliers = activityCategory.users;
                outliers = [];
              }

              // then remove users with low activity points using revised set (without outliers)
              const withoutLowerBounds = yield* supplyPercentileTrim(
                withoutOutliers,
                {
                  lowerBoundsPercentage: activityCategory.lowerBoundsPercentage,
                },
                activityCategory.categoryId,
              );

              // add outliers back after supply percentile trim
              const finalUsers = [...withoutLowerBounds, ...outliers];

              const finalUsersReceivingPoints = finalUsers.length;

              // Find the lowest AP value among users receiving points
              const lowestApReceivingPoints =
                finalUsers.length > 0
                  ? finalUsers
                      .reduce(
                        (min, user) =>
                          user.points.lt(min) ? user.points : min,
                        finalUsers[0]!.points,
                      )
                      .toString()
                  : null;

              // Store statistics for this category
              categoryStatistics.push({
                categoryId: activityCategory.categoryId,
                usersWithActivityPoints,
                finalUsersReceivingPoints,
                lowestApReceivingPoints,
              });

              const bands = yield* createUserBands({
                numberOfBands: 20,
                poolShareStart: new BigNumber('0.98').div(100),
                poolShareStep: new BigNumber('1.15'),
                users: finalUsers,
              });

              const seasonPoints = yield* distributeSeasonPoints({
                pointsPool: activityCategory.pointsPool,
                bands,
              });

              return seasonPoints.map((sp) => ({
                ...sp,
                categoryId: activityCategory.categoryId,
              }));
            }),
          ).pipe(
            // flatten and filter out undefined
            Effect.map((items) => items.flat().filter((p) => p !== undefined)),

            // aggregate season points by user and capture category breakdowns
            Effect.map((items) => {
              const userTotals: Record<string, BigNumber> = {};
              const userCategoryBreakdowns: Record<
                string,
                Record<string, string>
              > = {};

              for (const item of items) {
                // Aggregate totals
                if (!userTotals[item.userId]) {
                  userTotals[item.userId] = new BigNumber(0);
                  userCategoryBreakdowns[item.userId] = {};
                }

                userTotals[item.userId] = userTotals[item.userId]!.plus(
                  item.seasonPoints,
                );

                // Capture category breakdown
                const multiplier =
                  seasonPointMultipliers[item.userId]?.[0]?.multiplier ?? '0';
                const multipliedPoints =
                  item.seasonPoints.multipliedBy(multiplier);
                userCategoryBreakdowns[item.userId]![item.categoryId] =
                  multipliedPoints.decimalPlaces(6).toString();
              }

              return { userTotals, userCategoryBreakdowns };
            }),

            // multiply season points by multiplier and include category data
            Effect.map(({ userTotals, userCategoryBreakdowns }) =>
              Object.entries(userTotals).map(([userId, seasonPoints]) => {
                const _multiplier =
                  seasonPointMultipliers[userId]?.[0]?.multiplier ?? '0';

                return {
                  userId,
                  seasonId: season.id,
                  points: seasonPoints.multipliedBy(1), //Season 0 doesn't use multipliers
                  weekId: input.weekId,
                  data: userCategoryBreakdowns[userId],
                };
              }),
            ),
          );

          // Get all user IDs from the database
          const userIdAndReferredBy = yield* getUserIdAndReferredBy();

          // Extract user IDs that already have season points
          const existingUserIds = new Set(
            userSeasonPoints.map((sp) => sp.userId),
          );

          // Find users that don't have season points
          const missingUserIds = userIdAndReferredBy.filter(
            ({ userId }) => !existingUserIds.has(userId),
          );

          // Create zero season points for missing users
          const zeroSeasonPoints = missingUserIds.map(({ userId }) => ({
            userId,
            seasonId: season.id,
            points: new BigNumber(0),
            weekId: input.weekId,
            data: {},
          }));

          const referredByMap = new Map<string, string>();

          for (const user of userIdAndReferredBy) {
            if (user.referredBy) {
              referredByMap.set(user.userId, user.referredBy);
            }
          }

          // Combine existing season points with zero season points for missing users
          const completeUserSeasonPoints = [
            ...zeroSeasonPoints,
            ...userSeasonPoints,
          ].map((user) => ({
            ...user,
            referredBy: referredByMap.get(user.userId),
            data: user.data ?? {},
          }));

          yield* Effect.log(
            `Adding season points for ${userSeasonPoints.length} users with calculated points and ${zeroSeasonPoints.length} users with zero points`,
          );

          //Resource reward and referral points are not used for season 0
          // const withResourceRewardPoints = yield* calculateResourceRewardPoints(
          //   {
          //     users: completeUserSeasonPoints,
          //     weekId: input.weekId,
          //   },
          // );

          // const withReferralPoints = yield* calculateReferralPoints(
          //   withResourceRewardPoints,
          // );

          // if (!input.dryRun) {
          //   yield* addSeasonPointsToUser.run(withReferralPoints);
          //   yield* markAsProcessed(input);
          // }

          yield* Effect.log('--------------------------------');

          yield* Effect.log(
            `season points for week ${input.weekId} successfully applied to users`,
          );
          return {
            userSeasonPoints: completeUserSeasonPoints,
            categoryStatistics,
          };
        }),
      };
    }),
  },
) {}
