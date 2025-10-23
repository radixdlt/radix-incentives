import { it } from '@effect/vitest';
import { Effect, Layer } from 'effect';
import { GatewayApiClientLive } from '../../gateway/gatewayApiClient';
import { expectedFluxReservoir } from './fixtures/expectedFluxReservoir';
import { GetFluxReservoirService } from './getFluxReservoir';

const fullLayer = GetFluxReservoirService.Default.pipe(
  Layer.provide(GatewayApiClientLive),
);

describe('GetFluxReservoirService', () => {
  it.effect(
    'should get flux reservoir positions',
    Effect.fn(function* () {
      const getFluxReservoir = yield* Effect.provide(
        GetFluxReservoirService,
        fullLayer,
      );

      const result = yield* getFluxReservoir({
        accountAddresses: [
          'account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew',
          'account_rdx16y4gqnchvxeszcpswg2zldgsle6uqvnl0znerne70tw9535njhkgzk',
          'account_rdx168nr5dwmll4k2x5apegw5dhrpejf3xac7khjhgjqyg4qddj9tg9v4d',
        ],
        at_ledger_state: {
          state_version: 302444078,
        },
      });

      // Serialize BigNumbers to strings for comparison
      const serializedResult = JSON.parse(JSON.stringify(result));
      expect(serializedResult).toEqual(expectedFluxReservoir);
    }),
  );
});
