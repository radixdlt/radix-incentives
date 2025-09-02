import { Config, Effect } from 'effect';
import { GatewayApiClientService } from '../gateway/gatewayApiClient';
import { chunker } from '../helpers';
import type { AtLedgerState } from './schemas';

type GetEntityDetailsParameters = Parameters<
  GatewayApiClientService['state']['getEntityDetailsVaultAggregated']
>;

export type GetEntityDetailsInput = GetEntityDetailsParameters[0];
export type GetEntityDetailsOptions = GetEntityDetailsParameters[1];
export type GetEntityDetailsState = GetEntityDetailsParameters[2];

export class GetEntityDetailsService extends Effect.Service<GetEntityDetailsService>()(
  'GetEntityDetailsService',
  {
    dependencies: [GatewayApiClientService.Default],
    effect: Effect.gen(function* () {
      const gatewayClient = yield* GatewayApiClientService;
      const pageSize = yield* Config.number(
        'GatewayApi__Endpoint__StateEntityDetailsPageSize',
      ).pipe(Config.withDefault(20));

      return Effect.fn(function* (
        input: GetEntityDetailsInput,
        options: GetEntityDetailsOptions,
        at_ledger_state: AtLedgerState,
      ) {
        const chunks = chunker(input, pageSize);
        return yield* Effect.forEach(
          chunks,
          Effect.fn(function* (addresses) {
            return yield* gatewayClient.state.getEntityDetailsVaultAggregated(
              addresses,
              options,
              at_ledger_state,
            );
          }),
        ).pipe(Effect.map((res) => res.flat()));
      });
    }),
  },
) {}
