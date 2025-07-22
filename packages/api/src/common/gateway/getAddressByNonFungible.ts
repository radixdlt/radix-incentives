import { Data, Effect } from "effect";
import type { AtLedgerState } from "./schemas";
import { GetNonFungibleLocationService } from "./getNonFungibleLocation";

export class EntityNotFoundError extends Data.TaggedError(
  "EntityNotFoundError"
)<{
  message: string;
}> {}

export type GetAddressByNonFungibleServiceInput = {
  resourceAddress: string;
  nonFungibleId: string;
  at_ledger_state: AtLedgerState;
};

export class GetAddressByNonFungibleService extends Effect.Service<GetAddressByNonFungibleService>()(
  "GetAddressByNonFungibleService",
  {
    effect: Effect.gen(function* () {
      const getNonFungibleLocationService =
        yield* GetNonFungibleLocationService;
      return Effect.fn(function* (input: GetAddressByNonFungibleServiceInput) {
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
              new EntityNotFoundError({
                message: `Non-fungible location not found for resource address ${input.resourceAddress} and non-fungible id ${input.nonFungibleId}`,
              })
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
    }),
  }
) {}
