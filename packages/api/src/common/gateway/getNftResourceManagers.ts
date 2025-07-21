import { Effect } from "effect";
import { GatewayApiClientService } from "./gatewayApiClient";
import { GatewayError } from "./errors";
import type {
  NonFungibleResourcesCollectionItemVaultAggregated,
  StateEntityDetailsOperationRequest,
  StateEntityDetailsResponseItem,
} from "@radixdlt/babylon-gateway-api-sdk";
import { EntityNonFungiblesPageService } from "./entityNonFungiblesPage";
import { chunker } from "../helpers/chunker";

import type { AtLedgerState } from "./schemas";
import { GetNonFungibleIdsService } from "./getNonFungibleIds";

type GetNftResourceManagersInput = {
  addresses: string[];
  at_ledger_state: AtLedgerState;
  resourceAddresses?: string[];
  options?: StateEntityDetailsOperationRequest["stateEntityDetailsRequest"]["opt_ins"];
};

export class GetNftResourceManagersService extends Effect.Service<GetNftResourceManagersService>()(
  "GetNftResourceManagersService",
  {
    effect: Effect.gen(function* () {
      const gatewayClient = yield* GatewayApiClientService;
      const entityNonFungiblesPageService =
        yield* EntityNonFungiblesPageService;
      const getNonFungibleIdsService = yield* GetNonFungibleIdsService;

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
        optIns: StateEntityDetailsOperationRequest["stateEntityDetailsRequest"]["opt_ins"];
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
        }).pipe(Effect.withSpan("entityNonFungibleResourceVaultPage"));

      const getNftIds = Effect.fn(function* ({
        resourceManager,
        optIns,
        at_ledger_state,
        address,
      }: {
        resourceManager: NonFungibleResourcesCollectionItemVaultAggregated;
        optIns: StateEntityDetailsOperationRequest["stateEntityDetailsRequest"]["opt_ins"];
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
          }).pipe(Effect.withSpan("getNonFungibleResourceVaultPage"));

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
          })
        ).pipe(
          Effect.withSpan("getNonFungibleResourceVaultPage"),
          Effect.map((ids) => ids.flat())
        );

        return {
          resourceAddress: resourceManager.resource_address,
          nftIds,
        };
      });

      const getStateEntityDetails = (
        addresses: string[],
        optIns: StateEntityDetailsOperationRequest["stateEntityDetailsRequest"]["opt_ins"],
        at_ledger_state: AtLedgerState,
        aggregationLevel: StateEntityDetailsOperationRequest["stateEntityDetailsRequest"]["aggregation_level"]
      ) =>
        Effect.tryPromise({
          try: () =>
            gatewayClient.state.innerClient.stateEntityDetails({
              stateEntityDetailsRequest: {
                addresses: addresses,
                opt_ins: optIns,
                at_ledger_state,
                aggregation_level: aggregationLevel,
              },
            }),
          catch: (error) => new GatewayError({ error }),
        }).pipe(Effect.withSpan("getStateEntityDetails"));

      return Effect.fn(function* (
        input: GetNftResourceManagersInput,
        options?: {
          chunkSize?: number;
          concurrency?: number;
        }
      ) {
        yield* Effect.logTrace(input);
        const aggregationLevel = "Vault";

        const optIns = { ...input.options, non_fungible_include_nfids: true };

        const chunkSize = options?.chunkSize ?? 20;
        const concurrency = options?.concurrency ?? 10;

        const filterResourceAddresses = input.resourceAddresses;

        const getResourceManagers = (items: StateEntityDetailsResponseItem[]) =>
          Effect.forEach(items, (item) =>
            Effect.gen(function* () {
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
                  }).pipe(Effect.withSpan("entityNonFungiblesPageService"));

                resourceManagers.push(
                  ...(entityNonFungiblesPageResult.items as NonFungibleResourcesCollectionItemVaultAggregated[])
                );

                next_cursor = entityNonFungiblesPageResult.next_cursor;
              }

              const filteredResourceManagers = filterResourceAddresses
                ? resourceManagers.filter((resourceManager) =>
                    filterResourceAddresses.includes(
                      resourceManager.resource_address
                    )
                  )
                : resourceManagers;

              return {
                address,
                resourceManagers: filteredResourceManagers,
              };
            })
          );

        const addressChunks = chunker(input.addresses, chunkSize);

        const stateEntityDetailsResults = yield* Effect.forEach(
          addressChunks,
          Effect.fn(function* (addresses) {
            return yield* getStateEntityDetails(
              addresses,
              optIns,
              input.at_ledger_state,
              aggregationLevel
            );
          }),
          { concurrency }
        ).pipe(Effect.map((items) => items.flat()));

        const resourceManagerResults = yield* Effect.forEach(
          stateEntityDetailsResults,
          Effect.fn(function* (stateEntityDetails) {
            return yield* getResourceManagers(stateEntityDetails.items);
          }),
          { concurrency }
        ).pipe(Effect.map((items) => items.flat()));

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
                })
            );

            return {
              address: resourceManagerResult.address,
              items: nftIds,
            };
          }),
          { concurrency }
        );

        return results;
      });
    }),
  }
) {}
