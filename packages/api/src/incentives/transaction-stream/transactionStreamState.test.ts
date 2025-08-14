import { it } from '@effect/vitest';
import { Effect, Ref } from 'effect';
import {
  setTransactionStreamStateProgram,
  sharedTransactionStreamState,
  TransactionStreamLoopState,
  transactionStreamLoopState,
} from './transactionStreamState';

describe('transactionStreamState', () => {
  it('should set the transaction stream state', async () => {
    // Create a shared Ref instance
    const sharedState = await Effect.runPromise(transactionStreamLoopState);

    const runnableA = Effect.gen(function* () {
      const state = yield* TransactionStreamLoopState;
      yield* Ref.update(state, () => 'PAUSED' as const);
    }).pipe(Effect.provideService(TransactionStreamLoopState, sharedState));

    const runnableB = Effect.gen(function* () {
      const state = yield* TransactionStreamLoopState;
      return yield* Ref.get(state);
    }).pipe(Effect.provideService(TransactionStreamLoopState, sharedState));

    const programA = Effect.runPromise(runnableA);
    const programB = Effect.runPromise(runnableB);

    const [, resultB] = await Promise.all([programA, programB]);

    expect(resultB).toEqual('PAUSED');
  });

  it('should share state between programs', async () => {
    // Set state to PAUSED using setTransactionStreamStateProgram
    await setTransactionStreamStateProgram('PAUSED');

    // Read state directly from shared instance
    const currentState = await Effect.runPromise(
      Effect.gen(function* () {
        const state = yield* TransactionStreamLoopState;
        return yield* Ref.get(state);
      }).pipe(
        Effect.provideService(
          TransactionStreamLoopState,
          sharedTransactionStreamState,
        ),
      ),
    );

    expect(currentState).toEqual('PAUSED');

    // Reset state to RUNNING
    await setTransactionStreamStateProgram('RUNNING');

    const newState = await Effect.runPromise(
      Effect.gen(function* () {
        const state = yield* TransactionStreamLoopState;
        return yield* Ref.get(state);
      }).pipe(
        Effect.provideService(
          TransactionStreamLoopState,
          sharedTransactionStreamState,
        ),
      ),
    );

    expect(newState).toEqual('RUNNING');
  });
});
