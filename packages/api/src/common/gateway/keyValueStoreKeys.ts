import type { StateKeyValueStoreKeysRequest } from '@radixdlt/babylon-gateway-api-sdk';
import { Config, Data, Effect } from 'effect';
import { GatewayApiClientService, GatewayError } from './gatewayApiClient';
import type { AtLedgerState } from './schemas';

class EntityNotFoundError extends Data.TaggedError('EntityNotFoundError')<{
  message: string;
}> {}

export class KeyValueStoreKeysService extends Effect.Service<KeyValueStoreKeysService>()(
  'KeyValueStoreKeysService',
  {
    dependencies: [GatewayApiClientService.Default],
    effect: Effect.gen(function* () {
      const gatewayClient = yield* GatewayApiClientService;

      const pageSize = yield* Config.number(
        'GatewayApi__Endpoint__MaxPageSize',
      ).pipe(Config.withDefault(100));

      return Effect.fn(function* (
        input: Omit<StateKeyValueStoreKeysRequest, 'at_ledger_state'> & {
          at_ledger_state: AtLedgerState;
        },
      ) {
        return yield* gatewayClient.state.innerClient
          .keyValueStoreKeys({
            stateKeyValueStoreKeysRequest: {
              ...input,
              limit_per_page: pageSize,
            },
          })
          .pipe(
            Effect.catchTag('GatewayError', ({ error }) =>
              Effect.gen(function* () {
                if (error instanceof Error && error.message.includes('404')) {
                  const ledgerState =
                    'state_version' in input.at_ledger_state
                      ? input.at_ledger_state.state_version
                      : input.at_ledger_state.timestamp.toISOString();

                  return yield* new EntityNotFoundError({
                    message: `Key value store '${input.key_value_store_address}' not found at ledger state ${ledgerState}`,
                  });
                }

                return yield* new GatewayError({ error });
              }),
            ),
          );
      });
    }),
  },
) {}
