import { Effect, Layer } from 'effect';
import { describe, it } from 'vitest';
import { EntityNonFungibleDataService } from '../../gateway/entityNonFungiblesData';
import { EntityNonFungiblesPageService } from '../../gateway/entityNonFungiblesPage';
import { GatewayApiClientLive } from '../../gateway/gatewayApiClient';
import { GetEntityDetailsService } from '../../gateway/getEntityDetails';
import { GetLedgerStateService } from '../../gateway/getLedgerState';
import { GetNftResourceManagersService } from '../../gateway/getNftResourceManagers';
import { GetNonFungibleBalanceService } from '../../gateway/getNonFungibleBalance';
import { GetNonFungibleIdsService } from '../../gateway/getNonFungibleIds';
import { KeyValueStoreDataService } from '../../gateway/keyValueStoreData';
import { KeyValueStoreKeysService } from '../../gateway/keyValueStoreKeys';
import { GetFluxCdpsService } from './getFluxCdps';

const fullLayer = GetFluxCdpsService.Default.pipe(
  Layer.provide(
    GetNonFungibleBalanceService.Default.pipe(
      Layer.provide(
        GetEntityDetailsService.Default.pipe(
          Layer.provide(GatewayApiClientLive),
        ),
      ),
      Layer.provide(GatewayApiClientLive),
      Layer.provide(
        EntityNonFungiblesPageService.Default.pipe(
          Layer.provide(GatewayApiClientLive),
        ),
      ),
      Layer.provide(
        EntityNonFungibleDataService.Default.pipe(
          Layer.provide(GatewayApiClientLive),
        ),
      ),
      Layer.provide(
        GetLedgerStateService.Default.pipe(Layer.provide(GatewayApiClientLive)),
      ),
    ),
  ),
  Layer.provide(
    EntityNonFungibleDataService.Default.pipe(
      Layer.provide(GatewayApiClientLive),
    ),
  ),
  Layer.provide(
    KeyValueStoreKeysService.Default.pipe(Layer.provide(GatewayApiClientLive)),
  ),
  Layer.provide(
    KeyValueStoreDataService.Default.pipe(Layer.provide(GatewayApiClientLive)),
  ),
  Layer.provide(GetNftResourceManagersService.Default),
  Layer.provide(GetNonFungibleIdsService.Default),
  Layer.provide(GatewayApiClientLive),
  Layer.provide(
    GetLedgerStateService.Default.pipe(Layer.provide(GatewayApiClientLive)),
  ),
  Layer.provide(
    EntityNonFungiblesPageService.Default.pipe(
      Layer.provide(GatewayApiClientLive),
    ),
  ),
);

describe('GetFluxCdpsService', () => {
  it('should get flux CDP positions', async () => {
    const program = Effect.gen(function* () {
      const getFluxCdps = yield* GetFluxCdpsService;
      return yield* getFluxCdps.run({
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
