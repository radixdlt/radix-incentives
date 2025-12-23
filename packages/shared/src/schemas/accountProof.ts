import { Schema } from 'effect';
import { AccountAddress, HexString } from '../brandedTypes';

const ProofSchema = Schema.Struct({
  publicKey: HexString,
  signature: HexString,
  curve: Schema.Literal('curve25519', 'secp256k1'),
});

export const AccountProofSchema = Schema.Struct({
  type: Schema.Literal('account'),
  address: AccountAddress,
  proof: ProofSchema,
  challenge: HexString,
});

export type AccountProof = typeof AccountProofSchema.Type;
