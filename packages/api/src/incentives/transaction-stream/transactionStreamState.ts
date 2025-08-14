import { Context, Effect, Ref } from 'effect';
import { z } from 'zod';

export const TransactionStreamStateKeys = {
  Running: 'RUNNING',
  Paused: 'PAUSED',
} as const;

export type TransactionStreamStateKeys =
  (typeof TransactionStreamStateKeys)[keyof typeof TransactionStreamStateKeys];

export class TransactionStreamLoopState extends Context.Tag(
  'TransactionStreamLoopState',
)<TransactionStreamLoopState, Ref.Ref<TransactionStreamStateKeys>>() {}

export const transactionStreamLoopState =
  Ref.make<TransactionStreamStateKeys>('RUNNING');

export const setTransactionStreamState = Effect.fn(function* (
  value: TransactionStreamStateKeys,
) {
  const state = yield* TransactionStreamLoopState;
  yield* Ref.update(state, () => value);
  yield* Effect.log(`Transaction stream state: ${value}`);
});

const transactionStreamStateSchema = z.enum(['RUNNING', 'PAUSED']);

export const setTransactionStreamStateProgram = (
  value: TransactionStreamStateKeys,
) =>
  Effect.runPromise(
    Effect.gen(function* () {
      const parsedState = transactionStreamStateSchema.safeParse(value);
      if (!parsedState.success) {
        return yield* Effect.fail(parsedState.error.message);
      }
      yield* setTransactionStreamState(parsedState.data);
    }).pipe(
      Effect.provideServiceEffect(
        TransactionStreamLoopState,
        transactionStreamLoopState,
      ),
    ),
  );
