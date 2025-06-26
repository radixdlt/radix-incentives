import { Context, Effect, Layer } from "effect";
import type { DbClientService, DbError } from "../db/dbClient";
import { z } from "zod";
import { UpsertAccountActivityPointsService } from "./upsertAccountActivityPoints";
import { GetWeekAccountBalancesService } from "./getWeekAccountBalances";
import { calculateTWA } from "./calculateTWA";
import {
  type GetWeekByIdError,
  GetWeekByIdService,
  type WeekNotFoundError,
} from "../week/getWeekById";
import { GetTransactionFeesService } from "../transaction-fee/getTransactionFees";
import { GetComponentCallsService } from "../component/getComponentCalls";
import { GetTradingVolumeService } from "../trading-volume/getTradingVolume";

export const calculateActivityPointsInputSchema = z.object({
  weekId: z.string(),
  addresses: z.array(z.string()),
});

export type CalculateActivityPointsInput = z.infer<
  typeof calculateActivityPointsInputSchema
>;

export type CalculateActivityPointsError =
  | DbError
  | WeekNotFoundError
  | GetWeekByIdError;

export type CalculateActivityPointsDependency =
  | DbClientService
  | UpsertAccountActivityPointsService
  | GetWeekByIdService
  | GetWeekAccountBalancesService;

export class CalculateActivityPointsService extends Context.Tag(
  "CalculateActivityPointsService"
)<
  CalculateActivityPointsService,
  (
    input: CalculateActivityPointsInput
  ) => Effect.Effect<
    void,
    CalculateActivityPointsError,
    CalculateActivityPointsDependency
  >
>() {}

export const CalculateActivityPointsLive = Layer.effect(
  CalculateActivityPointsService,
  Effect.gen(function* () {
    const upsertAccountActivityPoints =
      yield* UpsertAccountActivityPointsService;
    const getWeekAccountBalances = yield* GetWeekAccountBalancesService;
    const getWeekById = yield* GetWeekByIdService;
    const getTransactionFees = yield* GetTransactionFeesService;
    const getComponentCalls = yield* GetComponentCallsService;
    const getTradingVolume = yield* GetTradingVolumeService;

    return (input) => {
      return Effect.gen(function* () {
        const week = yield* getWeekById({ id: input.weekId });

        const weekAccountBalances = yield* getWeekAccountBalances({
          startDate: week.startDate,
          endDate: week.endDate,
          addresses: input.addresses,
        }).pipe(
          // filter out maintain xrd balance activities
          Effect.map((items) =>
            items.map((item) => ({
              ...item,
              activities: item.activities.filter(
                (activity) => !activity.activityId.includes("hold_")
              ),
            }))
          ),
          Effect.flatMap((items) =>
            calculateTWA({
              items,
              week,
              calculationType: "USDValueDurationMultiplied",
            })
          ),
          // flatten the items to a list of account activity points
          Effect.map((items) =>
            Object.entries(items).flatMap(([address, activities]) =>
              Object.entries(activities).map(([activityId, points]) => ({
                accountAddress: address,
                activityId,
                activityPoints: points.toNumber(),
                weekId: week.id,
              }))
            )
          ),
          // filter out entries with 0 activity points
          Effect.map((items) =>
            items.filter((entry) => entry.activityPoints > 0)
          )
        );

        if (weekAccountBalances.length > 0) {
          yield* Effect.log(
            `adding ${weekAccountBalances.length} activity points calculations`
          );
          yield* upsertAccountActivityPoints(weekAccountBalances);
        }

        const transactionFees = yield* getTransactionFees({
          endTimestamp: week.endDate,
          startTimestamp: week.startDate,
          addresses: input.addresses,
        }).pipe(
          Effect.map((items) =>
            items.map(({ accountAddress, fee }) => ({
              weekId: week.id,
              accountAddress,
              activityId: "txFees",
              activityPoints: fee.decimalPlaces(0).toNumber(),
            }))
          )
        );

        if (transactionFees.length > 0) {
          yield* Effect.log(
            `adding ${transactionFees.length} transaction fees calculations`
          );
          yield* upsertAccountActivityPoints(transactionFees);
        }

        const componentCalls = yield* getComponentCalls({
          endTimestamp: week.endDate,
          startTimestamp: week.startDate,
          addresses: input.addresses,
        });

        if (componentCalls.length > 0) {
          yield* Effect.log(
            `adding ${componentCalls.length} component calls calculations`
          );
          yield* upsertAccountActivityPoints(
            componentCalls.map(({ accountAddress, componentCalls }) => ({
              weekId: week.id,
              accountAddress,
              activityId: "componentCalls",
              activityPoints: componentCalls,
            }))
          );
        }

        const tradingVolume = yield* getTradingVolume({
          endTimestamp: week.endDate,
          startTimestamp: week.startDate,
          addresses: input.addresses,
        });

        if (tradingVolume.length > 0) {
          yield* Effect.log(
            `adding ${tradingVolume.length} trading volume calculations`
          );
          yield* upsertAccountActivityPoints(
            tradingVolume.map(({ accountAddress, activityId, usdValue }) => ({
              weekId: week.id,
              accountAddress,
              activityId,
              activityPoints: usdValue.decimalPlaces(0).toNumber(),
            }))
          );
        }
      });
    };
  })
);
