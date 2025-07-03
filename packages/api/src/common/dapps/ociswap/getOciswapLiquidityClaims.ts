import { Context, Effect, Layer } from "effect";

import type { AtLedgerState } from "../../gateway/schemas";
import { EntityNonFungibleDataService } from "../../gateway/entityNonFungiblesData";
import type { ProgrammaticScryptoSborValue } from "@radixdlt/babylon-gateway-api-sdk";
import type { GatewayError } from "../../gateway/errors";
import { LiquidityPosition } from "./schemas";
import type { InvalidComponentStateError } from "../../gateway/getComponentState";

export class FailedToParseOciswapLiquidityPositionError {
  readonly _tag = "FailedToParseOciswapLiquidityPositionError";
  constructor(readonly error: unknown) {}
}

export class GetOciswapLiquidityClaimsService extends Context.Tag(
  "GetOciswapLiquidityClaimsService"
)<
  GetOciswapLiquidityClaimsService,
  (input: {
    lpResourceAddress: string;
    nonFungibleLocalIds: string[];
    at_ledger_state: AtLedgerState;
  }) => Effect.Effect<
    {
      nonFungibleId: string;
      resourceAddress: string;
      liquidityPosition: {
        liquidity: string;
        leftBound: number;
        rightBound: number;
      };
    }[],
    | FailedToParseOciswapLiquidityPositionError
    | GatewayError
    | InvalidComponentStateError
  >
>() {}

export const GetOciswapLiquidityClaimsLive = Layer.effect(
  GetOciswapLiquidityClaimsService,
  Effect.gen(function* () {
    const entityNonFungibleDataService = yield* EntityNonFungibleDataService;

    return (input) => {
      return Effect.gen(function* () {
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
                new FailedToParseOciswapLiquidityPositionError(
                  parsedLiquidityPosition.error
                )
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
    };
  })
);