import { it } from '@effect/vitest';
import { Effect, Ref } from 'effect';
import {
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
});
