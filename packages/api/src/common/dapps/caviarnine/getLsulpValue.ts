import { Context, Effect, Layer } from "effect";
import {
  type EntityNotFoundError,
  type GetEntityDetailsError,
  type InvalidInputError,
  GetFungibleBalanceService,
} from "../../gateway/getFungibleBalance";
import type { GatewayError } from "../../gateway/errors";
import type {
  GetStateVersionError,
  GetStateVersionService,
} from "../../gateway/getStateVersion";
import type { GatewayApiClientService } from "../../gateway/gatewayApiClient";
import type { LoggerService } from "../../logger/logger";
import type { EntityFungiblesPageService } from "../../gateway/entityFungiblesPage";
import { BigNumber } from "bignumber.js";
import type {
  ProgrammaticScryptoSborValue,
  ProgrammaticScryptoSborValueDecimal,
} from "@radixdlt/babylon-gateway-api-sdk";
import { CaviarNineConstants } from "./constants";

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
            addresses: [
              CaviarNineConstants.LSULP.component,
              CaviarNineConstants.LSULP.resourceAddress,
            ],
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
