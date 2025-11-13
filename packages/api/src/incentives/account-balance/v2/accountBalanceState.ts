import { Context, Effect, HashMap, Option, Ref, Schema } from 'effect';
import { map, reduce } from 'effect/Array';
import type { StructDefinition, StructSchema } from 'sbor-ez-mode';
import {
  GetAllValidatorsService,
  GetNonFungibleBalanceService,
} from '../../../common/gateway';
import { AccountBalanceHelper } from './helpers/accountBalanceHelper';
import { parseNftCollection } from './helpers/parseSbor';
import {
  AccountAddress,
  Amount,
  FungibleResourceAddress,
  NonFungibleId,
  NonFungibleResourceAddress,
  ProgrammaticScryptoSborValueSchema,
  StateVersion,
  ValidatorAddress,
} from './schemas';

const FungibleTokenBalanceStateSchema = Schema.HashMap({
  key: Schema.String.pipe(Schema.fromBrand(AccountAddress)),
  value: Schema.HashMap({
    key: Schema.String.pipe(Schema.fromBrand(FungibleResourceAddress)),
    value: Schema.String.pipe(Schema.fromBrand(Amount)),
  }),
});

type FungibleTokenBalanceStateSchema =
  typeof FungibleTokenBalanceStateSchema.Type;

const NftCollectionItemSchema = Schema.Struct({
  id: Schema.String.pipe(Schema.fromBrand(NonFungibleId)),
  sbor: Schema.optional(ProgrammaticScryptoSborValueSchema),
});
type NftCollectionItemSchema = typeof NftCollectionItemSchema.Type;

const NftCollectionItemsSchema = Schema.Array(NftCollectionItemSchema);

type NftCollectionItemsSchema = typeof NftCollectionItemsSchema.Type;

const NftCollectionSchema = Schema.HashMap({
  key: Schema.String.pipe(Schema.fromBrand(NonFungibleResourceAddress)),
  value: NftCollectionItemsSchema,
});

export type NftCollection = typeof NftCollectionSchema.Type;

const NonFungibleTokenBalanceStateSchema = Schema.HashMap({
  key: Schema.String.pipe(Schema.fromBrand(AccountAddress)),
  value: NftCollectionSchema,
});

type NonFungibleTokenBalanceStateSchema =
  typeof NonFungibleTokenBalanceStateSchema.Type;

const ValidatorsStateSchema = Schema.Array(
  Schema.Struct({
    address: Schema.String.pipe(Schema.fromBrand(ValidatorAddress)),
    lsuResourceAddress: Schema.String.pipe(
      Schema.fromBrand(FungibleResourceAddress),
    ),
    claimNftResourceAddress: Schema.String.pipe(
      Schema.fromBrand(NonFungibleResourceAddress),
    ),
  }),
);

export class FungibleTokenBalanceState extends Context.Tag(
  'FungibleTokenBalanceState',
)<
  FungibleTokenBalanceState,
  Ref.Ref<typeof FungibleTokenBalanceStateSchema.Type>
>() {}

export class NonFungibleTokenBalanceState extends Context.Tag(
  'NonFungibleTokenBalanceState',
)<
  NonFungibleTokenBalanceState,
  Ref.Ref<typeof NonFungibleTokenBalanceStateSchema.Type>
>() {}

export class ValidatorsState extends Context.Tag('ValidatorsState')<
  ValidatorsState,
  Ref.Ref<typeof ValidatorsStateSchema.Type>
>() {}

export type MakeStateInput = {
  addresses: string[];
  stateVersion: number;
};

export class AccountBalanceState extends Effect.Service<AccountBalanceState>()(
  'AccountBalanceState',
  {
    dependencies: [
      GetAllValidatorsService.Default,
      GetNonFungibleBalanceService.Default,
      AccountBalanceHelper.Default,
    ],
    effect: Effect.gen(function* () {
      const getAllValidatorsService = yield* GetAllValidatorsService;
      const getNonFungibleBalanceService = yield* GetNonFungibleBalanceService;
      const accountBalanceHelper = yield* AccountBalanceHelper;

      return {
        makeFungibleTokenBalanceState: (input: MakeStateInput) =>
          accountBalanceHelper
            .getFungibleTokens({
              addresses: input.addresses.map(AccountAddress),
              stateVersion: StateVersion(input.stateVersion),
            })
            .pipe(
              Effect.flatMap(
                Ref.make<typeof FungibleTokenBalanceStateSchema.Type>,
              ),
              Effect.orDie,
            ),
        makeNonFungibleTokenBalanceState: (
          input: MakeStateInput & {
            resourceAddresses: NonFungibleResourceAddress[];
          },
        ) =>
          getNonFungibleBalanceService({
            addresses: input.addresses,
            at_ledger_state: {
              state_version: input.stateVersion,
            },
          }).pipe(
            Effect.map((result) => result.items),
            Effect.map(
              reduce(
                HashMap.empty<AccountAddress, NftCollection>(),
                (acc, item) => {
                  const accountAddress = AccountAddress(item.address);

                  const collections = reduce(
                    item.nonFungibleResources,
                    HashMap.empty<
                      NonFungibleResourceAddress,
                      NftCollectionItemsSchema
                    >(),
                    (acc, collection) => {
                      const resourceAddress = NonFungibleResourceAddress(
                        collection.resourceAddress,
                      );

                      const nftItems = map(collection.items, (item) => ({
                        id: NonFungibleId(item.id),
                        sbor: item.sbor,
                      }));

                      return HashMap.set(acc, resourceAddress, nftItems);
                    },
                  );

                  return HashMap.set(acc, accountAddress, collections);
                },
              ),
            ),
            Effect.flatMap((items) => {
              return Ref.make<typeof NonFungibleTokenBalanceStateSchema.Type>(
                items,
              );
            }),
          ),
        makeValidatorsState: getAllValidatorsService().pipe(
          Effect.map(
            map((validator) => ({
              address: ValidatorAddress(validator.address),
              lsuResourceAddress: FungibleResourceAddress(
                validator.lsuResourceAddress,
              ),
              claimNftResourceAddress: NonFungibleResourceAddress(
                validator.claimNftResourceAddress,
              ),
            })),
          ),
          Effect.flatMap(Ref.make<typeof ValidatorsStateSchema.Type>),
        ),
      };
    }),
  },
) {
  static fungibleTokenState = FungibleTokenBalanceState.pipe(
    Effect.flatMap(Ref.get),
  );
  static createGetFungibleTokenBalanceFn = Effect.gen(function* () {
    const fungibleTokenState = yield* AccountBalanceState.fungibleTokenState;
    return (
      address: AccountAddress,
      resourceAddress: FungibleResourceAddress,
    ) =>
      HashMap.get(fungibleTokenState, address).pipe(
        Option.map((balance) => HashMap.get(balance, resourceAddress)),
        Option.flatten,
      );
  });

  static validatorsState = ValidatorsState.pipe(Effect.flatMap(Ref.get));

  static nonFungibleTokenState = NonFungibleTokenBalanceState.pipe(
    Effect.flatMap(Ref.get),
  );
  static createGetNftCollectionFn = Effect.gen(function* () {
    const nonFungibleTokenState =
      yield* AccountBalanceState.nonFungibleTokenState;

    function getNftCollection<T extends StructDefinition, R extends boolean>(
      address: AccountAddress,
      resourceAddress: NonFungibleResourceAddress,
      schema: StructSchema<T, R>,
    ): ReturnType<typeof parseNftCollection<T, R>>;

    function getNftCollection(
      address: AccountAddress,
      resourceAddress: NonFungibleResourceAddress,
    ): Option.Option<NftCollectionItemsSchema>;

    function getNftCollection<T extends StructDefinition, R extends boolean>(
      address: AccountAddress,
      resourceAddress: NonFungibleResourceAddress,
      schema?: StructSchema<T, R>,
    ):
      | Option.Option<NftCollectionItemsSchema>
      | ReturnType<typeof parseNftCollection<T, R>> {
      const nftCollection = HashMap.get(nonFungibleTokenState, address).pipe(
        Option.map((balance) => HashMap.get(balance, resourceAddress)),
        Option.flatten,
      );
      if (!schema) return nftCollection;
      return parseNftCollection(schema, nftCollection);
    }

    return getNftCollection;
  });
}
