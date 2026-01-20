import type {
  LedgerState,
  StateEntityDetailsOperationRequest,
  StateEntityDetailsResponseItem,
} from '@radixdlt/babylon-gateway-api-sdk';
import { BigNumber } from 'bignumber.js';
import { Config, Effect } from 'effect';
import { chunker } from '../helpers/chunker';
import { EntityFungiblesPageService } from './entityFungiblesPage';
import { GatewayApiClientService } from './gatewayApiClient';

import type { AtLedgerState } from './schemas';

export type GetFungibleBalanceOutput = Effect.Effect.Success<
  Awaited<ReturnType<(typeof GetFungibleBalanceService)['Service']>>
>;

export class GetFungibleBalanceService extends Effect.Service<GetFungibleBalanceService>()(
  'GetFungibleBalanceService',
  {
    dependencies: [
      GatewayApiClientService.Default,
      EntityFungiblesPageService.Default,
    ],
    effect: Effect.gen(function* () {
      const gatewayClient = yield* GatewayApiClientService;

      const maxPageSize = yield* Config.number(
        'GatewayApi__Endpoint__MaxPageSize',
      ).pipe(Config.withDefault(100));

      const stateEntityDetailsPageSize = yield* Config.number(
        'GatewayApi__Endpoint__StateEntityDetailsPageSize',
      ).pipe(Config.withDefault(20));

      const concurrency = yield* Config.number(
        'GATEWAY_GET_FUNGIBLE_BALANCE_CONCURRENCY',
      ).pipe(Config.withDefault(5));

      const aggregationLevel = 'Global';

      const entityFungiblesPageService = yield* EntityFungiblesPageService;

      const getAggregatedFungibleBalance = Effect.fn(function* (
        item: StateEntityDetailsResponseItem,
        ledgerState: LedgerState,
      ) {
        const address = item.address;

        const allFungibleResources = item.fungible_resources?.items ?? [];

        let nextCursor = item.fungible_resources?.next_cursor;
        const totalCount = item.fungible_resources?.total_count ?? 0;

        // Use state_version for pagination (required by Gateway API when cursor is provided)
        const paginationLedgerState: AtLedgerState = {
          state_version: ledgerState.state_version,
        };

        while (nextCursor && totalCount > 0) {
          const result = yield* entityFungiblesPageService({
            address,
            aggregation_level: aggregationLevel,
            cursor: nextCursor,
            at_ledger_state: paginationLedgerState,
            limit_per_page: maxPageSize,
          });
          nextCursor = result.next_cursor;
          allFungibleResources.push(...result.items);
        }

        const fungibleResources = allFungibleResources
          .map((item) => {
            if (item.aggregation_level === 'Global') {
              const { resource_address: resourceAddress, amount } = item;

              return {
                resourceAddress,
                amount: new BigNumber(amount),
                lastUpdatedStateVersion: item.last_updated_at_state_version,
              };
            }
          })
          .filter(
            (
              item,
            ): item is {
              resourceAddress: string;
              amount: BigNumber;
              lastUpdatedStateVersion: number;
            } => !!item && item?.amount.gt(0),
          );

        return {
          address: item.address,
          fungibleResources,
          details: item.details,
          metadata: item.metadata,
        };
      });

      return Effect.fn('getFungibleBalanceService')(function* (
        input: Omit<
          StateEntityDetailsOperationRequest['stateEntityDetailsRequest'],
          'at_ledger_state'
        > & {
          at_ledger_state?: AtLedgerState;
          options?: StateEntityDetailsOperationRequest['stateEntityDetailsRequest']['opt_ins'];
        },
      ) {
        // Collect both items and ledger_state from each chunk
        const stateEntityDetailsResults = yield* Effect.forEach(
          chunker(input.addresses, stateEntityDetailsPageSize),
          Effect.fn(function* (addresses) {
            const stateEntityDetailsResult =
              yield* gatewayClient.state.innerClient.stateEntityDetails({
                stateEntityDetailsRequest: {
                  addresses,
                  opt_ins: input.options,
                  at_ledger_state: input.at_ledger_state,
                  aggregation_level: aggregationLevel,
                },
              });

            return {
              items: stateEntityDetailsResult.items,
              ledger_state: stateEntityDetailsResult.ledger_state,
            };
          }),
          {
            concurrency,
          },
        );

        const fungibleBalanceResults = yield* Effect.forEach(
          stateEntityDetailsResults,
          ({ items, ledger_state }) =>
            Effect.forEach(
              items,
              (item) => getAggregatedFungibleBalance(item, ledger_state),
              { concurrency },
            ),
          { concurrency },
        ).pipe(Effect.map((results) => results.flat().flat()));

        return fungibleBalanceResults;
      });
    }),
  },
) {}
