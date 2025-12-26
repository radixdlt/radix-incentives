import {
  Convert,
  type NotarizedTransaction,
  RadixEngineToolkit,
  TransactionBuilder as RetTransactionBuilder,
} from '@radixdlt/radix-engine-toolkit';
import { Data, Effect, pipe, Schema } from 'effect';
import { HexString } from 'shared/brandedTypes';
import { NotaryKeyPair } from './notaryKeyPair';
import {
  Ed25519SignatureWithPublicKeySchema,
  TransactionIntentSchema,
} from './schemas';

export class FailedToCompileTransactionError extends Data.TaggedError(
  'FailedToCompileTransactionError',
)<{
  error: unknown;
}> {}

export class FailedToNotarizeTransactionError extends Data.TaggedError(
  'FailedToNotarizeTransactionError',
)<{
  error: unknown;
}> {}

const CompileTransactionInputSchema = Schema.Struct({
  intent: TransactionIntentSchema,
  signatures: Schema.Array(Ed25519SignatureWithPublicKeySchema),
});

type CompileTransactionInput = typeof CompileTransactionInputSchema.Type;

export class CompileTransaction extends Effect.Service<CompileTransaction>()(
  'CompileTransaction',
  {
    dependencies: [NotaryKeyPair.Default],
    effect: Effect.gen(function* () {
      const notaryKeyPair = yield* NotaryKeyPair;

      const TransactionBuilder = Effect.tryPromise(() =>
        RetTransactionBuilder.new(),
      ).pipe(Effect.catchAll(Effect.orDie));

      const notarySignToSignature = (hash: Uint8Array<ArrayBufferLike>) =>
        pipe(
          Convert.Uint8Array.toHexString(hash),
          HexString.make,
          notaryKeyPair.signToSignature,
        ).pipe(Effect.runPromise);

      const notarizeTransaction = (input: CompileTransactionInput) =>
        Effect.gen(function* () {
          const builder = yield* TransactionBuilder;

          return yield* Effect.tryPromise({
            try: () =>
              pipe(
                builder,
                (builder) => builder.header(input.intent.header),
                (builder) => builder.message(input.intent.message),
                (builder) => builder.manifest(input.intent.manifest),
                (builder) =>
                  input.signatures.reduce(
                    (builder, signature) => builder.sign(signature),
                    builder,
                  ),
                (builder) => builder.notarizeAsync(notarySignToSignature),
              ),
            catch: (error) => new FailedToNotarizeTransactionError({ error }),
          });
        });

      const compileNotarizedTransaction = (input: NotarizedTransaction) =>
        Effect.tryPromise({
          try: () => RadixEngineToolkit.NotarizedTransaction.compile(input),
          catch: (error) => new FailedToCompileTransactionError({ error }),
        });

      return (input: CompileTransactionInput) =>
        notarizeTransaction(input).pipe(
          Effect.flatMap(compileNotarizedTransaction),
        );
    }),
  },
) {}
