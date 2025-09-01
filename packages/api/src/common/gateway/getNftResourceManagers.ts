import type {
  NonFungibleResourcesCollectionItemVaultAggregated,
  StateEntityDetailsOperationRequest,
  StateEntityDetailsResponseItem,
} from '@radixdlt/babylon-gateway-api-sdk';
import { Config, Effect } from 'effect';
import { chunker } from '../helpers/chunker';
import { EntityNonFungiblesPageService } from './entityNonFungiblesPage';
import { GatewayError } from './errors';
import { GatewayApiClientService } from './gatewayApiClient';

import { GetNonFungibleIdsService } from './getNonFungibleIds';
import type { AtLedgerState } from './schemas';

type GetNftResourceManagersInput = {
  addresses: string[];
  at_ledger_state: AtLedgerState;
  resourceAddresses?: string[];
  options?: StateEntityDetailsOperationRequest['stateEntityDetailsRequest']['opt_ins'];
};

export class GetNftResourceManagersService extends Effect.Service<GetNftResourceManagersService>()(
  'GetNftResourceManagersService',
  {
    effect: Effect.gen(function* () {
      const gatewayClient = yield* GatewayApiClientService;
      const entityNonFungiblesPageService =
        yield* EntityNonFungiblesPageService;
      const getNonFungibleIdsService = yield* GetNonFungibleIdsService;

      const getNftResourceManagersConcurrency = yield* Config.number(
        'GET_NFT_RESOURCE_MANAGERS_CONCURRENCY',
      ).pipe(Config.withDefault(10));

      const stateEntityDetailsPageSize = yield* Config.number(
        'GatewayApi__Endpoint__StateEntityDetailsPageSize',
      ).pipe(Config.withDefault(20));

      const stateEntityDetailsConcurrency = yield* Config.number(
        'GATEWAY_STATE_ENTITY_DETAILS_CONCURRENCY',
      ).pipe(Config.withDefault(10));

      const getNftIdsConcurrency = yield* Config.number(
        'GET_NFT_IDS_CONCURRENCY',
      ).pipe(Config.withDefault(20));

      const AGGREGATION_LEVEL = 'Vault';

      const getNonFungibleResourceVaultPage = ({
        address,
        cursor,
        resourceAddress: resource_address,
        optIns,
        at_ledger_state,
      }: {
        address: string;
        cursor?: string;
        resourceAddress: string;
        optIns: StateEntityDetailsOperationRequest['stateEntityDetailsRequest']['opt_ins'];
        at_ledger_state: AtLedgerState;
      }) =>
        Effect.tryPromise({
          try: () =>
            gatewayClient.state.innerClient.entityNonFungibleResourceVaultPage({
              stateEntityNonFungibleResourceVaultsPageRequest: {
                address,
                opt_ins: optIns,
                at_ledger_state,
                cursor,
                resource_address,
              },
            }),
          catch: (error) => new GatewayError({ error }),
        }).pipe(Effect.withSpan('entityNonFungibleResourceVaultPage'));

      const getNftIds = Effect.fn(function* ({
        resourceManager,
        optIns,
        at_ledger_state,
        address,
      }: {
        resourceManager: NonFungibleResourcesCollectionItemVaultAggregated;
        optIns: StateEntityDetailsOperationRequest['stateEntityDetailsRequest']['opt_ins'];
        at_ledger_state: AtLedgerState;
        address: string;
      }) {
        const vaults = [...resourceManager.vaults.items];
        let next_cursor = resourceManager.vaults.next_cursor;
        const totalCount = resourceManager.vaults.total_count ?? 0;

        while (next_cursor && totalCount > 0) {
          const vaultsPage = yield* getNonFungibleResourceVaultPage({
            address,
            cursor: next_cursor,
            resourceAddress: resourceManager.resource_address,
            optIns,
            at_ledger_state,
          }).pipe(Effect.withSpan('getNonFungibleResourceVaultPage'));

          vaults.push(...vaultsPage.items);

          next_cursor = vaultsPage.next_cursor;
        }

        const nftIds = yield* Effect.forEach(
          vaults,
          Effect.fn(function* (vault) {
            const nftIds = vault?.items || [];

            if (vault.next_cursor && vault.total_count > 0) {
              const { ids } = yield* getNonFungibleIdsService({
                vaultAddress: vault.vault_address,
                resourceAddress: resourceManager.resource_address,
                at_ledger_state,
                address,
                cursor: vault.next_cursor,
              });
              nftIds.push(...ids);
            }

            return nftIds;
          }),
        ).pipe(Effect.map((ids) => ids.flat()));

        return {
          resourceAddress: resourceManager.resource_address,
          nftIds,
        };
      });

      const getStateEntityDetails = Effect.fn('getStateEntityDetails')(
        function* (input: {
          addresses: string[];
          optIns: StateEntityDetailsOperationRequest['stateEntityDetailsRequest']['opt_ins'];
          at_ledger_state: AtLedgerState;
        }) {
          const { addresses, optIns, at_ledger_state } = input;

          const results = yield* Effect.forEach(
            chunker(addresses, stateEntityDetailsPageSize),
            Effect.fn(function* (addresses) {
              return yield* Effect.tryPromise({
                try: () =>
                  gatewayClient.state.innerClient.stateEntityDetails({
                    stateEntityDetailsRequest: {
                      addresses,
                      opt_ins: optIns,
                      at_ledger_state,
                      aggregation_level: AGGREGATION_LEVEL,
                    },
                  }),
                catch: (error) => {
                  console.error(JSON.stringify(error, null, 2));
                  return new GatewayError({ error });
                },
              });
            }),
            { concurrency: stateEntityDetailsConcurrency },
          );

          return results;
        },
      );

      const getResourceManagers = Effect.fn(function* (input: {
        items: StateEntityDetailsResponseItem[];
        at_ledger_state: AtLedgerState;
        aggregationLevel: StateEntityDetailsOperationRequest['stateEntityDetailsRequest']['aggregation_level'];
        optIns: StateEntityDetailsOperationRequest['stateEntityDetailsRequest']['opt_ins'];
        filterResourceAddresses?: string[];
      }) {
        const { items, aggregationLevel, optIns, filterResourceAddresses } =
          input;
        return yield* Effect.forEach(
          items,
          Effect.fn(function* (item) {
            const resourceManagers =
              (item.non_fungible_resources
                ?.items as NonFungibleResourcesCollectionItemVaultAggregated[]) ??
              [];

            const address = item.address;

            let next_cursor = item.non_fungible_resources?.next_cursor;
            const totalCount = item.non_fungible_resources?.total_count ?? 0;

            while (next_cursor && totalCount > 0) {
              const entityNonFungiblesPageResult =
                yield* entityNonFungiblesPageService({
                  address,
                  at_ledger_state: input.at_ledger_state,
                  aggregation_level: aggregationLevel,
                  opt_ins: optIns,
                  cursor: next_cursor,
                });

              resourceManagers.push(
                ...(entityNonFungiblesPageResult.items as NonFungibleResourcesCollectionItemVaultAggregated[]),
              );

              next_cursor = entityNonFungiblesPageResult.next_cursor;
            }

            const filteredResourceManagers = filterResourceAddresses
              ? resourceManagers.filter((resourceManager) =>
                  filterResourceAddresses.includes(
                    resourceManager.resource_address,
                  ),
                )
              : resourceManagers;

            return {
              address,
              resourceManagers: filteredResourceManagers,
            };
          }),
        );
      });

      return Effect.fn('getNftResourceManagersService')(function* (
        input: GetNftResourceManagersInput,
      ) {
        const optIns = { ...input.options, non_fungible_include_nfids: true };

        const filterResourceAddresses = input.resourceAddresses;

        const stateEntityDetailsResults = yield* getStateEntityDetails({
          addresses: input.addresses,
          optIns,
          at_ledger_state: input.at_ledger_state,
        });

        const resourceManagerResults = yield* Effect.forEach(
          stateEntityDetailsResults,
          Effect.fn(function* (stateEntityDetails) {
            return yield* getResourceManagers({
              items: stateEntityDetails.items,
              at_ledger_state: input.at_ledger_state,
              aggregationLevel: AGGREGATION_LEVEL,
              optIns,
              filterResourceAddresses,
            });
          }),
          { concurrency: getNftResourceManagersConcurrency },
        ).pipe(
          Effect.map((items) => items.flat()),
          Effect.withSpan('getResourceManagers'),
        );

        const results = yield* Effect.forEach(
          resourceManagerResults,
          Effect.fn(function* (resourceManagerResult) {
            const nftIds = yield* Effect.forEach(
              resourceManagerResult.resourceManagers,
              (resourceManager) =>
                getNftIds({
                  resourceManager,
                  optIns,
                  at_ledger_state: input.at_ledger_state,
                  address: resourceManagerResult.address,
                }),
            );

            return {
              address: resourceManagerResult.address,
              items: nftIds,
            };
          }),
          { concurrency: getNftIdsConcurrency },
        ).pipe(Effect.withSpan('getNftIds'));

        return results;
      });
    }),
  },
) {}
