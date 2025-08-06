import { it } from '@effect/vitest';
import { Effect, Layer } from 'effect';
import { GatewayApiClientLive } from './gatewayApiClient';
import { GetResourceHoldersService } from './getResourceHolders';

describe('getResourceHolders', () => {
  it.effect(
    'should get the resource holders',
    Effect.fn(function* () {
      const getResourceHolders = yield* Effect.provide(
        GetResourceHoldersService,
        GetResourceHoldersService.Default.pipe(
          Layer.provide(GatewayApiClientLive),
        ),
      );

      const result = yield* getResourceHolders({
        resourceAddress:
          'resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf',
      });

      expect(result.length).toBeGreaterThan(0);
    }),
  );
});
