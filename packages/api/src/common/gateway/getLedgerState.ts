import { Effect } from 'effect';
import { GatewayError } from './errors';
import { GatewayApiClientService } from './gatewayApiClient';

import type { AtLedgerState } from './schemas';

export type GetLedgerStateInput = {
  at_ledger_state: AtLedgerState;
};

export class GetLedgerStateService extends Effect.Service<GetLedgerStateService>()(
  'GetLedgerStateService',
  {
    effect: Effect.gen(function* () {
      const gatewayClient = yield* GatewayApiClientService;
      return Effect.fn('getLedgerStateService')(function* (
        input: GetLedgerStateInput,
      ) {
        const result = yield* Effect.tryPromise({
          try: () =>
            gatewayClient.stream.innerClient.streamTransactions({
              streamTransactionsRequest: {
                limit_per_page: 1,
                at_ledger_state: input.at_ledger_state,
              },
            }),
          catch: (error) => new GatewayError({ error }),
        });

        return result.ledger_state;
      });
    }),
  },
) {}
