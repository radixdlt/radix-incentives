import { inject } from '@effect/vitest';
import { schema } from 'db/incentives';
import { drizzle } from 'drizzle-orm/postgres-js';
import { Effect, Layer } from 'effect';
import postgres from 'postgres';
import { createDbClientLive } from '../db/dbClient';
import {
  GetTransactionFeesPaginatedLive,
  GetTransactionFeesService,
} from './getTransactionFees';

describe('GetTransactionFeesService', () => {
  it('should get transaction fees', async () => {
    const dbUrl = inject('testDbUrl');
    const db = drizzle(postgres(dbUrl), { schema });
    const dbLive = createDbClientLive(db);

    const getTransactionFeesLive = GetTransactionFeesPaginatedLive.pipe(
      Layer.provide(dbLive),
    );

    const program = Effect.gen(function* () {
      const getTransactionFees = yield* GetTransactionFeesService;

      const result = yield* getTransactionFees({
        startTimestamp: new Date('2025-06-01T00:00:00.000Z'),
        endTimestamp: new Date('2025-06-19T00:00:00.000Z'),
      });

      return result;
    });

    const result = await Effect.runPromise(
      Effect.provide(program, Layer.mergeAll(dbLive, getTransactionFeesLive)),
    );

    // Just verify the result is defined and is an array
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});
