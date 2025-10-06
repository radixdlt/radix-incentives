import { Effect, Layer } from 'effect';
import { describe, it } from 'vitest';
import { EntityFungiblesPageService } from '../../gateway/entityFungiblesPage';
import { GatewayApiClientLive } from '../../gateway/gatewayApiClient';
import { GetEntityDetailsService } from '../../gateway/getEntityDetails';
import { GetFungibleBalanceService } from '../../gateway/getFungibleBalance';
import { GetLedgerStateService } from '../../gateway/getLedgerState';
import { GetFluxReservoirService } from './getFluxReservoir';

const fullLayer = GetFluxReservoirService.Default.pipe(
  Layer.provide(
    GetFungibleBalanceService.Default.pipe(
      Layer.provide(
        GetEntityDetailsService.Default.pipe(
          Layer.provide(GatewayApiClientLive),
        ),
      ),
      Layer.provide(GatewayApiClientLive),
      Layer.provide(
        EntityFungiblesPageService.Default.pipe(
          Layer.provide(GatewayApiClientLive),
        ),
      ),
      Layer.provide(
        GetLedgerStateService.Default.pipe(Layer.provide(GatewayApiClientLive)),
      ),
    ),
  ),
  Layer.provide(GatewayApiClientLive),
  Layer.provide(
    GetEntityDetailsService.Default.pipe(Layer.provide(GatewayApiClientLive)),
  ),
  Layer.provide(
    GetLedgerStateService.Default.pipe(Layer.provide(GatewayApiClientLive)),
  ),
);

describe('GetFluxReservoirService', () => {
  it('should get flux reservoir positions', async () => {
    const program = Effect.gen(function* () {
      const getFluxReservoir = yield* GetFluxReservoirService;

      return yield* getFluxReservoir.run({
        accountAddresses: [
          'account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew',
          'account_rdx16y4gqnchvxeszcpswg2zldgsle6uqvnl0znerne70tw9535njhkgzk',
          'account_rdx168nr5dwmll4k2x5apegw5dhrpejf3xac7khjhgjqyg4qddj9tg9v4d',
        ],
        at_ledger_state: {
          state_version: 302444078,
        },
      });
    }).pipe(Effect.provide(fullLayer));

    const result = await Effect.runPromise(program);
    console.log(JSON.stringify(result, null, 2));
  });
});
