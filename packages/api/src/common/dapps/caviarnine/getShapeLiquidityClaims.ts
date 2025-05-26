import { Context, Effect, Layer } from "effect";

import type { AtLedgerState } from "../../gateway/schemas";
import { EntityNonFungibleDataService } from "../../gateway/entityNonFungiblesData";
import type { GatewayApiClientService } from "../../gateway/gatewayApiClient";
import type { ProgrammaticScryptoSborValue } from "@radixdlt/babylon-gateway-api-sdk";
import type { GatewayError } from "../../gateway/errors";
import s from "sbor-ez-mode";
import type { InvalidComponentStateError } from "../../gateway/getComponentState";

export class FailedToParseLiquidityClaimsError {
  readonly _tag = "FailedToParseLiquidityClaimsError";
  constructor(readonly error: unknown) {}
}

const liquidityReceiptSchema = s.struct({
  liquidity_claims: s.map({
    key: s.number(),
    value: s.decimal(),
  }),
});

export class GetShapeLiquidityClaimsService extends Context.Tag(
  "GetShapeLiquidityClaimsService"
)<
  GetShapeLiquidityClaimsService,
  (input: {
    componentAddress: string;
    liquidityReceiptResourceAddress: string;
    nonFungibleLocalIds: string[];
    at_ledger_state: AtLedgerState;
  }) => Effect.Effect<
    {
      nonFungibleId: string;
      resourceAddress: string;
      liquidityClaims: Map<number, string>;
    }[],
    | FailedToParseLiquidityClaimsError
    | GatewayError
    | InvalidComponentStateError,
    EntityNonFungibleDataService | GatewayApiClientService
  >
>() {}

export const GetShapeLiquidityClaimsLive = Layer.effect(
  GetShapeLiquidityClaimsService,
  Effect.gen(function* () {
    const entityNonFungibleDataService = yield* EntityNonFungibleDataService;

    return (input) => {
      return Effect.gen(function* () {
        const nonFungibleDataResult = yield* entityNonFungibleDataService({
          resource_address: input.liquidityReceiptResourceAddress,
          non_fungible_ids: input.nonFungibleLocalIds,
          at_ledger_state: input.at_ledger_state,
        });

        return yield* Effect.forEach(
          nonFungibleDataResult.non_fungible_ids,
          (result) => {
            return Effect.gen(function* () {
              const { data, non_fungible_id } = result;

              const parsedLiquidityReceipt = liquidityReceiptSchema.safeParse(
                data?.programmatic_json as ProgrammaticScryptoSborValue
              );

              if (parsedLiquidityReceipt.isErr()) {
                return yield* Effect.fail(
                  new FailedToParseLiquidityClaimsError(
                    parsedLiquidityReceipt.error
                  )
                );
              }

              const liquidityClaims =
                parsedLiquidityReceipt.value.liquidity_claims;

              return {
                nonFungibleId: non_fungible_id,
                resourceAddress: nonFungibleDataResult.resource_address,
                liquidityClaims,
              };
            });
          }
        );
      });
    };
  })
);
