import { layer } from '@effect/vitest';
import { Effect, Logger } from 'effect';
import { TVLService } from './tvl';

layer(TVLService.Default)('dexComponentsTvl', (it) => {
  it.effect.skip('should get dex components tvl', () => {
    return Effect.gen(function* () {
      const tvlService = yield* TVLService;
      const result = yield* tvlService.dexComponentsTvl();
      yield* Effect.log(result);
    }).pipe(Effect.provide(Logger.pretty));
  });
});
