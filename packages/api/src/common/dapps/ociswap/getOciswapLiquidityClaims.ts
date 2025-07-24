import { Data, Effect } from "effect";

import type { AtLedgerState } from "../../gateway/schemas";
import { EntityNonFungibleDataService } from "../../gateway/entityNonFungiblesData";
import type { ProgrammaticScryptoSborValue } from "@radixdlt/babylon-gateway-api-sdk";
import { LiquidityPosition } from "./schemas";

export class FailedToParseOciswapLiquidityPositionError extends Data.TaggedError(
  "FailedToParseOciswapLiquidityPositionError"
)<{ error: unknown }> {}

export class GetOciswapLiquidityClaimsService extends Effect.Service<GetOciswapLiquidityClaimsService>()(
  "GetOciswapLiquidityClaimsService",
  {
    effect: Effect.gen(function* () {
      const entityNonFungibleDataService = yield* EntityNonFungibleDataService;
      return Effect.fn(function* (input: {
        lpResourceAddress: string;
        nonFungibleLocalIds: string[];
        at_ledger_state: AtLedgerState;
      }) {
        const nonFungibleDataResult = yield* entityNonFungibleDataService({
          resource_address: input.lpResourceAddress,
          non_fungible_ids: input.nonFungibleLocalIds,
          at_ledger_state: input.at_ledger_state,
        }).pipe(Effect.withSpan("entityNonFungibleDataService"));

        return yield* Effect.forEach(nonFungibleDataResult, (result) => {
          return Effect.gen(function* () {
            const { data, non_fungible_id } = result;

            const parsedLiquidityPosition = LiquidityPosition.safeParse(
              data?.programmatic_json as ProgrammaticScryptoSborValue
            );

            if (parsedLiquidityPosition.isErr()) {
              return yield* Effect.fail(
                new FailedToParseOciswapLiquidityPositionError({
                  error: parsedLiquidityPosition.error,
                })
              );
            }

            const position = parsedLiquidityPosition.value;

            return {
              nonFungibleId: non_fungible_id,
              resourceAddress: input.lpResourceAddress,
              liquidityPosition: {
                liquidity: position.liquidity.toString(),
                leftBound: position.left_bound,
                rightBound: position.right_bound,
              },
            };
          });
        });
      });
    }),
  }
) {}
