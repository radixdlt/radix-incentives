import { Schema } from 'effect';
import { HexString } from '../brandedTypes';

export const ProofSchema = Schema.Struct({
  publicKey: HexString,
  signature: HexString,
  curve: Schema.Literal('curve25519', 'secp256k1'),
});
