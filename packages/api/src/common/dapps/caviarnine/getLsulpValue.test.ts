import { it } from '@effect/vitest';
import { Effect, Layer } from 'effect';

import { EntityFungiblesPageService } from '../../gateway/entityFungiblesPage';
import { GatewayApiClientLive } from '../../gateway/gatewayApiClient';
import { GetEntityDetailsService } from '../../gateway/getEntityDetails';
import { GetFungibleBalanceService } from '../../gateway/getFungibleBalance';
import { GetLedgerStateService } from '../../gateway/getLedgerState';
import { GetLsulpValueLive, GetLsulpValueService } from './getLsulpValue';

const gatewayApiClientLive = GatewayApiClientLive;

const getEntityDetailsServiceLive = GetEntityDetailsService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
);

const getLedgerStateLive = GetLedgerStateService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
);

const entityFungiblesPageServiceLive = EntityFungiblesPageService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
);

const getFungibleBalanceLive = GetFungibleBalanceService.Default.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive),
);

const getLsulpValueLive = GetLsulpValueLive.pipe(
  Layer.provide(getFungibleBalanceLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(getLedgerStateLive),
);

describe('GetLsulpValueService', () => {
  it.effect('should get lsulp value', () => {
    return Effect.gen(function* () {
      const getLsulpValueService = yield* Effect.provide(
        GetLsulpValueService,
        getLsulpValueLive,
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
