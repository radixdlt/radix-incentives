import { Effect, Layer } from 'effect';
import { dbTestLive } from '../../test-helpers/dbTestLive';
import { GetTransactionFeesService } from './getTransactionFees';

describe('GetTransactionFeesService', () => {
  it('should get transaction fees', async () => {
    const program = Effect.gen(function* () {
      const getTransactionFees = yield* GetTransactionFeesService;

      const result = yield* getTransactionFees({
        startTimestamp: new Date('2025-06-01T00:00:00.000Z'),
        endTimestamp: new Date('2025-06-19T00:00:00.000Z'),
      });

      return result;
    }).pipe(
      Effect.provide(
        GetTransactionFeesService.DefaultWithoutDependencies.pipe(
          Layer.provide(dbTestLive),
        ),
      ),
    );

    const result = await Effect.runPromise(program);

    // Just verify the result is defined and is an array
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});
