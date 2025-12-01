import { Context, Data, type Effect } from 'effect';
import type { Ed25519SignatureWithPublicKey, HexString } from './schemas';

export class FailedToSignTransactionError extends Data.TaggedError(
  'FailedToSignTransactionError',
)<{
  error: unknown;
}> {}

export class Signer extends Context.Tag('Signer')<
  Signer,
  (
    hash: HexString,
  ) => Effect.Effect<
    Ed25519SignatureWithPublicKey[],
    FailedToSignTransactionError,
    never
  >
>() {}
