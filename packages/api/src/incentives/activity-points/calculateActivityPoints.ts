import { Context, Effect, Layer } from "effect";
import type { DbError } from "../db/dbClient";
import { z } from "zod";
import { UpsertAccountActivityPointsService } from "./upsertAccountActivityPoints";
import { CalculateActivityPointsSQLService } from "./calculateActivityPointsSQL";
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

export class CalculateActivityPointsService extends Context.Tag(
  "CalculateActivityPointsService"
)<
  CalculateActivityPointsService,
  (
    input: CalculateActivityPointsInput
  ) => Effect.Effect<void, CalculateActivityPointsError>
>() {}

export const CalculateActivityPointsLive = Layer.effect(
  CalculateActivityPointsService,
  Effect.gen(function* () {
    const upsertAccountActivityPoints =
      yield* UpsertAccountActivityPointsService;
    const calculateActivityPointsSQL = yield* CalculateActivityPointsSQLService;
    const getWeekById = yield* GetWeekByIdService;
    const getTransactionFees = yield* GetTransactionFeesService;
    const getComponentCalls = yield* GetComponentCallsService;
    const getTradingVolume = yield* GetTradingVolumeService;

    return (input) => {
      return Effect.gen(function* () {
        const week = yield* getWeekById({ id: input.weekId });

        // Use SQL-based calculation instead of loading data into memory
        const weekAccountBalances = yield* calculateActivityPointsSQL({
          weekId: input.weekId,
          addresses: input.addresses,
          startDate: week.startDate,
          endDate: week.endDate,
          calculationType: "USDValueDurationMultiplied",
        }).pipe(
          Effect.tap(() => Effect.log("Calculated activity points using SQL")),
          Effect.tap((items) => Effect.log(`Found ${items.length} activity point entries`))
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
          Effect.withSpan("getTransactionFees"),
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
        }).pipe(Effect.withSpan("getComponentCalls"));

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
        }).pipe(Effect.withSpan("getTradingVolume"));

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
