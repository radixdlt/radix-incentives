import { Context, Effect, Layer } from "effect";
import BigNumber from "bignumber.js";
import { AddTradingVolumeService } from "./addTradingVolume";
import type { GetUsdValueServiceError } from "../token-price/getUsdValue";
import type { DbError } from "../db/dbClient";
import type { CapturedEvent } from "../events/event-matchers/createEventMatcher";
import type { EmittableEvent } from "../events/event-matchers/types";
import { FilterTradingEventsService } from "./filterTradingEvents";
import { groupBy } from "effect/Array";
import type { ActivityId } from "data";

export type ProcessSwapEventTradingVolumeServiceInput = {
  events: CapturedEvent<EmittableEvent>[];
  highestFeePayerMap: Map<string, string>;
};

export type ProcessSwapEventTradingVolumeServiceError =
  | DbError
  | GetUsdValueServiceError;

export class ProcessSwapEventTradingVolumeService extends Context.Tag(
  "ProcessSwapEventTradingVolumeService"
)<
  ProcessSwapEventTradingVolumeService,
  (
    input: ProcessSwapEventTradingVolumeServiceInput
  ) => Effect.Effect<void, ProcessSwapEventTradingVolumeServiceError>
>() {}

export const ProcessSwapEventTradingVolumeLive = Layer.effect(
  ProcessSwapEventTradingVolumeService,
  Effect.gen(function* () {
    const addTradingVolumeService = yield* AddTradingVolumeService;
    const filterTradingEventsService = yield* FilterTradingEventsService;

    return (input) => {
      return Effect.gen(function* () {
        const groupedByTransactionId = yield* filterTradingEventsService(
          input.events
        ).pipe(
          Effect.map((events) =>
            groupBy(events, (event) => event.transactionId)
          )
        );

        const items: {
          timestamp: Date;
          accountAddress: string;
          data: {
            activityId: ActivityId;
            usdValue: string;
          }[];
        }[] = [];

        for (const transactionId in groupedByTransactionId) {
          const tradingEvents = groupedByTransactionId[transactionId] ?? [];
          if (tradingEvents.length === 0) {
            continue;
          }

          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          const timestamp = tradingEvents[0]!.timestamp;
          const accountAddress = input.highestFeePayerMap.get(transactionId);
          const data: {
            activityId: ActivityId;
            usdValue: string;
          }[] = [];

          const groupedByActivityId = groupBy(
            tradingEvents,
            (event) => event.activityId
          );

          for (const key in groupedByActivityId) {
            const tradingEventsForActivity = groupedByActivityId[key] ?? [];
            if (tradingEventsForActivity.length === 0) {
              continue;
            }

            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            const activityId = groupedByActivityId[key]![0]!.activityId;

            const aggregatedUsdValue = tradingEventsForActivity.reduce(
              (acc, event) => acc.plus(event.usdValue),
              new BigNumber(0)
            );

            if (accountAddress && aggregatedUsdValue.gt(0)) {
              data.push({
                activityId,
                usdValue: aggregatedUsdValue.decimalPlaces(2).toString(),
              });
            }
          }

          if (data.length && accountAddress) {
            items.push({
              timestamp,
              accountAddress,
              data,
            });
          }
        }

        if (items.length) {
          yield* addTradingVolumeService(items);
        }
      });
    };
  })
);
