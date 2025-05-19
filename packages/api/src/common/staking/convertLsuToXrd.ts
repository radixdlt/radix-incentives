import { Context, Effect, Layer } from "effect";
import type BigNumber from "bignumber.js";
import {
  type GetEntityDetailsError,
  GetEntityDetailsService,
} from "../gateway/getEntityDetails";
import type { GetLedgerStateService } from "../gateway/getLedgerState";
import type { AtLedgerState } from "../gateway/schemas";

export class InvalidResourceError {
  readonly _tag = "InvalidResourceError";
  constructor(readonly error: unknown) {}
}

export class InvalidNativeResourceKindError {
  readonly _tag = "InvalidNativeResourceKindError";
  constructor(readonly error: unknown) {}
}

export class InvalidAmountError {
  readonly _tag = "InvalidAmountError";
  constructor(readonly error: unknown) {}
}

export class EntityDetailsNotFoundError {
  readonly _tag = "EntityDetailsNotFoundError";
}

export class ConvertLsuToXrdService extends Context.Tag(
  "ConvertLsuToXrdService"
)<
  ConvertLsuToXrdService,
  (input: {
    addresses: string[];
    at_ledger_state: AtLedgerState;
  }) => Effect.Effect<
    {
      validatorAddress: string;
      lsuResourceAddress: string;
      converter: (amount: BigNumber) => BigNumber;
    }[],
    | InvalidResourceError
    | InvalidNativeResourceKindError
    | InvalidAmountError
    | GetEntityDetailsError
    | EntityDetailsNotFoundError,
    GetEntityDetailsService | GetLedgerStateService
  >
>() {}

export const ConvertLsuToXrdLive = Layer.effect(
  ConvertLsuToXrdService,
  Effect.gen(function* () {
    const getEntityDetails = yield* GetEntityDetailsService;

    return (input) => {
      return Effect.gen(function* () {
        const entityDetailsResponse = yield* getEntityDetails(
          input.addresses,
          {
            nativeResourceDetails: true,
          },
          input.at_ledger_state
        );

        return yield* Effect.all(
          entityDetailsResponse.map((entityDetails) => {
            return Effect.gen(function* () {
              if (!entityDetails) {
                return yield* Effect.fail(new EntityDetailsNotFoundError());
              }

              if (entityDetails.details?.type !== "FungibleResource") {
                return yield* Effect.fail(
                  new InvalidResourceError(
                    `Expected a fungible resource, got ${entityDetails.details?.type}`
                  )
                );
              }
              if (
                entityDetails.details.native_resource_details?.kind !==
                "ValidatorLiquidStakeUnit"
              ) {
                return yield* Effect.fail(
                  new InvalidNativeResourceKindError(
                    `Expected a validator liquid stake unit, got ${entityDetails.details.native_resource_details?.kind}`
                  )
                );
              }

              const [value] =
                entityDetails.details.native_resource_details
                  .unit_redemption_value;

              const unit_redemption_value = value?.amount;

              if (!unit_redemption_value) {
                return yield* Effect.fail(new InvalidAmountError("No amount"));
              }

              return {
                validatorAddress:
                  entityDetails.details.native_resource_details
                    .validator_address,
                lsuResourceAddress: entityDetails.address,
                converter: (amount: BigNumber) =>
                  amount.multipliedBy(unit_redemption_value),
              };
            });
          })
        );
      });
    };
  })
);
