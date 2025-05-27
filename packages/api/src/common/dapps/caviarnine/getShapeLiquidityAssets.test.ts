import { Effect, Layer } from "effect";
import {
  GetNonFungibleBalanceLive,
  GetNonFungibleBalanceService,
} from "../../gateway/getNonFungibleBalance";
import { GatewayApiClientLive } from "../../gateway/gatewayApiClient";
import {
  GetLedgerStateLive,
  GetLedgerStateService,
} from "../../gateway/getLedgerState";
import { GetEntityDetailsServiceLive } from "../../gateway/getEntityDetails";

import { EntityNonFungibleDataLive } from "../../gateway/entityNonFungiblesData";
import { EntityNonFungiblesPageLive } from "../../gateway/entityNonFungiblesPage";
import { CaviarNineConstants } from "./constants";
import {
  GetResourceHoldersLive,
  GetResourceHoldersService,
} from "../../gateway/getResourceHolders";
import {
  GetShapeLiquidityAssetsLive,
  GetShapeLiquidityAssetsService,
} from "./getShapeLiquidityAssets";
import { GetKeyValueStoreLive } from "../../gateway/getKeyValueStore";
import { KeyValueStoreDataLive } from "../../gateway/keyValueStoreData";
import { KeyValueStoreKeysLive } from "../../gateway/keyValueStoreKeys";
import { GetComponentStateLive } from "../../gateway/getComponentState";
import { GetQuantaSwapBinMapLive } from "./getQuantaSwapBinMap";
import { GetShapeLiquidityClaimsLive } from "./getShapeLiquidityClaims";
import { calculatePrice } from "./tickCalculator";

const gatewayApiClientLive = GatewayApiClientLive;

const getLedgerStateLive = GetLedgerStateLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getEntityDetailsServiceLive = GetEntityDetailsServiceLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityNonFungiblesPageServiceLive = EntityNonFungiblesPageLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityNonFungibleDataLive = EntityNonFungibleDataLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityNonFungiblesPageLive = EntityNonFungiblesPageLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityNonFungibleDataLive)
);

const getNonfungibleBalanceLive = GetNonFungibleBalanceLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(entityNonFungibleDataLive),
  Layer.provide(entityNonFungiblesPageLive)
);

const getResourceHoldersLive = GetResourceHoldersLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getEntityDetailsLive = GetEntityDetailsServiceLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const keyValueStoreDataLive = KeyValueStoreDataLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getKeyValueStoreKeysLive = KeyValueStoreKeysLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getKeyValueStoreLive = GetKeyValueStoreLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(keyValueStoreDataLive),
  Layer.provide(getKeyValueStoreKeysLive)
);

const getComponentStateLive = GetComponentStateLive.pipe(
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
  Layer.provide(getShapeLiquidityClaimsLive)
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

        const addresses = resourceHolders.items
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
        gatewayApiClientLive,
        getLedgerStateLive,
        getResourceHoldersLive,
        getNonfungibleBalanceLive,
        getShapeLiquidityAssetsLive,
        getEntityDetailsLive,
        entityNonFungibleDataLive,
        entityNonFungiblesPageServiceLive,
        getKeyValueStoreLive,
        getKeyValueStoreKeysLive,
        keyValueStoreDataLive,
        getComponentStateLive,
        getQuantaSwapBinMapLive,
        getShapeLiquidityClaimsLive
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
