import { BigNumber } from 'bignumber.js';
import { Effect, ParseResult, Schema } from 'effect';

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
