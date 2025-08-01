import { Config, Effect } from "effect";

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

      const getNonFungibleDataConcurrency = yield* Config.number(
        "GATEWAY_GET_NON_FUNGIBLE_DATA_CONCURRENCY"
      ).pipe(Config.withDefault(15));

      const getNonFungibleData = Effect.fn(function* (input: {
        items: {
          resourceAddress: string;
          nftIds: string[];
        }[];

        at_ledger_state: AtLedgerState;
      }) {
        return yield* Effect.forEach(
          input.items,
          Effect.fn(function* (item) {
            if (item.nftIds.length === 0) {
              return yield* Effect.succeed({
                resourceAddress: item.resourceAddress,
                items: [],
              });
            }

            const result = yield* entityNonFungibleDataService({
              resource_address: item.resourceAddress,
              non_fungible_ids: item.nftIds,
              at_ledger_state: input.at_ledger_state,
            });

            const items = result.map((nftDataItem) => ({
              id: nftDataItem.non_fungible_id,
              lastUpdatedStateVersion:
                nftDataItem.last_updated_at_state_version,
              sbor: nftDataItem.data?.programmatic_json,
              isBurned: nftDataItem.is_burned,
            }));

            return {
              resourceAddress: item.resourceAddress,
              items,
            };
          })
        );
      });

      return Effect.fn("getNonFungibleBalanceService")(function* (
        input: GetNonFungibleBalanceInput
      ) {
        const optIns = { ...input.options, non_fungible_include_nfids: true };

        // Get non-fungible ids for each account
        const accountNonFungibleBalances = yield* getNftResourceManagersService(
          {
            addresses: input.addresses,
            at_ledger_state: input.at_ledger_state,
            resourceAddresses: input.resourceAddresses,
            options: optIns,
          }
        );

        // Get non-fungible data for each account
        const result = yield* Effect.forEach(
          accountNonFungibleBalances,
          Effect.fn(function* ({ address, items }) {
            const nonFungibleResourcesWithNftData = yield* getNonFungibleData({
              items,
              at_ledger_state: input.at_ledger_state,
            });

            return {
              address,
              nonFungibleResources: nonFungibleResourcesWithNftData,
            };
          }),
          { concurrency: getNonFungibleDataConcurrency }
        ).pipe(Effect.withSpan("get non-fungible data for each account"));

        return { items: result };
      });
    }),
  }
) {}
