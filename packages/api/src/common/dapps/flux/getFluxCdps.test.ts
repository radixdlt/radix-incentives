import { it } from '@effect/vitest';
import { Effect, Layer } from 'effect';
import { GatewayApiClientLive } from '../../gateway/gatewayApiClient';
import { expectedFluxCdps } from './fixtures/expectedFluxCdps';
import { GetFluxCdpsService } from './getFluxCdps';

const fullLayer = GetFluxCdpsService.Default.pipe(
  Layer.provide(GatewayApiClientLive),
);

describe('GetFluxCdpsService', () => {
  it.effect(
    'should get flux CDP positions',
    Effect.fn(function* () {
      const getFluxCdps = yield* Effect.provide(GetFluxCdpsService, fullLayer);

      const result = yield* getFluxCdps({
        accountAddresses: [
          'account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew',
          'account_rdx16y4gqnchvxeszcpswg2zldgsle6uqvnl0znerne70tw9535njhkgzk',
          'account_rdx168nr5dwmll4k2x5apegw5dhrpejf3xac7khjhgjqyg4qddj9tg9v4d',
        ],
        at_ledger_state: {
          state_version: 302444078,
        },
      });

      expect(result).toEqual(expectedFluxCdps);
    }),
  );
});
