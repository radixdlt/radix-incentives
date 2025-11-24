import type { ProgrammaticScryptoSborValue } from '@radixdlt/babylon-gateway-api-sdk';
import { Array as A, Data, Effect, Option, pipe } from 'effect';
import type {
  ParsedType,
  SborError,
  StructDefinition,
  StructSchema,
} from 'sbor-ez-mode';
import { AddressSchema } from 'sbor-ez-mode/src/schemas/address';
import { EntityNonFungibleDataService } from '../../../../common/gateway';
import type { NonFungibleId, NonFungibleResourceAddress } from '../schemas';

export class FailedToParseSborError extends Data.TaggedError(
  'FailedToParseSborError',
)<{ error: SborError }> {}

export const parseSbor = <T extends StructDefinition, R extends boolean>(
  schema: StructSchema<T, R>,
  sbor: ProgrammaticScryptoSborValue,
) =>
  Effect.gen(function* () {
    const result = schema.safeParse(sbor);

    if (result.isErr()) {
      return yield* new FailedToParseSborError({ error: result.error });
    }

    return result.value;
  });

export const parseNftCollection = <
  T extends StructDefinition,
  R extends boolean,
>(
  schema: StructSchema<T, R>,
  nftCollection: Option.Option<
    readonly {
      readonly id: NonFungibleId;
      readonly sbor?: ProgrammaticScryptoSborValue | undefined;
    }[]
  >,
): Effect.Effect<
  readonly {
    [K in keyof T]: R extends true ? ParsedType<T[K]> | null : ParsedType<T[K]>;
  }[],
  FailedToParseSborError,
  never
> =>
  Option.match(nftCollection, {
    onNone: () => Effect.succeed([]),
    onSome: (nftCollection) =>
      Effect.forEach(nftCollection, (item) =>
        Effect.gen(function* () {
          if (!item.sbor) return;
          const parsed = yield* parseSbor(schema, item.sbor);
          return parsed;
        }),
      ).pipe(Effect.map((items) => items.filter((item) => !!item))),
  });

type NftData = {
  id: NonFungibleId;
  sbor: ProgrammaticScryptoSborValue;
};

export class NftHelper extends Effect.Service<NftHelper>()('NftHelper', {
  dependencies: [EntityNonFungibleDataService.Default],
  effect: Effect.gen(function* () {
    const entityNonFungibleDataService = yield* EntityNonFungibleDataService;

    const getNftData = <T extends StructDefinition, R extends boolean>(input: {
      resourceAddress: NonFungibleResourceAddress;
      nonFungibleIds: NonFungibleId[];
      stateVersion: number;
      schema: StructSchema<T, R>;
    }) =>
      entityNonFungibleDataService({
        resource_address: input.resourceAddress,
        non_fungible_ids: input.nonFungibleIds,
        at_ledger_state: {
          state_version: input.stateVersion,
        },
      }).pipe(
        Effect.map((data) =>
          pipe(
            A.map(data, (item) => ({
              sbor: item.data?.programmatic_json,
              id: item.non_fungible_id,
            })),
            A.filter((item): item is NftData => item.sbor !== undefined),
          ),
        ),
        Effect.flatMap(
          Effect.forEach((item) => parseSbor(input.schema, item.sbor)),
        ),
      );

    return {
      getNftData,
    };
  }),
}) {}

export const parseAddress = Effect.fn(function* (
  sbor: ProgrammaticScryptoSborValue,
) {
  const result = new AddressSchema().safeParse(sbor);

  if (result.isErr()) {
    return yield* Effect.fail(
      new FailedToParseSborError({ error: result.error }),
    );
  }

  return result.value;
});
