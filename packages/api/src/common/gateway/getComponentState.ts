import { Context, Effect, Layer } from "effect";

import type { GatewayApiClientService } from "../gateway/gatewayApiClient";
import type { LoggerService } from "../logger/logger";
import type {
  GetStateVersionError,
  GetStateVersionService,
} from "../gateway/getStateVersion";
import type { GatewayError } from "../gateway/errors";
import type {
  EntityNotFoundError,
  GetEntityDetailsError,
  InvalidInputError,
  StateEntityDetailsInput,
} from "../gateway/getNonFungibleBalance";
import { GetEntityDetailsService } from "../gateway/getEntityDetails";

import type { ProgrammaticScryptoSborValue } from "@radixdlt/babylon-gateway-api-sdk";

import type {
  ParsedType,
  StructDefinition,
  StructSchema,
} from "@calamari-radix/sbor-ez-mode/dist/schemas/struct";

export class InvalidComponentStateError {
  readonly _tag = "InvalidComponentStateError";
  constructor(readonly error: unknown) {}
}

export class GetComponentStateService extends Context.Tag(
  "GetComponentStateService"
)<
  GetComponentStateService,
  <T extends StructDefinition, R extends boolean>(input: {
    addresses: string[];
    stateVersion?: StateEntityDetailsInput["state"];
    schema: StructSchema<T, R>;
  }) => Effect.Effect<
    {
      address: string;
      state: {
        [K in keyof T]: R extends true
          ? ParsedType<T[K]> | null
          : ParsedType<T[K]>;
      };
    }[],
    | GetEntityDetailsError
    | EntityNotFoundError
    | InvalidInputError
    | GatewayError
    | GetStateVersionError
    | InvalidComponentStateError,
    GatewayApiClientService | LoggerService | GetStateVersionService
  >
>() {}

export const GetComponentStateLive = Layer.effect(
  GetComponentStateService,
  Effect.gen(function* () {
    const getEntityDetailsService = yield* GetEntityDetailsService;

    return <T extends StructDefinition, R extends boolean>(input: {
      addresses: string[];
      stateVersion?: StateEntityDetailsInput["state"];
      schema: StructSchema<T, R>;
    }) => {
      return Effect.gen(function* () {
        const entityDetails = yield* getEntityDetailsService(
          input.addresses,
          {},
          input.stateVersion
        );

        const results: {
          address: string;
          state: {
            [K in keyof T]: R extends true
              ? ParsedType<T[K]> | null
              : ParsedType<T[K]>;
          };
        }[] = [];

        for (const item of entityDetails) {
          if (item.details?.type === "Component") {
            const componentDetails = item.details;
            const componentState =
              componentDetails.state as ProgrammaticScryptoSborValue;

            const parsed = input.schema.safeParse(componentState);

            if (parsed.isErr()) {
              console.error(parsed.error);
              return yield* Effect.fail(
                new InvalidComponentStateError(parsed.error)
              );
            }

            if (parsed.isOk()) {
              results.push({
                address: item.address,
                state: parsed.value,
              });
            }
          }
        }

        return results;
      });
    };
  })
);
