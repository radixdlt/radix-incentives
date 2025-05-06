import { Effect, Layer } from "effect";
import { CoreApiClientLive } from "../../core/coreApiClient";
import {
  GetShapeLiquidityAssetsLive,
  GetShapeLiquidityAssetsService,
} from "./getShapeLiquidityAssets";
import { PreviewTransactionLive } from "../../core/previewTransaction";
import {
  GetNonFungibleBalanceLive,
  GetNonFungibleBalanceService,
} from "../../gateway/getNonFungibleBalance";
import { GatewayApiClientLive } from "../../gateway/gatewayApiClient";
import { createAppConfigLive } from "../../config/appConfig";
import { GetStateVersionLive } from "../../gateway/getStateVersion";
import { GetEntityDetailsServiceLive } from "../../gateway/getEntityDetails";
import { LoggerLive } from "../../logger/logger";
import { EntityNonFungibleDataLive } from "../../gateway/entityNonFungiblesData";
import { EntityNonFungiblesPageLive } from "../../gateway/entityNonFungiblesPage";
import { shapeLiquidityReceiptSet } from "./constants";

const coreApiClientLive = CoreApiClientLive;

const previewTransactionLive = PreviewTransactionLive.pipe(
  Layer.provide(coreApiClientLive)
);

const getShapeLiquidityAssetsLive = GetShapeLiquidityAssetsLive.pipe(
  Layer.provide(coreApiClientLive),
  Layer.provide(previewTransactionLive)
);

const appConfigServiceLive = createAppConfigLive();

const gatewayApiClientLive = GatewayApiClientLive.pipe(
  Layer.provide(appConfigServiceLive)
);

const getStateVersionLive = GetStateVersionLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const loggerLive = LoggerLive.pipe(Layer.provide(appConfigServiceLive));

const getEntityDetailsServiceLive = GetEntityDetailsServiceLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(loggerLive)
);

const entityNonFungibleDataLive = EntityNonFungibleDataLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(loggerLive)
);

const entityNonFungiblesPageLive = EntityNonFungiblesPageLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(loggerLive),
  Layer.provide(entityNonFungibleDataLive)
);

const getNonfungibleBalanceLive = GetNonFungibleBalanceLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(getStateVersionLive),
  Layer.provide(loggerLive),
  Layer.provide(entityNonFungibleDataLive),
  Layer.provide(entityNonFungiblesPageLive)
);

describe("getShapeLiquidityAssets", () => {
  it("should get the shape liquidity assets", async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getShapeLiquidityAssets = yield* GetShapeLiquidityAssetsService;
        const getNonfungibleBalance = yield* GetNonFungibleBalanceService;

        const nonFungiblesResults = yield* getNonfungibleBalance({
          addresses: [
            "account_rdx12xwrtgmq68wqng0d69qx2j627ld2dnfufdklkex5fuuhc8eaeltq2k",
          ],
        });

        const [nonFungiblesResult] = nonFungiblesResults.items;

        const shapeLiquidityNftCollections =
          nonFungiblesResult.nonFungibleResources.filter((item) => {
            return shapeLiquidityReceiptSet.has(item.resourceAddress);
          });

        for (const collection of shapeLiquidityNftCollections) {
          for (const nft of collection.items) {
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            const shapeLiquidityPool = shapeLiquidityReceiptSet.get(
              collection.resourceAddress
            )!;

            const { x, y } = yield* getShapeLiquidityAssets({
              componentAddress: shapeLiquidityPool.componentAddress,
              nonFungibleLocalId: nft.id,
              networkId: 1,
            });

            console.log(
              JSON.stringify(
                {
                  shapeLiquidityPool,
                  redemptionValue: {
                    x: {
                      resourceAddress: shapeLiquidityPool.token_x,
                      value: x,
                    },
                    y: {
                      resourceAddress: shapeLiquidityPool.token_y,
                      value: y,
                    },
                  },
                },
                null,
                2
              )
            );
          }
        }

        return "";
      }),
      Layer.mergeAll(
        getShapeLiquidityAssetsLive,
        coreApiClientLive,
        previewTransactionLive,
        getNonfungibleBalanceLive,
        gatewayApiClientLive,
        appConfigServiceLive,
        loggerLive,
        entityNonFungibleDataLive,
        entityNonFungiblesPageLive,
        getStateVersionLive,
        getEntityDetailsServiceLive
      )
    );

    try {
      const result = await Effect.runPromise(program);

      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error(JSON.stringify(error, null, 2));
      throw error;
    }
  });
});
