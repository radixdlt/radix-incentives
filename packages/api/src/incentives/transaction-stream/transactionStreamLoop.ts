import { Effect } from "effect";
import { TransactionStreamService } from "./transactionStream";

import { StateVersionManagerService } from "./stateVersionManager";
import { GetLedgerStateService } from "../../common/gateway/getLedgerState";
import { weftFinanceEventMatcher } from "./event-matchers/weftFinanceEventMatcher";
import { FilterTransactionsService } from "./filterTransactions";
import { AddEventsToDbService } from "../events/addEventToDb";
import { AddTransactionsToDbService } from "./addTransactionsToDb";

export const transactionStreamLoop = (startStateVersion: number) =>
  Effect.gen(function* () {
    const transactionStreamService = yield* TransactionStreamService;
    const stateVersionManager = yield* StateVersionManagerService;
    const getLedgerStateService = yield* GetLedgerStateService;
    const filterTransactionsService = yield* FilterTransactionsService;
    const addEventsToDbService = yield* AddEventsToDbService;
    const addTransactionsToDbService = yield* AddTransactionsToDbService;

    const ledgerState = yield* getLedgerStateService({
      at_ledger_state: {
        state_version: startStateVersion,
      },
    });

    yield* stateVersionManager.setStateVersion(ledgerState.state_version);

    yield* Effect.log("starting streamer at ledger state", ledgerState);

    while (true) {
      const nextStateVersion = yield* stateVersionManager.getStateVersion();

      if (!nextStateVersion)
        return yield* Effect.dieMessage(
          "no state version found, killing streamer"
        );

      // transactions which registered accounts are involved in
      const { filteredTransactions, stateVersion } =
        yield* transactionStreamService(nextStateVersion).pipe(
          Effect.flatMap(filterTransactionsService)
        );

      if (filteredTransactions.length > 0) {
        // stores transactions which registered accounts are involved in
        yield* addTransactionsToDbService(filteredTransactions);

        // get all weft finance events from transactions data
        const weftFinanceEvents =
          yield* weftFinanceEventMatcher(filteredTransactions);

        // concat all captured events and add account address to each event
        const allCapturedEvents = [...weftFinanceEvents];

        // store all captured events to db
        if (allCapturedEvents.length > 0) {
          yield* Effect.log("adding events to db", allCapturedEvents);
          yield* addEventsToDbService(allCapturedEvents);
        }
      }

      // updates state version and continue loop
      yield* stateVersionManager.setStateVersion(stateVersion);
    }
  });
