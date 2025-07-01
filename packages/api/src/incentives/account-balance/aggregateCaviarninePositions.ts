import { Effect, Layer } from "effect";
import type { AccountBalance as AccountBalanceFromSnapshot } from "./getAccountBalancesAtStateVersion";
import { Context } from "effect";
import {
  GetUsdValueService,
  type GetUsdValueServiceError,
} from "../token-price/getUsdValue";
import { BigNumber } from "bignumber.js";
import { Assets } from "../../common/assets/constants";
import { CaviarNineConstants } from "../../common/dapps/caviarnine/constants";
import type { AccountBalanceData, ActivityId } from "db/incentives";
import {
  AddressValidationService,
  type UnknownTokenError,
} from "../../common/address-validation/addressValidation";

export type AggregateCaviarninePositionsInput = {
  accountBalance: AccountBalanceFromSnapshot;
  timestamp: Date;
};

export type AggregateCaviarninePositionsOutput = AccountBalanceData;

export class AggregateCaviarninePositionsService extends Context.Tag(
  "AggregateCaviarninePositionsService"
)<
  AggregateCaviarninePositionsService,
  (
    input: AggregateCaviarninePositionsInput
  ) => Effect.Effect<
    AggregateCaviarninePositionsOutput[],
    GetUsdValueServiceError | UnknownTokenError
  >
>() {}

export const AggregateCaviarninePositionsLive = Layer.effect(
  AggregateCaviarninePositionsService,
  Effect.gen(function* () {
    const getUsdValueService = yield* GetUsdValueService;
    const addressValidationService = yield* AddressValidationService;
    return (input) =>
      Effect.gen(function* () {
        const results: AccountBalanceData[] = [];
        const processedPools = new Set<string>();

        // Process each pool in the CaviarNine positions
        for (const [_poolKey, poolAssets] of Object.entries(
          input.accountBalance.caviarninePositions
        )) {
          const firstAsset = poolAssets[0];

          if (!firstAsset || poolAssets.length === 0) {
            continue;
          }

          const { xToken, yToken } = firstAsset;

          // Determine which tokens are XRD derivatives (XRD or LSULP)
          const isXTokenXrdDerivative =
            xToken.resourceAddress === Assets.Fungible.XRD ||
            xToken.resourceAddress ===
              CaviarNineConstants.LSULP.resourceAddress;
          const isYTokenXrdDerivative =
            yToken.resourceAddress === Assets.Fungible.XRD ||
            yToken.resourceAddress ===
              CaviarNineConstants.LSULP.resourceAddress;

          // Get token names for the pair
          const xTokenName = yield* addressValidationService.getTokenName(xToken.resourceAddress);
          const yTokenName = yield* addressValidationService.getTokenName(yToken.resourceAddress);

          const totals = poolAssets.reduce(
            (acc, item) => {
              acc.totalXToken = acc.totalXToken.plus(
                item.xToken.withinPriceBounds
              );
              acc.totalYToken = acc.totalYToken.plus(
                item.yToken.withinPriceBounds
              );
              return acc;
            },
            { totalXToken: new BigNumber(0), totalYToken: new BigNumber(0) }
          );

          // Calculate USD value of all non-XRD derivative tokens
          let totalNonXrdDerivativeUsdValue = new BigNumber(0);

          // Add xToken value if it's not an XRD derivative
          if (!isXTokenXrdDerivative && totals.totalXToken.gt(0)) {
            const xTokenUsdValue = yield* getUsdValueService({
              amount: totals.totalXToken,
              resourceAddress: xToken.resourceAddress,
              timestamp: input.timestamp,
            });
            totalNonXrdDerivativeUsdValue =
              totalNonXrdDerivativeUsdValue.plus(xTokenUsdValue);
          }

          // Add yToken value if it's not an XRD derivative
          if (!isYTokenXrdDerivative && totals.totalYToken.gt(0)) {
            const yTokenUsdValue = yield* getUsdValueService({
              amount: totals.totalYToken,
              resourceAddress: yToken.resourceAddress,
              timestamp: input.timestamp,
            });
            totalNonXrdDerivativeUsdValue =
              totalNonXrdDerivativeUsdValue.plus(yTokenUsdValue);
          }

          // Generate activity ID based on token pair - cast to ActivityId since we know it's valid
          const activityId = `c9_lp_${xTokenName}-${yTokenName}` as ActivityId;
          processedPools.add(activityId);

          results.push({
            activityId,
            usdValue: totalNonXrdDerivativeUsdValue.toString(),
            metadata: {
              tokenPair: `${xTokenName}_${yTokenName}`,
              baseToken: {
                resourceAddress: xToken.resourceAddress,
                amount: totals.totalXToken.toString(),
                isXrdOrDerivative: isXTokenXrdDerivative,
              },
              quoteToken: {
                resourceAddress: yToken.resourceAddress,
                amount: totals.totalYToken.toString(),
                isXrdOrDerivative: isYTokenXrdDerivative,
              },
            },
          });
        }

        // Process Hyperstake positions (simple pool - LSULP/XRD)
        let totalLsulpAmount = new BigNumber(0);
        let totalXrdAmount = new BigNumber(0);

        for (const hyperstakeItem of input.accountBalance.hyperstakePositions
          .items) {
          for (const position of hyperstakeItem.position) {
            if (
              position.resourceAddress ===
              CaviarNineConstants.LSULP.resourceAddress
            ) {
              totalLsulpAmount = totalLsulpAmount.plus(position.amount);
            } else if (position.resourceAddress === Assets.Fungible.XRD) {
              totalXrdAmount = totalXrdAmount.plus(position.amount);
            }
          }
        }

        // Hyperstake is LSULP/XRD pool, both are XRD derivatives, so USD value is 0
        // But we track the amounts for XRD holding calculations
        const hyperstakeActivityId = "c9_lp_hyperstake" as ActivityId;
        processedPools.add(hyperstakeActivityId);

        results.push({
          activityId: hyperstakeActivityId,
          usdValue: "0", // XRD derivatives don't count towards USD value
          metadata: {
            tokenPair: "lsulp_xrd",
            baseToken: {
              resourceAddress: CaviarNineConstants.LSULP.resourceAddress,
              amount: totalLsulpAmount.toString(),
              isXrdOrDerivative: true,
            },
            quoteToken: {
              resourceAddress: Assets.Fungible.XRD,
              amount: totalXrdAmount.toString(),
              isXrdOrDerivative: true,
            },
          },
        });

        // Add zero entries for shape liquidity pools with no positions
        for (const pool of Object.values(
          CaviarNineConstants.shapeLiquidityPools
        )) {
          const xTokenName = yield* addressValidationService.getTokenName(pool.token_x);
          const yTokenName = yield* addressValidationService.getTokenName(pool.token_y);
          const activityId = `c9_lp_${xTokenName}-${yTokenName}` as ActivityId;

          if (!processedPools.has(activityId)) {
            // Determine which tokens are XRD derivatives
            const isXTokenXrdDerivative =
              pool.token_x === Assets.Fungible.XRD ||
              pool.token_x === CaviarNineConstants.LSULP.resourceAddress;
            const isYTokenXrdDerivative =
              pool.token_y === (Assets.Fungible.XRD as string) ||
              pool.token_y ===
                (CaviarNineConstants.LSULP.resourceAddress as string);

            results.push({
              activityId,
              usdValue: "0",
              metadata: {
                tokenPair: `${xTokenName}_${yTokenName}`,
                baseToken: {
                  resourceAddress: pool.token_x,
                  amount: "0",
                  isXrdOrDerivative: isXTokenXrdDerivative,
                },
                quoteToken: {
                  resourceAddress: pool.token_y,
                  amount: "0",
                  isXrdOrDerivative: isYTokenXrdDerivative,
                },
              },
            });
          }
        }

        // Add zero entry for Hyperstake if not processed
        const hyperstakeActivityIdCheck = "c9_lp_hyperstake" as ActivityId;
        if (!processedPools.has(hyperstakeActivityIdCheck)) {
          results.push({
            activityId: hyperstakeActivityIdCheck,
            usdValue: "0",
            metadata: {
              tokenPair: "lsulp_xrd",
              baseToken: {
                resourceAddress: CaviarNineConstants.LSULP.resourceAddress,
                amount: "0",
                isXrdOrDerivative: true,
              },
              quoteToken: {
                resourceAddress: Assets.Fungible.XRD,
                amount: "0",
                isXrdOrDerivative: true,
              },
            },
          });
        }

        return results;
      });
  })
);
