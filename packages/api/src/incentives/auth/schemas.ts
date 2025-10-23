import { z } from 'zod';

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
