import { Context, Effect, Layer } from "effect";
import {
  type EntityNotFoundError,
  type GetEntityDetailsError,
  type InvalidInputError,
  GetFungibleBalanceService,
} from "./getFungibleBalance";
import type { GatewayError } from "./errors";
import type {
  GetStateVersionError,
  GetStateVersionService,
} from "./getStateVersion";
import type { GatewayApiClientService } from "./gatewayApiClient";
import type { LoggerService } from "../logger/logger";
import type { EntityFungiblesPageService } from "./entityFungiblesPage";
import { BigNumber } from "bignumber.js";
import type {
  ProgrammaticScryptoSborValue,
  ProgrammaticScryptoSborValueDecimal,
} from "@radixdlt/babylon-gateway-api-sdk";

const LSULP = {
  component:
    "component_rdx1cppy08xgra5tv5melsjtj79c0ngvrlmzl8hhs7vwtzknp9xxs63mfp",
  resourceAddress:
    "resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf",
};

class LsulpNotFoundError {
  readonly _tag = "LsulpNotFoundError";
  constructor(readonly error: unknown) {}
}

class InvalidEntityAddressError {
  readonly _tag = "InvalidEntityAddressError";
  constructor(readonly error: unknown) {}
}

export class GetLsulpValueService extends Context.Tag("GetLsulpValueService")<
  GetLsulpValueService,
  (input: { stateVersion: number }) => Effect.Effect<
    {
      lsulpTotalSupply: BigNumber;
      dexValuationXrd: BigNumber;
      lsulpValue: BigNumber;
      stateVersion: number;
    },
    | LsulpNotFoundError
    | GetEntityDetailsError
    | EntityNotFoundError
    | InvalidInputError
    | GatewayError
    | GetStateVersionError
    | InvalidEntityAddressError,
    | GetStateVersionService
    | GatewayApiClientService
    | LoggerService
    | EntityFungiblesPageService
  >
>() {}

export const GetLsulpValueLive = Layer.effect(
  GetLsulpValueService,
  Effect.gen(function* () {
    const getFungibleBalanceService = yield* GetFungibleBalanceService;

    return (input) => {
      return Effect.gen(function* () {
        const [lsulpComponentResult, lsulpResourceResult] =
          yield* getFungibleBalanceService({
            addresses: [LSULP.component, LSULP.resourceAddress],
            state: {
              state_version: input.stateVersion,
            },
          });

        if (!lsulpResourceResult || !lsulpComponentResult) {
          return yield* Effect.fail(
            new LsulpNotFoundError(
              `resource or component not found at state version: ${input.stateVersion}`
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
          stateVersion: input.stateVersion,
          lsulpTotalSupply,
          dexValuationXrd,
          lsulpValue: lsulpValue.isNaN() ? new BigNumber(0) : lsulpValue,
        };
      });
    };
  })
);
