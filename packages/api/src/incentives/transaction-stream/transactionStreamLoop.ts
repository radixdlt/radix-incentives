import { Effect } from "effect";
import { TransactionStreamService } from "./transactionStream";

import { StateVersionManagerService } from "./stateVersionManager";
import { weftFinanceEventMatcher } from "../events/event-matchers/weftFinanceEventMatcher";
import { FilterTransactionsService } from "./filterTransactions";
import { AddEventsToDbService } from "../events/queries/addEventToDb";
import { AddTransactionsToDbService } from "./addTransactionsToDb";
import { caviarnineEventMatcher } from "../events/event-matchers/caviarnineEventMatcher";
import { AddToEventQueueService } from "../events/addToEventQueue";
import { commonEventMatcher } from "../events/event-matchers/commonEventMatcher";
import { AddTransactionFeeService } from "../transaction-fee/addTransactionFee";

export const transactionStreamLoop = () =>
  Effect.gen(function* () {
    const transactionStreamService = yield* TransactionStreamService;
    const stateVersionManager = yield* StateVersionManagerService;
    const filterTransactionsService = yield* FilterTransactionsService;
    const addEventsToDbService = yield* AddEventsToDbService;
    const addTransactionsToDbService = yield* AddTransactionsToDbService;
    const addToEventQueueService = yield* AddToEventQueueService;
    const addTransactionFeeService = yield* AddTransactionFeeService;

    while (true) {
      const nextStateVersion = yield* stateVersionManager.getStateVersion();

      if (!nextStateVersion)
        return yield* Effect.dieMessage(
          "no state version found, killing streamer"
        );

      // transactions which registered accounts are involved in
      const { filteredTransactions, stateVersion, registeredFeePayers } =
        yield* transactionStreamService(nextStateVersion).pipe(
          Effect.flatMap(filterTransactionsService)
        );

      if (filteredTransactions.length > 0) {
        // remove duplicate transactions using Map for O(n) performance
        const transactionMap = new Map(
          filteredTransactions
            .filter((tx) => tx.status === "CommittedSuccess")
            .map((transaction) => [transaction.transactionId, transaction])
        );
        const uniqueTransactions = Array.from(transactionMap.values());

        // stores transactions which registered accounts are involved in
        yield* addTransactionsToDbService(uniqueTransactions);

        // get all weft finance events from transactions data
        const weftFinanceEvents =
          yield* weftFinanceEventMatcher(uniqueTransactions);

        const caviarnineEvents =
          yield* caviarnineEventMatcher(uniqueTransactions);

        const commonEvents = yield* commonEventMatcher(uniqueTransactions);

        // concat all captured events
        const allCapturedEvents = [
          ...caviarnineEvents,
          ...weftFinanceEvents,
          ...commonEvents,
        ];

        // store all captured events to db
        if (allCapturedEvents.length > 0) {
          yield* addEventsToDbService(allCapturedEvents);
        }

        if (allCapturedEvents.length > 0) {
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
      }

      if (registeredFeePayers.length > 0) {
        yield* addTransactionFeeService(registeredFeePayers);
      }

      // updates state version and continue loop
      yield* stateVersionManager.setStateVersion(stateVersion);
    }
  });
