import { Effect } from "effect";
import { BigNumber } from "bignumber.js";
import { GatewayApiClientService } from "./gatewayApiClient";
import { EntityFungiblesPageService } from "./entityFungiblesPage";
import { GatewayError } from "./errors";
import type {
  StateEntityDetailsOperationRequest,
  StateEntityDetailsResponseItem,
} from "@radixdlt/babylon-gateway-api-sdk";

import { chunker } from "../helpers/chunker";

import type { AtLedgerState } from "./schemas";

export type GetFungibleBalanceOutput = Effect.Effect.Success<
  Awaited<ReturnType<(typeof GetFungibleBalanceService)["Service"]>>
>;

export class GetFungibleBalanceService extends Effect.Service<GetFungibleBalanceService>()(
  "GetFungibleBalanceService",
  {
    effect: Effect.gen(function* () {
      const gatewayClient = yield* GatewayApiClientService;

      const aggregationLevel = "Global";

      const entityFungiblesPageService = yield* EntityFungiblesPageService;

      const getAggregatedFungibleBalance = Effect.fn(function* (
        item: StateEntityDetailsResponseItem,
        at_ledger_state: AtLedgerState
      ) {
        const address = item.address;

        const allFungibleResources = item.fungible_resources?.items ?? [];

        let nextCursor = item.fungible_resources?.next_cursor;
        const totalCount = item.fungible_resources?.total_count ?? 0;

        while (nextCursor && totalCount > 0) {
          const result = yield* entityFungiblesPageService({
            address,
            aggregation_level: aggregationLevel,
            cursor: nextCursor,
            at_ledger_state,
          });
          nextCursor = result.next_cursor;
          allFungibleResources.push(...result.items);
        }

        const fungibleResources = allFungibleResources
          .map((item) => {
            if (item.aggregation_level === "Global") {
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
              item
            ): item is {
              resourceAddress: string;
              amount: BigNumber;
              lastUpdatedStateVersion: number;
            } => !!item && item?.amount.gt(0)
          );

        return {
          address: item.address,
          fungibleResources,
          details: item.details,
          metadata: item.metadata,
        };
      });

      return Effect.fn(function* (
        input: Omit<
          StateEntityDetailsOperationRequest["stateEntityDetailsRequest"],
          "at_ledger_state"
        > & {
          at_ledger_state: AtLedgerState;
          options?: StateEntityDetailsOperationRequest["stateEntityDetailsRequest"]["opt_ins"];
        },
        options?: {
          chunkSize?: number;
          concurrency?: number;
        }
      ) {
        const chunkSize = options?.chunkSize ?? 20;
        const concurrency = options?.concurrency ?? 10;

        const stateEntityDetailsResults = yield* Effect.forEach(
          chunker(input.addresses, chunkSize),
          Effect.fn(function* (addresses) {
            const stateEntityDetailsResult = yield* Effect.tryPromise({
              try: () =>
                gatewayClient.state.innerClient.stateEntityDetails({
                  stateEntityDetailsRequest: {
                    addresses,
                    opt_ins: input.options,
                    at_ledger_state: input.at_ledger_state,
                    aggregation_level: aggregationLevel,
                  },
                }),
              catch: (error) => new GatewayError({ error }),
            });

            return stateEntityDetailsResult.items;
          }),
          {
            concurrency,
          }
        ).pipe(Effect.map((results) => results.flat()));

        const fungibleBalanceResults = yield* Effect.forEach(
          stateEntityDetailsResults,
          (item) => getAggregatedFungibleBalance(item, input.at_ledger_state),
          { concurrency }
        ).pipe(Effect.map((results) => results.flat()));

        return fungibleBalanceResults;
      });
    }),
  }
) {}
