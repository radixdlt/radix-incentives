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
import {
  GetStateVersionLive,
  GetStateVersionService,
} from "../../gateway/getStateVersion";
import { GetEntityDetailsServiceLive } from "../../gateway/getEntityDetails";
import { LoggerLive } from "../../logger/logger";
import { EntityNonFungibleDataLive } from "../../gateway/entityNonFungiblesData";
import { EntityNonFungiblesPageLive } from "../../gateway/entityNonFungiblesPage";
import { CaviarNineConstants, shapeLiquidityReceiptSet } from "./constants";
import { getRedemptionValue } from "@stabilis/c9-shape-liquidity-getter";
import { catchAll, tryPromise } from "effect/Effect";
import {
  GetResourceHoldersLive,
  GetResourceHoldersService,
} from "../../gateway/getResourceHolders";
import path from "node:path";
import { writeFile } from "node:fs/promises";
import { BigNumber } from "bignumber.js";

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

const getResourceHoldersLive = GetResourceHoldersLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const outputPath = path.join(__dirname, "output.json");

const output: {
  preview: {
    xToken: BigNumber;
    yToken: BigNumber;
    nfId: string;
  };
  octoLib: {
    xToken: BigNumber;
    yToken: BigNumber;
    nfId: string;
  } | null;
}[] = [];

describe("getShapeLiquidityAssets", () => {
  it("should get the shape liquidity assets", async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getShapeLiquidityAssets = yield* GetShapeLiquidityAssetsService;
        const getNonfungibleBalance = yield* GetNonFungibleBalanceService;
        const getStateVersionService = yield* GetStateVersionService;
        const getResourceHoldersService = yield* GetResourceHoldersService;

        const stateVersion = yield* getStateVersionService(new Date());

        const resourceHolders = yield* getResourceHoldersService({
          resourceAddress:
            CaviarNineConstants.shapeLiquidityPools[2].liquidity_receipt,
        });

        const addresses = resourceHolders.items.map(
          (item) => item.holder_address
        );

        const nonFungiblesResults = yield* getNonfungibleBalance({
          addresses: addresses,
          state: {
            state_version: stateVersion.stateVersion,
          },
        });

        const nonFungiblesResultItems = nonFungiblesResults.items;

        for (const nonFungiblesResult of nonFungiblesResultItems) {
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
                stateVersion: {
                  state_version: stateVersion.stateVersion,
                  type: "ByStateVersion",
                },
              });

              const octoLib = yield* tryPromise({
                try: () =>
                  getRedemptionValue({
                    componentAddress: shapeLiquidityPool.componentAddress,
                    nftId: nft.id,
                    stateVersion: stateVersion.stateVersion,
                  }),
                catch: (error) => {
                  console.error(
                    "octoLib error",
                    {
                      componentAddress: shapeLiquidityPool.componentAddress,
                      nftId: nft.id,
                      stateVersion: stateVersion.stateVersion,
                    },
                    error
                  );
                  return error;
                },
              }).pipe(
                catchAll((error) => {
                  if (error instanceof Error) {
                    if (error.message === "NFT not found") {
                      return Effect.succeed(null);
                    }
                  }
                  return Effect.fail(error);
                })
              );

              console.log(
                "preview",
                JSON.stringify({ xToken: x, yToken: y, nfId: nft.id }, null, 2)
              );

              console.log(
                "octoLib",
                JSON.stringify({ ...octoLib, nfId: nft.id }, null, 2)
              );

              output.push({
                preview: { xToken: x, yToken: y, nfId: nft.id },
                octoLib: {
                  xToken: octoLib?.xToken
                    ? new BigNumber(octoLib.xToken)
                    : new BigNumber(0),
                  yToken: octoLib?.yToken
                    ? new BigNumber(octoLib.yToken)
                    : new BigNumber(0),
                  nfId: nft.id,
                },
              });
            }
          }
        }

        writeFile(outputPath, JSON.stringify(output, null, 2));

        return "done";
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
        getEntityDetailsServiceLive,
        getResourceHoldersLive
      )
    );

    try {
      const result = await Effect.runPromise(program);

      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error(JSON.stringify(error, null, 2));
      throw error;
    }
  }, 300_000);
});
