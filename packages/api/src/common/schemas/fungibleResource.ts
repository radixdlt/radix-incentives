import { BigNumber } from 'bignumber.js';
import { Effect, ParseResult, Schema } from 'effect';
import { RadixDataTypeSchema } from '../../incentives/component-definition/schemas';
import { AssetSchema } from '../assets/schemas';

const FungibleResourcesCollectionItemVaultAggregatedVaultItemSchema =
  Schema.Struct({
    vault_address: Schema.NonEmptyString,
    amount: Schema.NonEmptyString,
    last_updated_at_state_version: Schema.Number,
  });

const FungibleResourcesCollectionItemVaultAggregatedVaultSchema = Schema.Struct(
  {
    total_count: Schema.Number,
    next_cursor: Schema.optional(Schema.NonEmptyString),
    items: Schema.Array(
      FungibleResourcesCollectionItemVaultAggregatedVaultItemSchema,
    ),
  },
);

const FungibleResourcesCollectionItemVaultAggregatedSchema = Schema.Array(
  Schema.Struct({
    aggregation_level: Schema.Literal('Vault'),
    resource_address: RadixDataTypeSchema.ResourceAddress,
    vaults: FungibleResourcesCollectionItemVaultAggregatedVaultSchema,
  }),
);

const FungibleResourcesVaultCollectionSchema = Schema.Struct({
  total_count: Schema.Number,
  next_cursor: Schema.optional(Schema.NonEmptyString),
  items: FungibleResourcesCollectionItemVaultAggregatedSchema,
});

const fromFungibleResourcesCollectionItemVaultAggregatedVaultItemSchema =
  Schema.transformOrFail(
    Schema.Array(FungibleResourcesCollectionItemVaultAggregatedVaultItemSchema),
    Schema.NonEmptyString,
    {
      decode: (value) =>
        Effect.gen(function* () {
          return value
            .reduce((acc, item) => acc.plus(item.amount), new BigNumber(0))
            .toString();
        }),
      encode: (value, _, ast) =>
        ParseResult.fail(
          new ParseResult.Forbidden(ast, value, 'encoding not supported'),
        ),
    },
  );

export const fungibleResourceBalanceSchema = Schema.Struct({
  resourceAddress: AssetSchema,
  amount: Schema.NonEmptyString,
});

export const fromFungibleResourcesVaultCollection = Schema.transformOrFail(
  FungibleResourcesVaultCollectionSchema,
  Schema.Array(fungibleResourceBalanceSchema),
  {
    strict: false,
    decode: (value) => {
      return Effect.forEach(
        value.items,
        Effect.fnUntraced(function* (item) {
          return {
            resourceAddress: yield* AssetSchema.fromResourceAddress(
              item.resource_address,
            ).pipe(
              Effect.catchTags({
                ConfigError: (err) =>
                  ParseResult.fail(
                    new ParseResult.Unexpected(err, 'config error'),
                  ),
                ParseError: (err) => ParseResult.fail(err.issue),
              }),
            ),
            amount: yield* Schema.decode(
              fromFungibleResourcesCollectionItemVaultAggregatedVaultItemSchema,
            )(item.vaults.items).pipe(
              Effect.catchAll((err) => ParseResult.fail(err.issue)),
            ),
          };
        }),
      );
    },
    encode: (value, _, ast) =>
      ParseResult.fail(
        new ParseResult.Forbidden(ast, value, 'encoding not supported'),
      ),
  },
);
