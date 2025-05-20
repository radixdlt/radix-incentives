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
  GetLedgerStateLive,
  GetLedgerStateService,
} from "../../gateway/getLedgerState";
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
import { getDatesBetweenIntervals } from "../../helpers/getDatesBetweenIntervals";
import { accounts } from "../../../fixtures/accounts";

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

const getLedgerStateLive = GetLedgerStateLive.pipe(
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
  Layer.provide(getLedgerStateLive),
  Layer.provide(loggerLive),
  Layer.provide(entityNonFungibleDataLive),
  Layer.provide(entityNonFungiblesPageLive)
);

const getResourceHoldersLive = GetResourceHoldersLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

describe("getShapeLiquidityAssets", () => {
  it("should get the shape liquidity assets", async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getShapeLiquidityAssets = yield* GetShapeLiquidityAssetsService;
        const getNonfungibleBalance = yield* GetNonFungibleBalanceService;
        const getLedgerStateService = yield* GetLedgerStateService;
        const getResourceHoldersService = yield* GetResourceHoldersService;

        const dates = getDatesBetweenIntervals(
          new Date(),
          new Date(),
          (value) => {
            return value.setHours(value.getHours() + 12);
          }
        );

        yield* Effect.forEach(dates, (date) => {
          return Effect.gen(function* () {
            const state = yield* getLedgerStateService({
              at_ledger_state: {
                timestamp: date,
              },
            });
            console.log(state);

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

            const shapeLiquidityPool =
              CaviarNineConstants.shapeLiquidityPools[2];

            const resourceHolders = yield* getResourceHoldersService({
              resourceAddress: shapeLiquidityPool.liquidity_receipt,
            });

            const addresses = resourceHolders.items
              .filter((item) => item.holder_address.startsWith("account_"))
              .map((item) => item.holder_address)
              .slice(0, 10);

            console.log(addresses);

            const outputPath = path.join(
              __dirname,
              `${state.proposer_round_timestamp}_${shapeLiquidityPool.name.split("/").join("_")}.json`
            );

            const nonFungiblesResults = yield* getNonfungibleBalance({
              addresses,
              at_ledger_state: {
                state_version: state.state_version,
              },
            });

            const nonFungiblesResultItems = nonFungiblesResults.items;

            for (const nonFungiblesResult of nonFungiblesResultItems) {
              const shapeLiquidityNftCollections =
                nonFungiblesResult.nonFungibleResources.filter((item) =>
                  shapeLiquidityReceiptSet.has(item.resourceAddress)
                );

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
                      state_version: state.state_version,
                      type: "ByStateVersion",
                    },
                  });

                  const octoLib = yield* tryPromise({
                    try: () =>
                      getRedemptionValue({
                        componentAddress: shapeLiquidityPool.componentAddress,
                        nftId: nft.id,
                        stateVersion: state.state_version,
                      }),
                    catch: (error) => {
                      console.error(
                        "octoLib error",
                        {
                          componentAddress: shapeLiquidityPool.componentAddress,
                          nftId: nft.id,
                          stateVersion: state.state_version,
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
                    JSON.stringify(
                      { xToken: x, yToken: y, nfId: nft.id },
                      null,
                      2
                    )
                  );

                  console.log(
                    "octoLib",
                    JSON.stringify({ ...octoLib, nfId: nft.id }, null, 2)
                  );

                  if (x.isZero() && y.isZero()) {
                    continue;
                  }

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
          });
        });

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
        getLedgerStateLive,
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
  }, 3_000_000);
});
