import { Effect, Schema } from 'effect';
import { AccessControllerAddress, AccountAddress } from '../brandedTypes';

export const UnsecurifiedAccountDecodedSchema = Schema.Struct({
  type: Schema.Literal('unsecurifiedAccount'),
  address: AccountAddress,
});

export const UnsecurifiedAccountSchema = Schema.asSchema(
  Schema.transformOrFail(
    Schema.Struct({
      type: Schema.optionalWith(Schema.Literal('unsecurifiedAccount'), {
        default: () => 'unsecurifiedAccount' as const,
      }),
      address: Schema.String,
    }),
    UnsecurifiedAccountDecodedSchema,
    {
      strict: true,
      decode: (value) =>
        Effect.succeed({
          type: 'unsecurifiedAccount' as const,
          address: AccountAddress.make(value.address),
        }),
      encode: (value) =>
        Effect.succeed({
          type: 'unsecurifiedAccount' as const,
          address: value.address,
        }),
    },
  ),
);

export const SecurifiedAccountDecodedSchema = Schema.Struct({
  type: Schema.Literal('securifiedAccount'),
  address: AccountAddress,
  accessControllerAddress: AccessControllerAddress,
});

export const SecurifiedAccountSchema = Schema.asSchema(
  Schema.transformOrFail(
    Schema.Struct({
      type: Schema.optionalWith(Schema.Literal('securifiedAccount'), {
        default: () => 'securifiedAccount' as const,
      }),
      address: Schema.String,
      accessControllerAddress: Schema.String,
    }),
    SecurifiedAccountDecodedSchema,
    {
      strict: true,
      decode: (value) =>
        Effect.succeed({
          type: 'securifiedAccount' as const,
          address: AccountAddress.make(value.address),
          accessControllerAddress: AccessControllerAddress.make(
            value.accessControllerAddress,
          ),
        }),
      encode: (value) =>
        Effect.succeed({
          type: 'securifiedAccount' as const,
          address: value.address,
          accessControllerAddress: value.accessControllerAddress,
        }),
    },
  ),
);

export const AccountSchema = Schema.Union(
  UnsecurifiedAccountSchema,
  SecurifiedAccountSchema,
);

export type UnsecurifiedAccount = typeof UnsecurifiedAccountSchema.Type;
export type SecurifiedAccount = typeof SecurifiedAccountSchema.Type;
export type Account = typeof AccountSchema.Type;
