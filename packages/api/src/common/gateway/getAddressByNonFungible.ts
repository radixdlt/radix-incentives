import { Context, Effect, Layer } from "effect";
import { EntityNotFoundError, type GatewayError } from "./errors";
import type { AtLedgerState, InvalidStateInputError } from "./schemas";
import { GetNonFungibleLocationService } from "./getNonFungibleLocation";

export type GetAddressByNonFungibleServiceError =
  | GatewayError
  | InvalidStateInputError
  | EntityNotFoundError;

export type GetAddressByNonFungibleServiceInput = {
  resourceAddress: string;
  nonFungibleId: string;
  at_ledger_state: AtLedgerState;
};

export type GetAddressByNonFungibleServiceOutput = {
  address: string;
  resourceAddress: string;
  nonFungibleId: string;
};

export class GetAddressByNonFungibleService extends Context.Tag(
  "GetAddressByNonFungibleService"
)<
  GetAddressByNonFungibleService,
  (
    input: GetAddressByNonFungibleServiceInput
  ) => Effect.Effect<
    GetAddressByNonFungibleServiceOutput,
    GetAddressByNonFungibleServiceError
  >
>() {}

export const GetAddressByNonFungibleLive = Layer.effect(
  GetAddressByNonFungibleService,
  Effect.gen(function* () {
    const getNonFungibleLocationService = yield* GetNonFungibleLocationService;

    return (input) => {
      return Effect.gen(function* () {
        let isBurned = true;
        let nextStateVersion = input.at_ledger_state;
        let address = "";

        while (isBurned) {
          const nonFungibleLocationResult =
            yield* getNonFungibleLocationService({
              resourceAddress: input.resourceAddress,
              nonFungibleIds: [input.nonFungibleId],
              at_ledger_state: nextStateVersion,
            });

          const result = nonFungibleLocationResult.non_fungible_ids[0];

          if (!result) {
            return yield* Effect.fail(
              new EntityNotFoundError(
                `Non-fungible location not found for resource address ${input.resourceAddress} and non-fungible id ${input.nonFungibleId}`
              )
            );
          }

          isBurned = result.is_burned;

          nextStateVersion = {
            state_version:
              nonFungibleLocationResult.ledger_state.state_version - 1,
          };

          if (result.owning_vault_global_ancestor_address)
            address = result.owning_vault_global_ancestor_address;
        }

        return {
          address,
          resourceAddress: input.resourceAddress,
          nonFungibleId: input.nonFungibleId,
        };
      });
    };
  })
);
