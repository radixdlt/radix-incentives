import { Schema } from 'effect';
import { z } from 'zod';
import { AccountAddress } from '../account-balance/v2/schemas';
import { HexString } from '../schemas/brandedTypes';

export const RolaProofSchema = z.object({
  challenge: z.string(),
  type: z.enum(['account', 'persona']),
  address: z.string(),
  label: z.string(),
  proof: z.object({
    publicKey: z.string(),
    signature: z.string(),
    curve: z.enum(['curve25519', 'secp256k1']),
  }),
});

export type RolaProof = z.infer<typeof RolaProofSchema>;

export const AccountProofSchema = Schema.Struct({
  type: Schema.Literal('account'),
  address: Schema.String.pipe(Schema.fromBrand(AccountAddress)),
  proof: Schema.Struct({
    publicKey: HexString,
    signature: HexString,
    curve: Schema.Literal('curve25519', 'secp256k1'),
  }),
});

export type AccountProof = typeof AccountProofSchema.Type;
