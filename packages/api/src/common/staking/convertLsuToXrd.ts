import { Context, Effect, type Either, Layer } from "effect";
import type BigNumber from "bignumber.js";
import {
  type GetEntityDetailsError,
  GetEntityDetailsService,
  type GetEntityDetailsState,
} from "../gateway/getEntityDetails";
import { LoggerService } from "../logger/logger";
import type {
  GetStateVersionError,
  GetStateVersionService,
} from "../gateway/getStateVersion";

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
    items: {
      lsuResourceAddress: string;
      amount: BigNumber;
    }[];
    stateVersion?: GetEntityDetailsState;
  }) => Effect.Effect<
    Either.Either<
      {
        validatorAddress: string;
        lsuResourceAddress: string;
        lsuAmount: BigNumber;
        xrdAmount: BigNumber;
      },
      | InvalidResourceError
      | InvalidNativeResourceKindError
      | InvalidAmountError
      | GetEntityDetailsError
      | EntityDetailsNotFoundError
      | GetStateVersionError
    >[],
    | InvalidResourceError
    | InvalidNativeResourceKindError
    | InvalidAmountError
    | GetEntityDetailsError
    | EntityDetailsNotFoundError
    | GetStateVersionError,
    GetEntityDetailsService | GetStateVersionService
  >
>() {}

export const ConvertLsuToXrdLive = Layer.effect(
  ConvertLsuToXrdService,
  Effect.gen(function* () {
    const getEntityDetails = yield* GetEntityDetailsService;
    const logger = yield* LoggerService;

    return (input) => {
      return Effect.gen(function* () {
        const entityDetailsResponse = yield* getEntityDetails(
          input.items.map((item) => item.lsuResourceAddress),
          {
            nativeResourceDetails: true,
          },
          input.stateVersion
        );

        const itemMap = new Map(
          input.items.map((item) => [item.lsuResourceAddress, item])
        );

        return yield* Effect.all(
          entityDetailsResponse.map((entityDetails) => {
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            const { amount } = itemMap.get(entityDetails.address)!;

            return Effect.gen(function* () {
              if (!entityDetails) {
                return yield* Effect.fail(new EntityDetailsNotFoundError());
              }

              logger.trace(entityDetails, "getEntityDetails result");

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

              if (!value?.amount) {
                return yield* Effect.fail(new InvalidAmountError("No amount"));
              }

              return {
                validatorAddress:
                  entityDetails.details.native_resource_details
                    .validator_address,
                lsuResourceAddress: entityDetails.address,
                lsuAmount: amount,
                xrdAmount: amount.multipliedBy(value.amount),
              };
            });
          }),
          { mode: "either" }
        );
      });
    };
  })
);
