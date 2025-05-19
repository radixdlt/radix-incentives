import { Context, Effect, Layer } from "effect";

import type { GatewayApiClientService } from "../gateway/gatewayApiClient";
import type { LoggerService } from "../logger/logger";
import type { GetLedgerStateService } from "./getLedgerState";
import type { GatewayError } from "../gateway/errors";
import type {
  EntityNotFoundError,
  InvalidInputError,
} from "../gateway/getNonFungibleBalance";
import {
  type GetEntityDetailsError,
  GetEntityDetailsService,
} from "../gateway/getEntityDetails";

import type { ProgrammaticScryptoSborValue } from "@radixdlt/babylon-gateway-api-sdk";

import type {
  ParsedType,
  StructDefinition,
  StructSchema,
} from "@calamari-radix/sbor-ez-mode/dist/schemas/struct";
import type { AtLedgerState } from "./schemas";

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
    schema: StructSchema<T, R>;
    at_ledger_state: AtLedgerState;
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
    | InvalidComponentStateError,
    GatewayApiClientService | LoggerService | GetLedgerStateService
  >
>() {}

export const GetComponentStateLive = Layer.effect(
  GetComponentStateService,
  Effect.gen(function* () {
    const getEntityDetailsService = yield* GetEntityDetailsService;

    return <T extends StructDefinition, R extends boolean>(input: {
      addresses: string[];
      at_ledger_state: AtLedgerState;
      schema: StructSchema<T, R>;
    }) => {
      return Effect.gen(function* () {
        const entityDetails = yield* getEntityDetailsService(
          input.addresses,
          {},
          input.at_ledger_state
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
