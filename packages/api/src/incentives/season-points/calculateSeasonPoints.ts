import { Data, Effect } from "effect";
import { z, type ZodError } from "zod";
import { GetSeasonByIdService } from "../season/getSeasonById";
import { GetWeekByIdService } from "../week/getWeekById";
import { GetUserActivityPointsService } from "../user/getUserActivityPoints";
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

export const calculateSeasonPointsInputSchema = z.object({
  seasonId: z.string(),
  weekId: z.string(),
  force: z.boolean().optional(),
  endOfWeek: z.boolean(),
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
      const getSeasonById = yield* GetSeasonByIdService;
      const getWeekById = yield* GetWeekByIdService;
      const getUserActivityPoints = yield* GetUserActivityPointsService;
      const addSeasonPointsToUser = yield* AddSeasonPointsToUserService;
      const updateWeekStatus = yield* UpdateWeekStatusService;
      const getSeasonPointMultiplier = yield* GetSeasonPointMultiplierService;
      const activityCategoryWeekService = yield* ActivityCategoryWeekService;

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

      const validateSeason = Effect.fn(function* (
        input: CalculateSeasonPointsInput
      ) {
        const season = yield* getSeasonById({ id: input.seasonId });

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
        const week = yield* getWeekById({ id: input.weekId });

        yield* Effect.log(
          `processing week: ${week.startDate.toISOString()} - ${week.endDate.toISOString()}`
        );

        if (week.status === "completed" && !input.force) {
          yield* Effect.log(`week ${input.weekId} is completed`);
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
        return (
          minimumAPThresholdMap.get(categoryId) ??
          Thresholds.ACTIVITY_POINTS_THRESHOLD
        );
      });

      const getUserSeasonPoints = Effect.fn(function* ({
        weekId,
        activity,
      }: {
        weekId: string;
        activity: {
          points: BigNumber;
          activityId: string;
          categoryId: ActivityCategoryKey;
        };
      }) {
        yield* Effect.log("calculating season points for activity", activity);

        if (activity.points.isZero()) {
          yield* Effect.log(
            `activity ${activity.activityId} has no points, skipping`
          );
          return;
        }

        const userActivityPoints = yield* getUserActivityPoints({
          weekId,
          activityId: activity.activityId,
          minPoints: yield* getMinimumAPThreshold(activity.categoryId),
          minTWABalance: minimumBalance,
        });

        yield* Effect.log(
          `processing ${userActivityPoints.length} users for activity ${activity.activityId}`
        );

        const withoutLowerBounds = yield* supplyPercentileTrim(
          userActivityPoints,
          {
            lowerBoundsPercentage,
          }
        );

        yield* Effect.log(
          `processing ${withoutLowerBounds.length} users surviving supply percentile trim`
        );

        const bands = yield* createUserBands({
          numberOfBands: 20,
          poolShareStart: new BigNumber("0.98"),
          poolShareStep: new BigNumber("1.15"),
          users: withoutLowerBounds,
        });

        const seasonPoints = yield* distributeSeasonPoints({
          pointsPool: activity.points,
          bands,
        });

        return seasonPoints;
      });

      const markAsProcessed = Effect.fn(function* (
        input: CalculateSeasonPointsInput
      ) {
        if (input.endOfWeek) {
          yield* updateWeekStatus({
            id: input.weekId,
            status: "completed",
          });
        }
      });

      return {
        run: Effect.fn(function* (input: CalculateSeasonPointsInput) {
          yield* Effect.log("calculating season points", input);

          yield* parseInput(input);

          yield* validateSeason(input);

          yield* validateWeek(input);

          const activities = yield* activityCategoryWeekService.getByWeekId({
            weekId: input.weekId,
          });

          const seasonPointMultipliers = yield* getSeasonPointMultiplier({
            weekId: input.weekId,
          }).pipe(Effect.map((items) => groupBy(items, (item) => item.userId)));

          const userSeasonPoints = yield* Effect.forEach(
            activities,
            Effect.fn(function* (activity) {
              return yield* getUserSeasonPoints({
                weekId: input.weekId,
                activity,
              });
            })
          ).pipe(
            // flatten and filter out undefined
            Effect.map((items) => items.flat().filter((p) => p !== undefined)),

            // aggregate season points by user
            Effect.map((items) =>
              items.reduce<Record<string, BigNumber>>((acc, curr) => {
                acc[curr.userId] =
                  acc[curr.userId]?.plus(curr.seasonPoints) ??
                  new BigNumber(curr.seasonPoints);

                return acc;
              }, {})
            ),

            // multiply season points by multiplier
            Effect.map((items) =>
              Object.entries(items).map(([userId, seasonPoints]) => {
                const multiplier =
                  seasonPointMultipliers[userId]?.[0]?.multiplier ??
                  new BigNumber(0);

                return {
                  userId,
                  seasonId: input.seasonId,
                  points: seasonPoints.multipliedBy(multiplier),
                  weekId: input.weekId,
                };
              })
            )
          );

          yield* addSeasonPointsToUser(userSeasonPoints);

          yield* markAsProcessed(input);

          yield* Effect.log(
            `season points for week ${input.weekId} successfully applied to users`
          );
        }),
      };
    }),
  }
) {}
