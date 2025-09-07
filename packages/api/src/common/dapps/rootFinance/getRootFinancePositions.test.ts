import { it } from '@effect/vitest';
import { Effect, Layer } from 'effect';
import { EntityFungiblesPageService } from '../../gateway/entityFungiblesPage';
import { EntityNonFungibleDataService } from '../../gateway/entityNonFungiblesData';
import { EntityNonFungiblesPageService } from '../../gateway/entityNonFungiblesPage';
import { GatewayApiClientLive } from '../../gateway/gatewayApiClient';
import { GetEntityDetailsService } from '../../gateway/getEntityDetails';
import { GetKeyValueStoreService } from '../../gateway/getKeyValueStore';
import { GetLedgerStateService } from '../../gateway/getLedgerState';
import { GetNftResourceManagersService } from '../../gateway/getNftResourceManagers';
import { GetNonFungibleBalanceService } from '../../gateway/getNonFungibleBalance';
import { GetNonFungibleIdsService } from '../../gateway/getNonFungibleIds';
import { KeyValueStoreDataService } from '../../gateway/keyValueStoreData';
import { KeyValueStoreKeysService } from '../../gateway/keyValueStoreKeys';
import { poolStatesKvs } from './fixtures/poolStatesKvs';
import { GetRootFinancePositionsService } from './getRootFinancePositions';

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

const entityNonFungiblesPageServiceLive =
  EntityNonFungiblesPageService.Default.pipe(
    Layer.provide(gatewayApiClientLive),
  );

const entityNonFungibleDataServiceLive =
  EntityNonFungibleDataService.Default.pipe(
    Layer.provide(gatewayApiClientLive),
  );

const keyValueStoreDataServiceLive = KeyValueStoreDataService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
);

const keyValueStoreKeysServiceLive = KeyValueStoreKeysService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
);

const _getKeyValueStoreServiceLive = GetKeyValueStoreService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(keyValueStoreDataServiceLive),
  Layer.provide(keyValueStoreKeysServiceLive),
);

const getNonFungibleIdsLive = GetNonFungibleIdsService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(entityNonFungibleDataServiceLive),
);

const getNftResourceManagersLive = GetNftResourceManagersService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(entityNonFungibleDataServiceLive),
  Layer.provide(getNonFungibleIdsLive),
);

const getNonFungibleBalanceLive = GetNonFungibleBalanceService.Default.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(entityNonFungibleDataServiceLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(getNftResourceManagersLive),
);

describe('GetRootFinancePositionService', () => {
  it.effect(
    'should get root finance position',
    Effect.fn(function* () {
      const getRootFinancePositionLive =
        GetRootFinancePositionsService.Default.pipe(
          Layer.provide(getNonFungibleBalanceLive),
        );

      const service = Effect.provide(
        GetRootFinancePositionsService,
        getRootFinancePositionLive,
      ).pipe(
        Effect.provideService(
          GetKeyValueStoreService,
          new GetKeyValueStoreService(() => Effect.succeed(poolStatesKvs)),
        ),
      );

      const getRootFinancePositions = yield* service;

      const result = yield* getRootFinancePositions.run({
        accountAddresses: [
          'account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew',
        ],
        at_ledger_state: {
          state_version: 372140439,
        },
      });

      const expectedOutput = {
        items: [
          {
            accountAddress:
              'account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew',
            collaterizedDebtPositions: [
              {
                nft: {
                  resourceAddress:
                    'resource_rdx1ngekvyag42r0xkhy2ds08fcl7f2ncgc0g74yg6wpeeyc4vtj03sa9f',
                  localId: '#448#',
                },
                collaterals: {
                  resource_rdx1t5kmyj54jt85malva7fxdrnpvgfgs623yt7ywdaval25vrdlmnwe97:
                    '3431.65301219063',
                  resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf:
                    '0.16857042737660426977806261354099274698',
                  resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd:
                    '100.293569619190605983163624804775638144',
                  resource_rdx1t580qxc7upat7lww4l2c4jckacafjeudxj5wpjrrct0p3e82sq4y75:
                    '0.00000744592725423359457797882475951234',
                  resource_rdx1th88qcj5syl9ghka2g9l7tw497vy5x6zaatyvgfkwcfe8n9jt2npww:
                    '0.0003495224438278389261646231287041382',
                  resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf:
                    '500.0063234027345259525524291428065885',
                  resource_rdx1thrvr3xfs2tarm2dl9emvs26vjqxu6mqvfgvqjne940jv0lnrrg7rw:
                    '0.4958824108530005249429693426180575614',
                  resource_rdx1thxj9m87sn5cc9ehgp9qxp6vzeqxtce90xm5cp33373tclyp4et4gv:
                    '0.50000164854400898152357410593342843524',
                  resource_rdx1t58kkcqdz0mavfz98m98qh9m4jexyl9tacsvlhns6yxs4r6hrm5re5:
                    '0.00001',
                },
                loans: {
                  resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf:
                    '0.1087217669563301446170674789460402248667456399175245076',
                },
              },
            ],
          },
        ],
      };

      expect(result).toEqual(expectedOutput);
    }),
  );
});
