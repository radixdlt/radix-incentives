import { Context, Effect, Layer } from "effect";
import {
  type GatewayApiClientImpl,
  GatewayApiClientService,
} from "./gatewayApiClient";

import { type EntityNotFoundError, GatewayError } from "./errors";
import type { GetLedgerStateService } from "./getLedgerState";
import type {
  NonFungibleResourcesCollectionItemVaultAggregated,
  StateEntityDetailsResponseItem,
} from "@radixdlt/babylon-gateway-api-sdk";
import { EntityNonFungiblesPageService } from "./entityNonFungiblesPage";
import { chunker } from "../helpers/chunker";

import type { AtLedgerState } from "./schemas";
import { GetNonFungibleIdsService } from "./getNonFungibleIds";

export class InvalidInputError {
  readonly _tag = "InvalidInputError";
  constructor(readonly error: unknown) {}
}

type StateEntityDetailsParams = Parameters<
  GatewayApiClientImpl["gatewayApiClient"]["state"]["innerClient"]["stateEntityDetails"]
>[0]["stateEntityDetailsRequest"];

type StateEntityDetailsOptionsParams = StateEntityDetailsParams["opt_ins"];

type GetNftResourceManagersInput = {
  addresses: string[];
  at_ledger_state: AtLedgerState;
  resourceAddresses?: string[];
  options?: StateEntityDetailsOptionsParams;
};

type GetNftResourceManagersOutput = {
  address: string;
  items: { resourceAddress: string; nftIds: string[] }[];
}[];

export type GetNftResourceManagersServiceError =
  | EntityNotFoundError
  | InvalidInputError
  | GatewayError;

export type GetNftResourceManagersServiceDependencies =
  | GatewayApiClientService
  | EntityNonFungiblesPageService
  | GetLedgerStateService
  | GetNonFungibleIdsService;

export class GetNftResourceManagersService extends Context.Tag(
  "GetNftResourceManagersService"
)<
  GetNftResourceManagersService,
  (
    input: GetNftResourceManagersInput
  ) => Effect.Effect<
    GetNftResourceManagersOutput,
    GetNftResourceManagersServiceError,
    GetNftResourceManagersServiceDependencies
  >
>() {}

export const GetNftResourceManagersLive = Layer.effect(
  GetNftResourceManagersService,
  Effect.gen(function* () {
    const gatewayClient = yield* GatewayApiClientService;
    const entityNonFungiblesPageService = yield* EntityNonFungiblesPageService;
    const getNonFungibleIdsService = yield* GetNonFungibleIdsService;

    return (input) => {
      return Effect.gen(function* () {
        yield* Effect.logTrace(input);
        const aggregationLevel = "Vault";

        const optIns = { ...input.options, non_fungible_include_nfids: true };

        const filterResourceAddresses = input.resourceAddresses;

        const getStateEntityDetails = (addresses: string[]) =>
          Effect.tryPromise({
            try: () =>
              gatewayClient.gatewayApiClient.state.innerClient.stateEntityDetails(
                {
                  stateEntityDetailsRequest: {
                    addresses: addresses,
                    opt_ins: optIns,
                    at_ledger_state: input.at_ledger_state,
                    aggregation_level: aggregationLevel,
                  },
                }
              ),
            catch: (error) => new GatewayError(error),
          }).pipe(Effect.withSpan("getStateEntityDetails"));

        const getNonFungibleResourceVaultPage = ({
          address,
          cursor,
          resourceAddress: resource_address,
        }: {
          address: string;
          cursor?: string;
          resourceAddress: string;
        }) =>
          Effect.tryPromise({
            try: () =>
              gatewayClient.gatewayApiClient.state.innerClient.entityNonFungibleResourceVaultPage(
                {
                  stateEntityNonFungibleResourceVaultsPageRequest: {
                    address,
                    opt_ins: optIns,
                    at_ledger_state: input.at_ledger_state,
                    cursor,
                    resource_address,
                  },
                }
              ),
            catch: (error) => new GatewayError(error),
          }).pipe(Effect.withSpan("entityNonFungibleResourceVaultPage"));

        const getResourceManagers = (items: StateEntityDetailsResponseItem[]) =>
          Effect.forEach(items, (item) =>
            Effect.gen(function* () {
              const resourceManagers =
                (item.non_fungible_resources
                  ?.items as NonFungibleResourcesCollectionItemVaultAggregated[]) ??
                [];

              const address = item.address;

              let next_cursor = item.non_fungible_resources?.next_cursor;

              while (next_cursor) {
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

        const chunks = chunker(input.addresses, 20);

        return yield* Effect.forEach(
          chunks,
          (chunk) =>
            Effect.gen(function* () {
              const stateEntityDetails = yield* getStateEntityDetails(chunk);

              const resourceManagerResults = yield* getResourceManagers(
                stateEntityDetails.items
              );

              return yield* Effect.forEach(
                resourceManagerResults,
                (resourceManagerResult) => {
                  return Effect.gen(function* () {
                    const nftIds = yield* Effect.forEach(
                      resourceManagerResult.resourceManagers,
                      (resourceManager) => {
                        return Effect.gen(function* () {
                          const vaults = [...resourceManager.vaults.items];
                          let next_cursor = resourceManager.vaults.next_cursor;

                          while (next_cursor) {
                            const vaultsPage =
                              yield* getNonFungibleResourceVaultPage({
                                address: resourceManagerResult.address,
                                cursor: next_cursor,
                                resourceAddress:
                                  resourceManager.resource_address,
                              }).pipe(
                                Effect.withSpan(
                                  "getNonFungibleResourceVaultPage"
                                )
                              );

                            vaults.push(...vaultsPage.items);

                            next_cursor = vaultsPage.next_cursor;
                          }

                          const nftIds = yield* Effect.forEach(
                            vaults,
                            (vault) =>
                              Effect.gen(function* () {
                                const nftIds = vault?.items || [];

                                if (vault.next_cursor) {
                                  const { ids } =
                                    yield* getNonFungibleIdsService({
                                      vaultAddress: vault.vault_address,
                                      resourceAddress:
                                        resourceManager.resource_address,
                                      at_ledger_state: input.at_ledger_state,
                                      address: resourceManagerResult.address,
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
                      }
                    );

                    return {
                      address: resourceManagerResult.address,
                      items: nftIds,
                    };
                  });
                }
              );
            }),
          { concurrency: 15 }
        ).pipe(Effect.map((items) => items.flat()));
      });
    };
  })
);
