import type { StateKeyValueStoreDataRequest } from '@radixdlt/babylon-gateway-api-sdk';
import { Config, Effect } from 'effect';
import { chunker } from '../helpers';
import { GatewayError } from './errors';
import { GatewayApiClientService } from './gatewayApiClient';
import type { AtLedgerState } from './schemas';

export class KeyValueStoreDataService extends Effect.Service<KeyValueStoreDataService>()(
  'KeyValueStoreDataService',
  {
    effect: Effect.gen(function* () {
      const gatewayClient = yield* GatewayApiClientService;
      const pageSize = yield* Config.number(
        'GatewayApi__Endpoint__MaxPageSize',
      ).pipe(Config.withDefault(100));

      return Effect.fn(function* (
        input: Omit<StateKeyValueStoreDataRequest, 'at_ledger_state'> & {
          at_ledger_state: AtLedgerState;
        },
      ) {
        const chunks = chunker(input.keys, pageSize);
        return yield* Effect.forEach(
          chunks,
          Effect.fn(function* (keys) {
            return yield* Effect.tryPromise({
              try: () =>
                gatewayClient.state.innerClient.keyValueStoreData({
                  stateKeyValueStoreDataRequest: {
                    keys,
                    at_ledger_state: input.at_ledger_state,
                    key_value_store_address: input.key_value_store_address,
                  },
                }),
              catch: (error) => new GatewayError({ error }),
            });
          }),
        ).pipe(Effect.map((res) => res.flat()));
      });
    }),
  },
) {}
