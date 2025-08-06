import { NodeSdk } from '@effect/opentelemetry';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { Effect, Layer } from 'effect';
import { EntityFungiblesPageService } from '../../common/gateway/entityFungiblesPage';
import { EntityNonFungibleDataService } from '../../common/gateway/entityNonFungiblesData';
import { EntityNonFungiblesPageService } from '../../common/gateway/entityNonFungiblesPage';
import { GatewayApiClientLive } from '../../common/gateway/gatewayApiClient';
import { GetAllValidatorsService } from '../../common/gateway/getAllValidators';
import { GetEntityDetailsService } from '../../common/gateway/getEntityDetails';
import { GetFungibleBalanceService } from '../../common/gateway/getFungibleBalance';
import { GetLedgerStateService } from '../../common/gateway/getLedgerState';
import { GetNonFungibleBalanceService } from '../../common/gateway/getNonFungibleBalance';
import { accounts } from '../../fixtures/accounts';
import { GetVotingPowerAtStateVersionService } from './getVotingPowerAtStateVersion';

import { catchAll } from 'effect/Effect';
import { GetLsulpService } from '../../common/dapps/caviarnine/getLsulp';
import { GetLsulpValueService } from '../../common/dapps/caviarnine/getLsulpValue';
import { GetRootFinancePositionsService } from '../../common/dapps/rootFinance/getRootFinancePositions';
import { GetWeftFinancePositionsService } from '../../common/dapps/weftFinance/getWeftFinancePositions';
import {
  GetNftResourceManagersService,
  GetNonFungibleIdsService,
} from '../../common/gateway';
import { GetComponentStateService } from '../../common/gateway/getComponentState';
import { GetKeyValueStoreService } from '../../common/gateway/getKeyValueStore';
import { KeyValueStoreDataService } from '../../common/gateway/keyValueStoreData';
import { KeyValueStoreKeysService } from '../../common/gateway/keyValueStoreKeys';
import { ConvertLsuToXrdService } from '../../common/staking/convertLsuToXrd';
import { GetUserStakingPositionsService } from '../../common/staking/getUserStakingPositions';
import { UnstakingReceiptProcessorService } from '../../common/staking/unstakingReceiptProcessor';

const gatewayApiClientLive = GatewayApiClientLive;

const getEntityDetailsServiceLive = GetEntityDetailsService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
);

const getLedgerStateLive = GetLedgerStateService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
);

const getAllValidatorsServiceLive = GetAllValidatorsService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
);

const entityFungiblesPageServiceLive = EntityFungiblesPageService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
);

const stateEntityDetailsLive = GetFungibleBalanceService.Default.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive),
);

const entityNonFungiblesPageServiceLive =
  EntityNonFungiblesPageService.Default.pipe(
    Layer.provide(gatewayApiClientLive),
  );

const entityNonFungibleDataServiceLive =
  EntityNonFungibleDataService.Default.pipe(
    Layer.provide(gatewayApiClientLive),
  );

const getNonFungibleBalanceLive = GetNonFungibleBalanceService.Default.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(entityNonFungibleDataServiceLive),
  Layer.provide(getLedgerStateLive),
);

const getUserStakingPositionsLive = GetUserStakingPositionsService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(stateEntityDetailsLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(entityNonFungibleDataServiceLive),
  Layer.provide(getNonFungibleBalanceLive),
  Layer.provide(getAllValidatorsServiceLive),
);

const getLsulpLive = GetLsulpService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(stateEntityDetailsLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive),
);

const convertLsuToXrdServiceLive = ConvertLsuToXrdService.Default.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive),
);

const convertLsuToXrdLive = ConvertLsuToXrdService.Default.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive),
);

const getLsulpValueLive = GetLsulpValueService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(stateEntityDetailsLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive),
);

const getComponentStateServiceLive = GetComponentStateService.Default.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(gatewayApiClientLive),
);

const keyValueStoreDataServiceLive = KeyValueStoreDataService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
);

const keyValueStoreKeysServiceLive = KeyValueStoreKeysService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
);

const getKeyValueStoreServiceLive = GetKeyValueStoreService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(keyValueStoreDataServiceLive),
  Layer.provide(keyValueStoreKeysServiceLive),
);

const getFungibleBalanceLive = GetFungibleBalanceService.Default.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive),
);

const getWeftFinancePositionsLive = GetWeftFinancePositionsService.Default.pipe(
  Layer.provide(getNonFungibleBalanceLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getFungibleBalanceLive),
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(getComponentStateServiceLive),
  Layer.provide(getKeyValueStoreServiceLive),
);

const getRootFinancePositionLive = GetRootFinancePositionsService.Default.pipe(
  Layer.provide(getNonFungibleBalanceLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
);

const getNonFungibleIdsServiceLive = GetNonFungibleIdsService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityNonFungibleDataServiceLive),
);

const getNftResourceManagersServiceLive =
  GetNftResourceManagersService.Default.pipe(
    Layer.provide(gatewayApiClientLive),
    Layer.provide(entityNonFungiblesPageServiceLive),
    Layer.provide(entityNonFungibleDataServiceLive),
    Layer.provide(getNonFungibleIdsServiceLive),
  );

const unstakingReceiptProcessorServiceLive =
  UnstakingReceiptProcessorService.Default.pipe(
    Layer.provide(entityNonFungibleDataServiceLive),
  );

const dappLayer = Layer.mergeAll(
  getWeftFinancePositionsLive,
  getRootFinancePositionLive,
);

const getVotingPowerAtStateVersionLive =
  GetVotingPowerAtStateVersionService.Default.pipe(
    Layer.provide(stateEntityDetailsLive),
    Layer.provide(entityFungiblesPageServiceLive),
    Layer.provide(getLedgerStateLive),
    Layer.provide(entityNonFungiblesPageServiceLive),
    Layer.provide(entityNonFungibleDataServiceLive),
    Layer.provide(getNonFungibleBalanceLive),
    Layer.provide(getAllValidatorsServiceLive),
    Layer.provide(getUserStakingPositionsLive),
    Layer.provide(getLsulpLive),
    Layer.provide(convertLsuToXrdLive),
    Layer.provide(getLsulpValueLive),
    Layer.provide(getEntityDetailsServiceLive),
    Layer.provide(dappLayer),
    Layer.provide(getNftResourceManagersServiceLive),
    Layer.provide(getKeyValueStoreServiceLive),
    Layer.provide(getNonFungibleIdsServiceLive),
    Layer.provide(unstakingReceiptProcessorServiceLive),
    Layer.provide(gatewayApiClientLive),
    Layer.provide(entityNonFungibleDataServiceLive),
  );

const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: 'api' },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
}));

const selectedOptionMap = new Map<string, string>();

for (const account of accounts) {
  selectedOptionMap.set(account.account_address, account.selected_option);
}

describe.skip('calculateVotingPower', () => {
  it('should get user voting power', async () => {
    const addresses = accounts.map((account) => account.account_address);
    const program = Effect.provide(
      Effect.gen(function* () {
        const getVotingPowerAtStateVersionService =
          yield* GetVotingPowerAtStateVersionService;

        return yield* getVotingPowerAtStateVersionService
          .run({
            addresses: addresses,
            at_ledger_state: {
              timestamp: new Date('2025-05-01T00:00:00.000Z'),
            },
          })
          .pipe(Effect.withSpan('getVotingPowerAtStateVersionService'));
      }),
      getVotingPowerAtStateVersionLive,
    );

    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(NodeSdkLive),
        catchAll((error) => {
          console.error(JSON.stringify(error, null, 2));
          return Effect.fail(error);
        }),
      ),
    );

    console.log(JSON.stringify(result, null, 2));
  }, 600_000);
});
