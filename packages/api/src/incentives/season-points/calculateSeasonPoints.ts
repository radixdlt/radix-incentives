import { Context, Effect, Layer } from "effect";
import type { DbClientService, DbError } from "../db/dbClient";
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
import { ApplyMultiplierService } from "../multiplier/applyMultiplier";
import { AddSeasonPointsToUserService } from "./addSeasonPointsToUser";
import { UpdateWeekStatusService } from "../week/updateWeekStatus";

export const calculateSeasonPointsInputSchema = z.object({
  seasonId: z.string(),
  weekId: z.string(),
  force: z.boolean().optional(),
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

export type CalculateSeasonPointsDependency =
  | DbClientService
  | GetSeasonByIdService
  | GetWeekByIdService
  | GetUserActivityPointsService;

export class CalculateSeasonPointsService extends Context.Tag(
  "CalculateSeasonPointsService"
)<
  CalculateSeasonPointsService,
  (
    input: CalculateSeasonPointsInput
  ) => Effect.Effect<
    void,
    CalculateSeasonPointsError,
    CalculateSeasonPointsDependency
  >
>() {}

export const CalculateSeasonPointsLive = Layer.effect(
  CalculateSeasonPointsService,
  Effect.gen(function* () {
    const getSeasonById = yield* GetSeasonByIdService;
    const getWeekById = yield* GetWeekByIdService;
    const getActivitiesByWeekId = yield* GetActivitiesByWeekIdService;
    const getUserActivityPoints = yield* GetUserActivityPointsService;
    const applyMultiplier = yield* ApplyMultiplierService;
    const addSeasonPointsToUser = yield* AddSeasonPointsToUserService;
    const updateWeekStatus = yield* UpdateWeekStatusService;

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
        });

        yield* Effect.log("activities", activities);

        const activeActivities = activities.filter(
          (activity) => activity.status === "active"
        );

        // TODO: get values from db
        const minimumPoints = 10080;
        const lowerBoundsPercentage = 0.1;

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

        const seasonPointsWithMultiplier = yield* applyMultiplier(
          Object.entries(seasonPointsAggregated).map(
            ([userId, seasonPoints]) => ({
              userId,
              seasonPoints,
            })
          )
        );

        yield* addSeasonPointsToUser(
          seasonPointsWithMultiplier.map((item) => ({
            userId: item.userId,
            seasonId: input.seasonId,
            weekId: input.weekId,
            points: item.seasonPoints,
          }))
        );

        yield* updateWeekStatus({
          id: input.weekId,
          status: "completed",
        });

        yield* Effect.log(
          `season points for week ${input.weekId} successfully applied to users`
        );
      });
    };
  })
);
