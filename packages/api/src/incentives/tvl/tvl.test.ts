import { layer } from '@effect/vitest';
import { Effect } from 'effect';
import { TVLService } from './tvl';

layer(TVLService.Default)('tvl', (it) => {
  it.effect('should get shape liquidity components', () => {
    return Effect.gen(function* () {
      const tvl = yield* TVLService;
      const result = yield* tvl.shapeLiquidityComponents();
      yield* Effect.log(result);
    });
  });
});
