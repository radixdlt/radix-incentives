import { Effect } from "effect";

import type { AtLedgerState } from "../../gateway/schemas";
import { EntityNonFungibleDataService } from "../../gateway/entityNonFungiblesData";
import type { ProgrammaticScryptoSborValue } from "@radixdlt/babylon-gateway-api-sdk";
import s from "sbor-ez-mode";

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

export class GetShapeLiquidityClaimsService extends Effect.Service<GetShapeLiquidityClaimsService>()(
  "GetShapeLiquidityClaimsService",
  {
    effect: Effect.gen(function* () {
      const entityNonFungibleDataService = yield* EntityNonFungibleDataService;

      return Effect.fn(function* (input: {
        componentAddress: string;
        liquidityReceiptResourceAddress: string;
        nonFungibleLocalIds: string[];
        at_ledger_state: AtLedgerState;
      }) {
        const nonFungibleDataResult = yield* entityNonFungibleDataService({
          resource_address: input.liquidityReceiptResourceAddress,
          non_fungible_ids: input.nonFungibleLocalIds,
          at_ledger_state: input.at_ledger_state,
        }).pipe(Effect.withSpan("entityNonFungibleDataService"));

        return yield* Effect.forEach(nonFungibleDataResult, (result) => {
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
              resourceAddress: input.liquidityReceiptResourceAddress,
              liquidityClaims,
            };
          });
        });
      });
    }),
  }
) {}

export const GetShapeLiquidityClaimsLive =
  GetShapeLiquidityClaimsService.Default;
