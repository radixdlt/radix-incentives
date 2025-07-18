import { Data, Effect } from "effect";
import { z, type ZodError } from "zod";
import { UserActivityPointsService } from "../user/userActivityPoints";
import BigNumber from "bignumber.js";
import { createUserBands } from "./createUserBands";
import { supplyPercentileTrim } from "./supplyPercentileTrim";
import { distributeSeasonPoints } from "./distributePoints";
import { AddSeasonPointsToUserService } from "./addSeasonPointsToUser";
import { UpdateWeekStatusService } from "../week/updateWeekStatus";
import { GetSeasonPointMultiplierService } from "../season-point-multiplier/getSeasonPointMultiplier";
import { ActivityCategoryKey } from "db/incentives";
import { Thresholds } from "../../common/config/constants";
import { ActivityCategoryWeekService } from "../activity-category-week/activityCategoryWeek";
import { groupBy } from "effect/Array";
import { SeasonService } from "../season/season";
import { WeekService } from "../week/week";
import { GetUsersPaginatedService } from "../user/getUsersPaginated";

export const calculateSeasonPointsInputSchema = z.object({
  weekId: z.string(),
  force: z.boolean().optional(),
  markAsProcessed: z.boolean(),
});

export type CalculateSeasonPointsInput = z.infer<
  typeof calculateSeasonPointsInputSchema
>;

const InputValidationError = Data.TaggedError("InputValidationError")<
  ZodError<CalculateSeasonPointsInput>
>;

const InvalidStateError = Data.TaggedError("InvalidStateError")<{
  message: string;
}>;

export class CalculateSeasonPointsService extends Effect.Service<CalculateSeasonPointsService>()(
  "CalculateSeasonPointsService",
  {
    effect: Effect.gen(function* () {
      const seasonService = yield* SeasonService;
      const weekService = yield* WeekService;
      const userActivityPointsService = yield* UserActivityPointsService;
      const addSeasonPointsToUser = yield* AddSeasonPointsToUserService;
      const updateWeekStatus = yield* UpdateWeekStatusService;
      const getSeasonPointMultiplier = yield* GetSeasonPointMultiplierService;
      const activityCategoryWeekService = yield* ActivityCategoryWeekService;
      const getUsersPaginated = yield* GetUsersPaginatedService;

      const minimumBalance = Thresholds.XRD_BALANCE_THRESHOLD;
      const lowerBoundsPercentage = 0.1;
      const minimumAPThresholdMap = new Map<ActivityCategoryKey, number>([
        [ActivityCategoryKey.common, 1],
        [ActivityCategoryKey.tradingVolume, 1],
        [ActivityCategoryKey.componentCalls, 1],
        [ActivityCategoryKey.transactionFees, 1],
      ]);

      const parseInput = Effect.fn(function* (
        input: CalculateSeasonPointsInput
      ) {
        const parsedInput = calculateSeasonPointsInputSchema.safeParse(input);

        if (parsedInput.error)
          return yield* Effect.fail(
            new InputValidationError(parsedInput.error)
          );

        return parsedInput.data;
      });

      const validateSeason = Effect.fn(function* (input: {
        seasonId: string;
        force?: boolean;
      }) {
        const season = yield* seasonService.getById(input.seasonId);

        if (season.status === "completed" && !input.force) {
          yield* Effect.log(`season ${input.seasonId} is completed`);
          return yield* Effect.fail(
            new InvalidStateError({
              message: `season ${input.seasonId} is in completed state`,
            })
          );
        }
      });

      const validateWeek = Effect.fn(function* (
        input: CalculateSeasonPointsInput
      ) {
        const week = yield* weekService.getById(input.weekId);

        yield* Effect.log(
          `processing week: ${week.startDate.toISOString()} - ${week.endDate.toISOString()}`
        );

        if (week.processed && !input.force) {
          yield* Effect.log(`week ${input.weekId} is already processed`);
          return yield* Effect.fail(
            new InvalidStateError({
              message: `week ${input.weekId} is already processed`,
            })
          );
        }
      });

      const getMinimumAPThreshold = Effect.fn(function* (
        categoryId: ActivityCategoryKey
      ) {
        // all thresholds in the map are 1, and the ACTIVITY_POINTS_THRESHOLD is too
        // so this might be unnecessary, but let's keep the structure for now
        return (
          minimumAPThresholdMap.get(categoryId) ??
          Thresholds.ACTIVITY_POINTS_THRESHOLD
        );
      });

      const getAllUserIds = Effect.fn(function* () {
        const allUserIds: string[] = [];
        let page = 1;
        const limit = 100;
        let hasMore = true;

        while (hasMore) {
          const result = yield* getUsersPaginated({ page, limit });
          allUserIds.push(...result.users.map((user) => user.id));

          hasMore = result.users.length === limit;
          page++;
        }

        return allUserIds;
      });

      const markAsProcessed = Effect.fn(function* (
        input: CalculateSeasonPointsInput
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
          yield* Effect.log("calculating season points", input);

          yield* parseInput(input);

          const season = yield* seasonService.getByWeekId(input.weekId);

          yield* validateSeason({ seasonId: season.id, force: input.force });

          yield* validateWeek(input);

          const activityCategories =
            yield* activityCategoryWeekService.getByWeekId({
              weekId: input.weekId,
            });

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
                          activityCategory.categoryId
                        ),
                        minTWABalance: minimumBalance,
                      })
                      .pipe(
                        // multiply user AP by activity multiplier
                        Effect.map((items) =>
                          items.map((item) => ({
                            ...item,
                            points: item.points.multipliedBy(
                              activity.multiplier
                            ),
                            activityId: activity.id,
                          }))
                        )
                      );
                  })
                ).pipe(
                  Effect.map((items) => items.flat()),
                  // aggregate user points by user
                  Effect.map((items) =>
                    items.reduce<Record<string, BigNumber>>((acc, item) => {
                      if (!acc[item.userId]) {
                        acc[item.userId] = new BigNumber(0);
                      }

                      // biome-ignore lint/style/noNonNullAssertion: it is known
                      acc[item.userId] = acc[item.userId]!.plus(item.points);

                      return acc;
                    }, {})
                  )
                );

                return {
                  categoryId: activityCategory.categoryId,
                  pointsPool: activityCategory.pointsPool,
                  users: Object.entries(users).map(([userId, points]) => ({
                    userId,
                    points,
                  })),
                };
              })
            );

          const seasonPointMultipliers = yield* getSeasonPointMultiplier
            .run({
              weekId: input.weekId,
            })
            .pipe(Effect.map((items) => groupBy(items, (item) => item.userId)));

          const userSeasonPoints = yield* Effect.forEach(
            userActivityPointsGroupedByActivityCategory,
            Effect.fn(function* (activityCategory) {
              yield* Effect.log("--------------------------------");
              yield* Effect.log(
                `processing category: ${activityCategory.categoryId} with points pool: ${activityCategory.pointsPool}`
              );

              // should not happen at this point, but just in case
              if (activityCategory.pointsPool.isZero()) {
                yield* Effect.log(
                  `activity category ${activityCategory.categoryId} has no points, skipping`
                );
                return;
              }

              if (activityCategory.users.length === 0) {
                yield* Effect.log("no users found, skipping");
                return;
              }

              yield* Effect.log(
                `processing ${activityCategory.users.length} users`
              );

              // remove users with low activity points
              const withoutLowerBounds = yield* supplyPercentileTrim(
                activityCategory.users,
                {
                  lowerBoundsPercentage,
                }
              );

              const bands = yield* createUserBands({
                numberOfBands: 20,
                poolShareStart: new BigNumber("0.98").div(100),
                poolShareStep: new BigNumber("1.15"),
                users: withoutLowerBounds,
              });

              const seasonPoints = yield* distributeSeasonPoints({
                pointsPool: activityCategory.pointsPool,
                bands,
              });

              return seasonPoints;
            })
          ).pipe(
            // flatten and filter out undefined
            Effect.map((items) => items.flat().filter((p) => p !== undefined)),

            // aggregate season points by user
            Effect.map((items) =>
              items.reduce<Record<string, BigNumber>>((acc, curr) => {
                if (!acc[curr.userId]) {
                  acc[curr.userId] = new BigNumber(0);
                }

                // biome-ignore lint/style/noNonNullAssertion: it is known
                acc[curr.userId] = acc[curr.userId]!.plus(curr.seasonPoints);

                return acc;
              }, {})
            ),

            // multiply season points by multiplier
            Effect.map((items) =>
              Object.entries(items).map(([userId, seasonPoints]) => {
                const multiplier =
                  seasonPointMultipliers[userId]?.[0]?.multiplier ?? "0";

                return {
                  userId,
                  seasonId: season.id,
                  points: seasonPoints.multipliedBy(multiplier),
                  weekId: input.weekId,
                };
              })
            )
          );

          // Get all user IDs from the database
          const allUserIds = yield* getAllUserIds();

          // Extract user IDs that already have season points
          const existingUserIds = new Set(
            userSeasonPoints.map((sp) => sp.userId)
          );

          // Find users that don't have season points
          const missingUserIds = allUserIds.filter(
            (userId) => !existingUserIds.has(userId)
          );

          // Create zero season points for missing users
          const zeroSeasonPoints = missingUserIds.map((userId) => ({
            userId,
            seasonId: season.id,
            points: new BigNumber(0),
            weekId: input.weekId,
          }));

          // Combine existing season points with zero season points for missing users
          const completeUserSeasonPoints = [
            ...zeroSeasonPoints,
            ...userSeasonPoints,
          ];

          yield* Effect.log(
            `Adding season points for ${userSeasonPoints.length} users with calculated points and ${zeroSeasonPoints.length} users with zero points`
          );

          yield* addSeasonPointsToUser.run(completeUserSeasonPoints);

          yield* markAsProcessed(input);

          yield* Effect.log("--------------------------------");

          yield* Effect.log(
            `season points for week ${input.weekId} successfully applied to users`
          );
        }),
      };
    }),
  }
) {}
