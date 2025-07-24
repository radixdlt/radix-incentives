import { Effect } from "effect";

import type { StateEntityDetailsOperationRequest } from "@radixdlt/babylon-gateway-api-sdk";
import { EntityNonFungibleDataService } from "./entityNonFungiblesData";

import type { AtLedgerState } from "./schemas";
import { GetNftResourceManagersService } from "./getNftResourceManagers";

export class InvalidInputError {
  readonly _tag = "InvalidInputError";
  constructor(readonly error: unknown) {}
}

type GetNonFungibleBalanceInput = {
  addresses: string[];
  at_ledger_state: AtLedgerState;
  resourceAddresses?: string[];
  options?: StateEntityDetailsOperationRequest["stateEntityDetailsRequest"]["opt_ins"];
  chunkSize?: number;
  concurrency?: number;
};

export type GetNonFungibleBalanceOutput = Effect.Effect.Success<
  Awaited<ReturnType<(typeof GetNonFungibleBalanceService)["Service"]>>
>;

export class GetNonFungibleBalanceService extends Effect.Service<GetNonFungibleBalanceService>()(
  "GetNonFungibleBalanceService",
  {
    effect: Effect.gen(function* () {
      const entityNonFungibleDataService = yield* EntityNonFungibleDataService;
      const getNftResourceManagersService =
        yield* GetNftResourceManagersService;

      return Effect.fn("getNonFungibleBalanceService")(function* (
        input: GetNonFungibleBalanceInput
      ) {
        const concurrency = input.concurrency ?? 10;
        const chunkSize = input.chunkSize ?? 20;

        const optIns = { ...input.options, non_fungible_include_nfids: true };

        const resourceManagersResults = yield* getNftResourceManagersService(
          {
            addresses: input.addresses,
            at_ledger_state: input.at_ledger_state,
            resourceAddresses: input.resourceAddresses,
            options: optIns,
          },
          {
            chunkSize,
            concurrency,
          }
        );

        const result = yield* Effect.forEach(
          resourceManagersResults,
          Effect.fn(function* (resourceManagerResult) {
            const nonFungibleResources = yield* Effect.forEach(
              resourceManagerResult.items,
              Effect.fn(function* (resourceManager) {
                if (resourceManager.nftIds.length === 0) {
                  return yield* Effect.succeed({
                    resourceAddress: resourceManager.resourceAddress,
                    items: [],
                  });
                }
                return yield* entityNonFungibleDataService({
                  resource_address: resourceManager.resourceAddress,
                  non_fungible_ids: resourceManager.nftIds,
                  at_ledger_state: input.at_ledger_state,
                }).pipe(
                  Effect.withSpan("entityNonFungibleDataService"),
                  Effect.map((nftDataResult) => {
                    const items = nftDataResult.map((nftDataItem) => ({
                      id: nftDataItem.non_fungible_id,
                      lastUpdatedStateVersion:
                        nftDataItem.last_updated_at_state_version,
                      sbor: nftDataItem.data?.programmatic_json,
                      isBurned: nftDataItem.is_burned,
                    }));

                    return {
                      resourceAddress: resourceManager.resourceAddress,
                      items,
                    };
                  })
                );
              })
            );

            return {
              address: resourceManagerResult.address,
              nonFungibleResources,
            };
          }),
          { concurrency }
        );

        return { items: result };
      });
    }),
  }
) {}
