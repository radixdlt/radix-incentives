import { Effect, Layer } from "effect";
import type { AccountBalance as AccountBalanceFromSnapshot } from "./getAccountBalancesAtStateVersion";
import { Context } from "effect";
import {
  GetUsdValueService,
  type GetUsdValueServiceError,
} from "../token-price/getUsdValue";
import { BigNumber } from "bignumber.js";
import { Assets } from "../../common/assets/constants";
import { DefiPlaza } from "../../common/dapps/defiplaza/constants";
import type { AccountBalanceData, ActivityId } from "db/incentives";
import {
  TokenNameService,
  type UnknownTokenError,
} from "../../common/token-name/getTokenName";

export class InvalidDefiPlazaPositionError {
  readonly _tag = "InvalidDefiPlazaPositionError";
  constructor(
    readonly lpResourceAddress: string,
    readonly reason: string
  ) {}
}

export type AggregateDefiPlazaPositionsInput = {
  accountBalance: AccountBalanceFromSnapshot;
  timestamp: Date;
};

export type AggregateDefiPlazaPositionsOutput = AccountBalanceData;

export class AggregateDefiPlazaPositionsService extends Context.Tag(
  "AggregateDefiPlazaPositionsService"
)<
  AggregateDefiPlazaPositionsService,
  (
    input: AggregateDefiPlazaPositionsInput
  ) => Effect.Effect<
    AggregateDefiPlazaPositionsOutput[],
    GetUsdValueServiceError | UnknownTokenError | InvalidDefiPlazaPositionError,
    GetUsdValueService | TokenNameService
  >
>() {}

export const AggregateDefiPlazaPositionsLive = Layer.effect(
  AggregateDefiPlazaPositionsService,
  Effect.gen(function* () {
    const getUsdValueService = yield* GetUsdValueService;
    const tokenNameService = yield* TokenNameService;
    return (input) =>
      Effect.gen(function* () {
        const defiPlazaPositions =
          input.accountBalance.defiPlazaPositions.items;

        if (defiPlazaPositions.length === 0) {
          // Return zero entries for all supported pools
          const results: AggregateDefiPlazaPositionsOutput[] = [];
          for (const pool of Object.values(DefiPlaza)) {
            const baseTokenName = yield* tokenNameService(
              pool.baseResourceAddress
            );
            const quoteTokenName = yield* tokenNameService(
              pool.quoteResourceAddress
            );
            const sortedTokenNames = [baseTokenName, quoteTokenName].sort();
            results.push({
              activityId:
                `defiPlaza_lp_${sortedTokenNames[0]}-${sortedTokenNames[1]}` as ActivityId,
              usdValue: new BigNumber(0).toString(),
            });
          }
          return results;
        }

        const results: AggregateDefiPlazaPositionsOutput[] = [];
        const processedActivityIds = new Set<string>();

        for (const lpPosition of defiPlazaPositions) {
          // DefiPlaza pools should have exactly 2 tokens
          if (lpPosition.position.length !== 2) {
            return yield* Effect.fail(
              new InvalidDefiPlazaPositionError(
                lpPosition.lpResourceAddress,
                `DefiPlaza position must contain exactly 2 tokens. Found: ${lpPosition.position.length}`
              )
            );
          }

          const [position1, position2] = lpPosition.position;
          if (!position1 || !position2) {
            return yield* Effect.fail(
              new InvalidDefiPlazaPositionError(
                lpPosition.lpResourceAddress,
                "Invalid position structure"
              )
            );
          }

          // Get token names for both positions
          const token1Name = yield* tokenNameService(position1.resourceAddress);
          const token2Name = yield* tokenNameService(position2.resourceAddress);

          // Determine which token is XRD (if any)
          const isToken1Xrd = position1.resourceAddress === Assets.Fungible.XRD;
          const isToken2Xrd = position2.resourceAddress === Assets.Fungible.XRD;

          // Calculate USD value of all non-XRD tokens
          let totalUsdValue = new BigNumber(0);

          // Add token1 value if it's not XRD
          if (!isToken1Xrd) {
            const token1UsdValue = yield* getUsdValueService({
              amount: new BigNumber(position1.amount),
              resourceAddress: position1.resourceAddress,
              timestamp: input.timestamp,
            });
            totalUsdValue = totalUsdValue.plus(token1UsdValue);
          }

          // Add token2 value if it's not XRD
          if (!isToken2Xrd) {
            const token2UsdValue = yield* getUsdValueService({
              amount: new BigNumber(position2.amount),
              resourceAddress: position2.resourceAddress,
              timestamp: input.timestamp,
            });
            totalUsdValue = totalUsdValue.plus(token2UsdValue);
          }

          // Generate dynamic activity ID based on token pair (alphabetical order for consistency)
          const sortedTokenNames = [token1Name, token2Name].sort();
          const activityId =
            `defiPlaza_lp_${sortedTokenNames[0]}-${sortedTokenNames[1]}` as ActivityId;

          // Check for duplicate activity IDs and handle aggregation
          if (processedActivityIds.has(activityId)) {
            // Find existing result and add to it
            const existingResultIndex = results.findIndex(
              (r) => r.activityId === activityId
            );
            if (existingResultIndex >= 0) {
              const existingResult = results[existingResultIndex];
              if (existingResult) {
                const newTotalValue = new BigNumber(
                  existingResult.usdValue
                ).plus(totalUsdValue);
                results[existingResultIndex] = {
                  ...existingResult,
                  usdValue: newTotalValue.toString(),
                  metadata: {
                    ...existingResult.metadata,
                    // Could merge metadata here if needed
                    note: "Aggregated from multiple positions",
                  },
                };
              }
            }
          } else {
            processedActivityIds.add(activityId);
            results.push({
              activityId,
              usdValue: totalUsdValue.toString(),
              metadata: {
                lpResourceAddress: lpPosition.lpResourceAddress,
                tokenPair: `${token1Name}_${token2Name}`,
                baseToken: {
                  resourceAddress: position1.resourceAddress,
                  amount: position1.amount.toString(),
                },
                quoteToken: {
                  resourceAddress: position2.resourceAddress,
                  amount: position2.amount.toString(),
                },
              },
            });
          }
        }

        return results;
      });
  })
);
