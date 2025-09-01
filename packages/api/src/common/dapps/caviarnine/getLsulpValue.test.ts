import { it } from '@effect/vitest';
import { Effect } from 'effect';

import { GetLsulpValueService } from './getLsulpValue';

describe('GetLsulpValueService', () => {
  it.effect('should get lsulp value', () => {
    return Effect.gen(function* () {
      const getLsulpValueService = yield* Effect.provide(
        GetLsulpValueService,
        GetLsulpValueService.Default,
      );

      const result = yield* getLsulpValueService({
        at_ledger_state: {
          state_version: 286058118,
        },
      });

      expect(result).toBeDefined();
    });
  });
});
