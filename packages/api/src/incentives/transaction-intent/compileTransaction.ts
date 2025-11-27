import {
  type NotarizedTransaction,
  RadixEngineToolkit,
  TransactionBuilder as RetTransactionBuilder,
} from '@radixdlt/radix-engine-toolkit';
import { Data, Effect, pipe, Schema } from 'effect';
import { NotaryKeyPair } from './notaryKeyPair';
import {
  type Ed25519SignatureWithPublicKey,
  Ed25519SignatureWithPublicKeySchema,
  type TransactionIntentEncoded,
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
        notaryKeyPair.signToSignature(hash).pipe(Effect.runSync);

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
                (builder) => {
                  for (const signature of input.signatures) {
                    builder.sign(signature);
                  }
                  return builder;
                },
                (builder) => builder.notarize(notarySignToSignature),
              ),
            catch: (error) => new FailedToNotarizeTransactionError({ error }),
          });
        });

      const compileNotarizedTransaction = (input: NotarizedTransaction) =>
        Effect.tryPromise({
          try: () => RadixEngineToolkit.NotarizedTransaction.compile(input),
          catch: (error) => new FailedToCompileTransactionError({ error }),
        });

      return (input: {
        intent: TransactionIntentEncoded;
        signatures: Ed25519SignatureWithPublicKey[];
      }) =>
        Effect.gen(function* () {
          const parsedInput = yield* Schema.decodeUnknown(
            CompileTransactionInputSchema,
          )(input);

          return yield* notarizeTransaction(parsedInput).pipe(
            Effect.flatMap(compileNotarizedTransaction),
          );
        });
    }),
  },
) {}
