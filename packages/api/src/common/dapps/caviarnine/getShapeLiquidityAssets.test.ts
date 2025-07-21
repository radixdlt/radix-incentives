import { Effect, Layer } from "effect";
import { GetNonFungibleBalanceService } from "../../gateway/getNonFungibleBalance";
import { GatewayApiClientLive } from "../../gateway/gatewayApiClient";
import { GetLedgerStateService } from "../../gateway/getLedgerState";
import { GetEntityDetailsService } from "../../gateway/getEntityDetails";

import { EntityNonFungibleDataService } from "../../gateway/entityNonFungiblesData";
import { EntityNonFungiblesPageService } from "../../gateway/entityNonFungiblesPage";
import { CaviarNineConstants } from "data";
import { GetResourceHoldersService } from "../../gateway/getResourceHolders";
import {
  GetShapeLiquidityAssetsLive,
  GetShapeLiquidityAssetsService,
} from "./getShapeLiquidityAssets";
import { GetKeyValueStoreService } from "../../gateway/getKeyValueStore";
import { KeyValueStoreDataService } from "../../gateway/keyValueStoreData";
import { KeyValueStoreKeysService } from "../../gateway/keyValueStoreKeys";
import { GetComponentStateService } from "../../gateway/getComponentState";
import { GetQuantaSwapBinMapLive } from "./getQuantaSwapBinMap";
import { GetShapeLiquidityClaimsLive } from "./getShapeLiquidityClaims";
import {
  GetNftResourceManagersService,
  GetNonFungibleIdsService,
} from "../../gateway";

const gatewayApiClientLive = GatewayApiClientLive;

const getLedgerStateLive = GetLedgerStateService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getEntityDetailsServiceLive = GetEntityDetailsService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityNonFungiblesPageServiceLive =
  EntityNonFungiblesPageService.Default.pipe(
    Layer.provide(gatewayApiClientLive)
  );

const getNonFungibleIdsServiceLive = GetNonFungibleIdsService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getNftResourceManagersServiceLive =
  GetNftResourceManagersService.Default.pipe(
    Layer.provide(gatewayApiClientLive),
    Layer.provide(entityNonFungiblesPageServiceLive),
    Layer.provide(getNonFungibleIdsServiceLive)
  );

const entityNonFungibleDataLive = EntityNonFungibleDataService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityNonFungiblesPageLive = EntityNonFungiblesPageService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityNonFungibleDataLive)
);

const getNonfungibleBalanceLive = GetNonFungibleBalanceService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(entityNonFungibleDataLive),
  Layer.provide(entityNonFungiblesPageLive),
  Layer.provide(getNftResourceManagersServiceLive)
);

const getResourceHoldersLive = GetResourceHoldersService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getEntityDetailsLive = GetEntityDetailsService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const keyValueStoreDataLive = KeyValueStoreDataService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getKeyValueStoreKeysLive = KeyValueStoreKeysService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getKeyValueStoreLive = GetKeyValueStoreService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(keyValueStoreDataLive),
  Layer.provide(getKeyValueStoreKeysLive)
);

const getComponentStateLive = GetComponentStateService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(getEntityDetailsLive)
);

const getQuantaSwapBinMapLive = GetQuantaSwapBinMapLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(getEntityDetailsLive),
  Layer.provide(getKeyValueStoreLive),
  Layer.provide(getComponentStateLive)
);

const getShapeLiquidityClaimsLive = GetShapeLiquidityClaimsLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(getEntityDetailsLive),
  Layer.provide(entityNonFungibleDataLive)
);

const getShapeLiquidityAssetsLive = GetShapeLiquidityAssetsLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(getResourceHoldersLive),
  Layer.provide(getNonfungibleBalanceLive),
  Layer.provide(getEntityDetailsLive),
  Layer.provide(entityNonFungibleDataLive),
  Layer.provide(getKeyValueStoreLive),
  Layer.provide(getComponentStateLive),
  Layer.provide(getQuantaSwapBinMapLive),
  Layer.provide(getShapeLiquidityClaimsLive),
  Layer.provide(getNftResourceManagersServiceLive)
);

describe("getShapeLiquidityAssets", () => {
  it("should get the shape liquidity assets", async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getShapeLiquidityAssetsService =
          yield* GetShapeLiquidityAssetsService;
        const getLedgerState = yield* GetLedgerStateService;
        const getResourceHoldersService = yield* GetResourceHoldersService;
        const getNonfungibleBalance = yield* GetNonFungibleBalanceService;

        const state = yield* getLedgerState({
          // timestamp: new Date(),
          at_ledger_state: {
            timestamp: new Date("2025-04-01T00:00:00.000Z"),
            // state_version: 286058118,
          },
        });

        console.log(JSON.stringify(state, null, 2));

        const {
          componentAddress,
          liquidity_receipt: liquidityReceiptResourceAddress,
        } = CaviarNineConstants.shapeLiquidityPools.XRD_xUSDC;

        const resourceHolders = yield* getResourceHoldersService({
          resourceAddress: liquidityReceiptResourceAddress,
        });

        const addresses = resourceHolders
          .filter((item) => item.holder_address.startsWith("account_"))
          .map((item) => item.holder_address);

        const accountNonFungibleBalances = yield* getNonfungibleBalance({
          addresses,
          at_ledger_state: {
            state_version: state.state_version,
          },
        });

        const nftIds = accountNonFungibleBalances.items.flatMap((item) =>
          item.nonFungibleResources
            .filter(
              (item) => item.resourceAddress === liquidityReceiptResourceAddress
            )

            .flatMap((item) => item.items.map((item) => item.id))
        );

        const result = yield* getShapeLiquidityAssetsService({
          componentAddress,
          addresses: addresses,
          priceBounds: {
            lower: 0.7,
            upper: 1.3,
          },
          at_ledger_state: {
            state_version: state.state_version,
          },
        });

        return result;
      }),
      Layer.mergeAll(
        getShapeLiquidityAssetsLive,
        getNonfungibleBalanceLive,
        getResourceHoldersLive,
        getLedgerStateLive,
        getShapeLiquidityAssetsLive,
        getNftResourceManagersServiceLive
      )
    );

    const result = await Effect.runPromise(
      program.pipe(
        Effect.catchAll((error) => {
          console.error(JSON.stringify(error, null, 2));
          return Effect.fail(error);
        })
      )
    );

    console.log(JSON.stringify(result, null, 2));
  }, 300_000);
});
