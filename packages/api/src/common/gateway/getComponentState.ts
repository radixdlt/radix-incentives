import { Context, Effect, Layer } from "effect";

import type { GatewayApiClientService } from "../gateway/gatewayApiClient";
import type { GetLedgerStateService } from "./getLedgerState";
import type { GatewayError } from "../gateway/errors";
import type { InvalidInputError } from "../gateway/getNonFungibleBalance";
import {
  type GetEntityDetailsError,
  type GetEntityDetailsOptions,
  GetEntityDetailsService,
} from "../gateway/getEntityDetails";

import type {
  ProgrammaticScryptoSborValue,
  StateEntityDetailsVaultResponseItem,
} from "@radixdlt/babylon-gateway-api-sdk";

import type { ParsedType, StructDefinition, StructSchema } from "sbor-ez-mode";
import type { AtLedgerState } from "./schemas";
import type { EntityNotFoundError } from "./errors";

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
    options?: GetEntityDetailsOptions;
  }) => Effect.Effect<
    {
      address: string;
      state: {
        [K in keyof T]: R extends true
          ? ParsedType<T[K]> | null
          : ParsedType<T[K]>;
      };
      details: StateEntityDetailsVaultResponseItem;
    }[],
    | GetEntityDetailsError
    | EntityNotFoundError
    | InvalidInputError
    | GatewayError
    | InvalidComponentStateError,
    GatewayApiClientService | GetLedgerStateService
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
      options?: GetEntityDetailsOptions;
    }) => {
      return Effect.gen(function* () {
        const entityDetails = yield* getEntityDetailsService(
          input.addresses,
          input.options,
          input.at_ledger_state
        );

        const results: {
          address: string;
          state: {
            [K in keyof T]: R extends true
              ? ParsedType<T[K]> | null
              : ParsedType<T[K]>;
          };
          details: StateEntityDetailsVaultResponseItem;
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
                details: item,
              });
            }
          }
        }

        return results;
      });
    };
  })
);
