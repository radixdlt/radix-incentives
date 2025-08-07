import { Effect, Layer } from 'effect';
import { EntityFungiblesPageService } from '../../gateway/entityFungiblesPage';
import { EntityNonFungibleDataService } from '../../gateway/entityNonFungiblesData';
import { EntityNonFungiblesPageService } from '../../gateway/entityNonFungiblesPage';
import { GatewayApiClientLive } from '../../gateway/gatewayApiClient';
import { GetComponentStateService } from '../../gateway/getComponentState';
import { GetEntityDetailsService } from '../../gateway/getEntityDetails';
import { GetFungibleBalanceService } from '../../gateway/getFungibleBalance';
import { GetKeyValueStoreService } from '../../gateway/getKeyValueStore';
import { GetLedgerStateService } from '../../gateway/getLedgerState';
import { GetNftResourceManagersService } from '../../gateway/getNftResourceManagers';
import { GetNonFungibleBalanceService } from '../../gateway/getNonFungibleBalance';
import { GetNonFungibleIdsService } from '../../gateway/getNonFungibleIds';
import { KeyValueStoreDataService } from '../../gateway/keyValueStoreData';
import { KeyValueStoreKeysService } from '../../gateway/keyValueStoreKeys';
import { UnstakingReceiptProcessorService } from '../../staking/unstakingReceiptProcessor';
import { GetWeftFinancePositionsService } from './getWeftFinancePositions';

// Provide all dependencies in correct order, EntityNonFungiblesPageService only once
const fullLayer = GetWeftFinancePositionsService.Default.pipe(
  Layer.provide(
    GetNonFungibleBalanceService.Default.pipe(
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
    EntityFungiblesPageService.Default.pipe(
      Layer.provide(GatewayApiClientLive),
    ),
  ),
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
  Layer.provide(
    GetEntityDetailsService.Default.pipe(Layer.provide(GatewayApiClientLive)),
  ),
  Layer.provide(
    GetComponentStateService.Default.pipe(
      Layer.provide(
        GetEntityDetailsService.Default.pipe(
          Layer.provide(GatewayApiClientLive),
        ),
      ),
      Layer.provide(GatewayApiClientLive),
    ),
  ),
  Layer.provide(
    GetKeyValueStoreService.Default.pipe(
      Layer.provide(GatewayApiClientLive),
      Layer.provide(
        KeyValueStoreDataService.Default.pipe(
          Layer.provide(GatewayApiClientLive),
        ),
      ),
      Layer.provide(
        KeyValueStoreKeysService.Default.pipe(
          Layer.provide(GatewayApiClientLive),
        ),
      ),
    ),
  ),
  Layer.provide(GetNftResourceManagersService.Default),
  Layer.provide(GetNonFungibleIdsService.Default),
  Layer.provide(
    EntityNonFungibleDataService.Default.pipe(
      Layer.provide(GatewayApiClientLive),
    ),
  ),
  Layer.provide(
    KeyValueStoreDataService.Default.pipe(Layer.provide(GatewayApiClientLive)),
  ),
  Layer.provide(
    KeyValueStoreKeysService.Default.pipe(Layer.provide(GatewayApiClientLive)),
  ),
  Layer.provide(GatewayApiClientLive),
  Layer.provide(
    GetLedgerStateService.Default.pipe(Layer.provide(GatewayApiClientLive)),
  ),
  Layer.provide(
    EntityNonFungiblesPageService.Default.pipe(
      Layer.provide(GatewayApiClientLive),
    ),
  ), // Only once
  Layer.provide(
    UnstakingReceiptProcessorService.Default.pipe(
      Layer.provide(
        EntityNonFungibleDataService.Default.pipe(
          Layer.provide(GatewayApiClientLive),
        ),
      ),
    ),
  ),
);

const program = Effect.provide(
  Effect.gen(function* () {
    const getWeftFinancePositions = yield* GetWeftFinancePositionsService;
    return yield* getWeftFinancePositions.run({
      accountAddresses: [
        'account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew',
      ],
      at_ledger_state: {
        state_version: 322574776,
      },
      validatorClaimNftMap: new Map([
        // Add some example validator claim NFT mappings for testing
        [
          'validator_rdx1sd5368vqdmjk0y2w7ymdts02cz9c52858gpyny56xdvzuheepdeyy0',
          'resource_rdx1ng4kv5702z0jl6eyuw9xjzfqsd82z946vl7qm04n63s0q9jm2ktus6',
        ],
        [
          'validator_rdx1sdzyt4p0x7q7n7q7z7q7n7q7z7q7n7q7z7q7n7q7z7q7n7q7z7q7n',
          'resource_rdx1another_example_claim_nft_resource_address_here',
        ],
      ]),
    });
  }),
  fullLayer,
);

describe('GetWeftFinancePositionsService', () => {
  it('should get weft finance positions', async () => {
    const result = await Effect.runPromise(program);
    expect(result.length).toBeGreaterThan(0);
  });
});
