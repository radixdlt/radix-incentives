import { inject, it } from '@effect/vitest';
import { schema } from 'db/incentives';
import { drizzle } from 'drizzle-orm/postgres-js';
import { Effect, Layer, Ref } from 'effect';
import postgres from 'postgres';
import { describe, expect } from 'vitest';
import {
  GatewayApiClientLive,
  GetLedgerStateService,
} from '../../common/gateway';
import { createAppConfigLive } from '../config';
import { ConfigService } from '../config/configService';
import { createDbClientLive } from '../db/dbClient';
import {
  setTransactionStreamState,
  sharedTransactionStreamState,
  TransactionStreamLoopState,
  transactionStreamLoopState,
} from './transactionStreamState';

const dbUrl = inject('testDbUrl');
const client = postgres(dbUrl, { max: 1 });
const db = drizzle(client, { schema });

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

  const configLive = createAppConfigLive();

  const apiGatewayClientLive = GatewayApiClientLive.pipe(
    Layer.provide(configLive),
  );

  const getLedgerStateLive = GetLedgerStateService.Default.pipe(
    Layer.provide(apiGatewayClientLive),
    Layer.provide(configLive),
  );

  const configServiceLive = ConfigService.Default.pipe(
    Layer.provide(createDbClientLive(db)),
    Layer.provide(getLedgerStateLive),
  );

  it.effect('should share state between programs', () =>
    Effect.gen(function* () {
      // The current implementation uses the production database
      // This test verifies that the shared state mechanism works correctly
      // Even with production database, we're only testing the in-memory state sharing

      // Set state to PAUSED using setTransactionStreamStateProgram
      yield* setTransactionStreamState('PAUSED');

      const transactionStreamLoopState = yield* TransactionStreamLoopState;

      // Read state directly from shared instance
      const currentState = yield* Ref.get(transactionStreamLoopState);

      expect(currentState).toEqual('PAUSED');

      // Reset state to RUNNING
      yield* setTransactionStreamState('RUNNING');

      const newState = yield* Ref.get(transactionStreamLoopState);

      expect(newState).toEqual('RUNNING');
    }).pipe(
      Effect.provide(configServiceLive),
      Effect.provideService(
        TransactionStreamLoopState,
        sharedTransactionStreamState,
      ),
    ),
  );
});
