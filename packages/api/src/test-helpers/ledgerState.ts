import { Effect } from 'effect';
import { GetLedgerStateService } from '../common/gateway';

export const getLedgerStateByDate = (date: Date) =>
  Effect.gen(function* () {
    const getLedgerState = yield* GetLedgerStateService;

    return yield* getLedgerState({
      at_ledger_state: {
        timestamp: date,
      },
    }).pipe(
      Effect.map((ledgerState) => ({
        stateVersion: ledgerState.state_version,
        timestamp: new Date(ledgerState.proposer_round_timestamp),
      })),
    );
  }).pipe(Effect.provide(GetLedgerStateService.Default));
