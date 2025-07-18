import { Effect } from "effect";
import { TransactionStreamService } from "./transactionStream";

import { weftFinanceEventMatcher } from "../events/event-matchers/weftFinanceEventMatcher";
import { rootFinanceEventMatcher } from "../events/event-matchers/rootFinanceEventMatcher";
import { FilterTransactionsService } from "./filterTransactions";
import { AddEventsToDbService } from "../events/queries/addEventToDb";
import { caviarnineEventMatcher } from "../events/event-matchers/caviarnineEventMatcher";
import { hlpEventMatcher } from "../events/event-matchers/hlpEventMatcher";
import { AddToEventQueueService } from "../events/addToEventQueue";
import { commonEventMatcher } from "../events/event-matchers/commonEventMatcher";
import { AddTransactionFeeService } from "../transaction-fee/addTransactionFee";
import { AddComponentCallsService } from "../component/addComponentCalls";
import { ProcessSwapEventTradingVolumeService } from "../trading-volume/processSwapEventTradingVolume";
import type { CapturedEvent } from "../events/event-matchers/createEventMatcher";
import type { EmittableEvent } from "../events/event-matchers/types";
import { defiPlazaEventMatcher } from "../events/event-matchers/defiPlazaEventMatcher";
import { ociswapEventMatcher } from "../events/event-matchers/ociswapEventMatcher";
import { ConfigService } from "../config/configService";

export class TransactionStreamLoopService extends Effect.Service<TransactionStreamLoopService>()(
  "TransactionStreamLoopService",
  {
    effect: Effect.gen(function* () {
      const transactionStreamService = yield* TransactionStreamService;
      const configService = yield* ConfigService;
      const filterTransactionsService = yield* FilterTransactionsService;
      const addEventsToDbService = yield* AddEventsToDbService;
      const addToEventQueueService = yield* AddToEventQueueService;
      const addTransactionFeeService = yield* AddTransactionFeeService;
      const addComponentCallsService = yield* AddComponentCallsService;
      const processSwapEventTradingVolumeService =
        yield* ProcessSwapEventTradingVolumeService;
      return {
        run: Effect.fn(function* () {
          while (true) {
            const stateVersion = yield* configService.getStateVersion();

            if (!stateVersion)
              return yield* Effect.dieMessage(
                "no state version found, killing streamer"
              );

            // transactions which registered accounts are involved in
            const {
              filteredTransactions,
              stateVersion: nextStateVersion,
              registeredFeePayers,
            } = yield* transactionStreamService(stateVersion).pipe(
              Effect.flatMap(filterTransactionsService)
            );

            if (filteredTransactions.length > 0) {
              // remove duplicate transactions using Map for O(n) performance
              const transactionMap = new Map(
                filteredTransactions
                  .filter((tx) => tx.status === "CommittedSuccess")
                  .map((transaction) => [
                    transaction.transactionId,
                    transaction,
                  ])
              );
              const uniqueTransactions = Array.from(transactionMap.values());

              // get all weft finance events from transactions data
              const weftFinanceEvents =
                yield* weftFinanceEventMatcher(uniqueTransactions);

              const rootFinanceEvents =
                yield* rootFinanceEventMatcher(uniqueTransactions);

              const caviarnineEvents =
                yield* caviarnineEventMatcher(uniqueTransactions);

              const hlpEvents = yield* hlpEventMatcher(uniqueTransactions);

              const defiPlazaEvents =
                yield* defiPlazaEventMatcher(uniqueTransactions);

              const ociswapEvents =
                yield* ociswapEventMatcher(uniqueTransactions);

              const commonEvents =
                yield* commonEventMatcher(uniqueTransactions);

              // concat all captured events
              const allCapturedEvents = [
                ...caviarnineEvents,
                ...hlpEvents,
                ...defiPlazaEvents,
                ...ociswapEvents,
                ...weftFinanceEvents,
                ...rootFinanceEvents,
                ...commonEvents,
              ] as CapturedEvent<EmittableEvent>[];

              const highestFeePayerMap = new Map<string, string>();

              for (const transaction of uniqueTransactions) {
                if (transaction.highestFeePayer) {
                  highestFeePayerMap.set(
                    transaction.transactionId,
                    transaction.highestFeePayer
                  );
                }
              }

              yield* processSwapEventTradingVolumeService({
                events: allCapturedEvents,
                highestFeePayerMap,
              });

              if (allCapturedEvents.length > 0) {
                yield* addEventsToDbService(allCapturedEvents);

                yield* Effect.log(
                  "adding events to event queue",
                  allCapturedEvents.map((item) => ({
                    dApp: item.dApp,
                    eventData: item.eventData.type,
                    transactionId: item.transactionId,
                    eventIndex: item.eventIndex,
                  }))
                );
                yield* addToEventQueueService(
                  allCapturedEvents.map((event) => ({
                    transactionId: event.transactionId,
                    eventIndex: event.eventIndex,
                  }))
                );
              }

              const componentCalls = uniqueTransactions
                .map((tx) => ({
                  accountAddress: tx.highestFeePayer,
                  componentAddresses: tx.componentAddresses,
                  timestamp: new Date(tx.round_timestamp),
                }))
                .filter(
                  (
                    item
                  ): item is {
                    accountAddress: string;
                    componentAddresses: string[];
                    timestamp: Date;
                  } =>
                    item.accountAddress !== undefined &&
                    item.componentAddresses.length > 0
                );

              if (componentCalls.length > 0) {
                yield* addComponentCallsService(componentCalls);
              }
            }

            if (registeredFeePayers.length > 0) {
              yield* addTransactionFeeService(registeredFeePayers);
            }

            if (nextStateVersion !== stateVersion) {
              // updates state version and continue loop
              yield* configService.setStateVersion(nextStateVersion);
            }
          }
        }),
      };
    }),
  }
) {}
