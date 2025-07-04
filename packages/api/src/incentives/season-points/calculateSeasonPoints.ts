import { Context, Effect, Layer } from "effect";
import type { DbError } from "../db/dbClient";
import { z, type ZodError } from "zod";
import {
  type GetSeasonByIdError,
  GetSeasonByIdService,
} from "../season/getSeasonById";
import { type GetWeekByIdError, GetWeekByIdService } from "../week/getWeekById";
import {
  type GetActivitiesByWeekIdError,
  GetActivitiesByWeekIdService,
} from "../activity/getActivitiesByWeekId";
import {
  type GetUserActivityPointsError,
  GetUserActivityPointsService,
} from "../user/getUserActivityPoints";
import BigNumber from "bignumber.js";
import { createUserBands } from "./createUserBands";
import { supplyPercentileTrim } from "./supplyPercentileTrim";
import { distributeSeasonPoints } from "./distributePoints";
import { AddSeasonPointsToUserService } from "./addSeasonPointsToUser";
import { UpdateWeekStatusService } from "../week/updateWeekStatus";
import { GetSeasonPointMultiplierService } from "../season-point-multiplier/getSeasonPointMultiplier";
import { ActivityCategoryKey } from "db/incentives";
import { Thresholds } from "../../common/config/constants";

export const calculateSeasonPointsInputSchema = z.object({
  seasonId: z.string(),
  weekId: z.string(),
  force: z.boolean().optional(),
  endOfWeek: z.boolean(),
});

export type CalculateSeasonPointsInput = z.infer<
  typeof calculateSeasonPointsInputSchema
>;

class InputValidationError extends Error {
  _tag = "InputValidationError";
  constructor(public readonly error: ZodError<CalculateSeasonPointsInput>) {
    super(error.message);
  }
}

class InvalidStateError extends Error {
  _tag = "InvalidStateError";
  constructor(public readonly message: string) {
    super(message);
  }
}

export type CalculateSeasonPointsError =
  | DbError
  | InputValidationError
  | InvalidStateError
  | GetSeasonByIdError
  | GetWeekByIdError
  | GetActivitiesByWeekIdError
  | GetUserActivityPointsError;

export class CalculateSeasonPointsService extends Context.Tag(
  "CalculateSeasonPointsService"
)<
  CalculateSeasonPointsService,
  (
    input: CalculateSeasonPointsInput
  ) => Effect.Effect<void, CalculateSeasonPointsError>
>() {}

export const CalculateSeasonPointsLive = Layer.effect(
  CalculateSeasonPointsService,
  Effect.gen(function* () {
    const getSeasonById = yield* GetSeasonByIdService;
    const getWeekById = yield* GetWeekByIdService;
    const getActivitiesByWeekId = yield* GetActivitiesByWeekIdService;
    const getUserActivityPoints = yield* GetUserActivityPointsService;
    const addSeasonPointsToUser = yield* AddSeasonPointsToUserService;
    const updateWeekStatus = yield* UpdateWeekStatusService;
    const getSeasonPointMultiplier = yield* GetSeasonPointMultiplierService;

    return (input) => {
      return Effect.gen(function* () {
        yield* Effect.log("calculating season points", input);

        const parsedInput = calculateSeasonPointsInputSchema.safeParse(input);

        if (parsedInput.error)
          return yield* Effect.fail(
            new InputValidationError(parsedInput.error)
          );

        const season = yield* getSeasonById({ id: input.seasonId });

        if (season.status === "completed" && !input.force) {
          yield* Effect.log(`season ${input.seasonId} is completed`);
          return yield* Effect.fail(
            new InvalidStateError(
              `season ${input.seasonId} is in completed state`
            )
          );
        }

        const week = yield* getWeekById({ id: input.weekId });

        yield* Effect.log(
          `processing week: ${week.startDate.toISOString()} - ${week.endDate.toISOString()}`
        );

        if (week.status === "completed" && !input.force) {
          yield* Effect.log(`week ${input.weekId} is completed`);
          return yield* Effect.fail(
            new InvalidStateError(`week ${input.weekId} is already processed`)
          );
        }

        const activities = yield* getActivitiesByWeekId({
          weekId: input.weekId,
          excludeCategories: [ActivityCategoryKey.maintainXrdBalance],
        });

        yield* Effect.log("activities", activities);

        const activeActivities = activities.filter(
          (activity) => activity.status === "active"
        );

        // TODO: get values from db
        const minimumPoints = Thresholds.ACTIVITY_POINTS_THRESHOLD;
        const minimumBalance = Thresholds.XRD_BALANCE_THRESHOLD;
        const lowerBoundsPercentage = 0.1;
        const seasonPointMultipliers = yield* getSeasonPointMultiplier({
          weekId: input.weekId,
        });

        const seasonPoints = yield* Effect.forEach(
          activeActivities,
          (activity) => {
            return Effect.gen(function* () {
              if (activity.pointsPool === null) {
                yield* Effect.log(
                  `activity ${activity.activityId} has no points pool`
                );
                return;
              }

              const userActivityPoints = yield* getUserActivityPoints({
                weekId: input.weekId,
                activityId: activity.activityId,
                minPoints: minimumPoints,
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
                pointsPool: new BigNumber(activity.pointsPool),
                bands,
              });

              return seasonPoints;
            });
          }
        ).pipe(
          Effect.map((points) => points.flat().filter((p) => p !== undefined))
        );

        const seasonPointsAggregated = seasonPoints.reduce<
          Record<string, BigNumber>
        >((acc, curr) => {
          acc[curr.userId] =
            acc[curr.userId]?.plus(curr.seasonPoints) ??
            new BigNumber(curr.seasonPoints);

          return acc;
        }, {});

        const seasonPointsMultiplied = Object.entries(
          seasonPointsAggregated
        ).map(([userId, seasonPoints]) => {
          const multiplier =
            seasonPointMultipliers.find((item) => item.userId === userId)
              ?.multiplier ?? new BigNumber(0);
          return {
            userId,
            seasonPoints: seasonPoints.multipliedBy(multiplier),
          };
        });

        yield* addSeasonPointsToUser(
          seasonPointsMultiplied.map((item) => ({
            userId: item.userId,
            seasonId: input.seasonId,
            weekId: input.weekId,
            points: item.seasonPoints,
          }))
        );

        if (input.endOfWeek) {
          yield* updateWeekStatus({
            id: input.weekId,
            status: "completed",
          });
        }

        yield* Effect.log(
          `season points for week ${input.weekId} successfully applied to users`
        );
      });
    };
  })
);
