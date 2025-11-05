import type { ProgrammaticScryptoSborValue } from '@radixdlt/babylon-gateway-api-sdk';
import { BigNumber } from 'bignumber.js'; // or your BigNumber library
import { Brand, Effect, ParseResult, Schema } from 'effect';

// Schema that transforms string to BigNumber
export const BigNumberSchema = Schema.asSchema(
  Schema.transformOrFail(
    Schema.Union(Schema.String, Schema.Number),
    Schema.instanceOf(BigNumber),
    {
      strict: true,
      decode: (input, _, ast) =>
        Effect.try({
          try: () => new BigNumber(input),
          catch: (_) =>
            new ParseResult.Type(ast, input, 'Failed to parse BigNumber'),
        }),
      encode: (bn) => ParseResult.succeed(bn.toString()),
    },
  ),
);

export type AccountAddress = string & Brand.Brand<'AccountAddress'>;
export const AccountAddress = Brand.nominal<AccountAddress>();

export type FungibleResourceAddress = string &
  Brand.Brand<'FungibleResourceAddress'>;
export const FungibleResourceAddress = Brand.nominal<FungibleResourceAddress>();

export type NonFungibleResourceAddress = string &
  Brand.Brand<'NonFungibleResourceAddress'>;
export const NonFungibleResourceAddress =
  Brand.nominal<NonFungibleResourceAddress>();

export type NonFungibleId = string & Brand.Brand<'NonFungibleId'>;
export const NonFungibleId = Brand.nominal<NonFungibleId>();

export type Amount = string & Brand.Brand<'Amount'>;
export const Amount = Brand.nominal<Amount>();

export type AmountUsd = string & Brand.Brand<'AmountUsd'>;
export const AmountUsd = Brand.nominal<AmountUsd>();

export type PositionKey = string & Brand.Brand<'PositionKey'>;
export const PositionKey = Brand.nominal<PositionKey>();

export type ValidatorAddress = string & Brand.Brand<'ValidatorAddress'>;
export const ValidatorAddress = Brand.nominal<ValidatorAddress>();

export const ProgrammaticScryptoSborValueSchema = Schema.declare(
  (input): input is ProgrammaticScryptoSborValue => typeof input === 'object',
  {
    identifier: 'ProgrammaticScryptoSborValue',
  },
);
