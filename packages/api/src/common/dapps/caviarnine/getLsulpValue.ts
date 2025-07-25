import { Effect } from "effect";
import { GetFungibleBalanceService } from "../../gateway/getFungibleBalance";

import { BigNumber } from "bignumber.js";
import type {
  ProgrammaticScryptoSborValue,
  ProgrammaticScryptoSborValueDecimal,
} from "@radixdlt/babylon-gateway-api-sdk";
import { DappConstants } from "data";
import type { AtLedgerState } from "../../gateway/schemas";

const CaviarNineConstants = DappConstants.CaviarNine.constants;

export class LsulpNotFoundError {
  readonly _tag = "LsulpNotFoundError";
  constructor(readonly error: unknown) {}
}

export class InvalidEntityAddressError {
  readonly _tag = "InvalidEntityAddressError";
  constructor(readonly error: unknown) {}
}

export class GetLsulpValueService extends Effect.Service<GetLsulpValueService>()(
  "GetLsulpValueService",
  {
    effect: Effect.gen(function* () {
      const getFungibleBalanceService = yield* GetFungibleBalanceService;
      return Effect.fn(function* (input: { at_ledger_state: AtLedgerState }) {
        const [lsulpComponentResult, lsulpResourceResult] =
          yield* getFungibleBalanceService({
            addresses: [
              CaviarNineConstants.LSULP.component,
              CaviarNineConstants.LSULP.resourceAddress,
            ],
            at_ledger_state: input.at_ledger_state,
          });

        if (!lsulpResourceResult || !lsulpComponentResult) {
          return yield* Effect.fail(
            new LsulpNotFoundError(
              "resource or component not found at state version"
            )
          );
        }

        if (lsulpResourceResult.details?.type !== "FungibleResource") {
          return yield* Effect.fail(
            new InvalidEntityAddressError(
              `expected LSULP to be a fungible resource, got ${lsulpResourceResult.details?.type}`
            )
          );
        }

        if (lsulpComponentResult.details?.type !== "Component") {
          return yield* Effect.fail(
            new InvalidEntityAddressError(
              `expected LSULP component to be a component, got ${lsulpComponentResult.details?.type}`
            )
          );
        }

        const componentState = lsulpComponentResult.details
          .state as ProgrammaticScryptoSborValue;

        if (componentState.kind !== "Tuple") {
          return yield* Effect.fail(
            new InvalidEntityAddressError(
              `expected LSULP component state to be a tuple, got ${componentState.kind}`
            )
          );
        }

        const dexValuationXrdField = componentState.fields.find(
          (field): field is ProgrammaticScryptoSborValueDecimal =>
            field.field_name === "dex_valuation_xrd" && field.kind === "Decimal"
        );

        if (!dexValuationXrdField) {
          return yield* Effect.fail(
            new InvalidEntityAddressError(
              "expected LSULP component state to have a dex_valuation_xrd field"
            )
          );
        }

        const dexValuationXrd = new BigNumber(dexValuationXrdField.value);

        const lsulpTotalSupply = new BigNumber(
          lsulpResourceResult.details.total_supply
        );

        const lsulpValue = dexValuationXrd.dividedBy(lsulpTotalSupply);

        return {
          lsulpTotalSupply,
          dexValuationXrd,
          lsulpValue: lsulpValue.isNaN() ? new BigNumber(0) : lsulpValue,
        };
      });
    }),
  }
) {}

export const GetLsulpValueLive = GetLsulpValueService.Default;
