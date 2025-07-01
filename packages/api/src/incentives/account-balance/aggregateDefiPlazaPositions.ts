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
import { CaviarNineConstants } from "../../common/dapps/caviarnine/constants";
import type { AccountBalanceData, ActivityId } from "db/incentives";
import {
  AddressValidationService,
  type UnknownTokenError,
} from "../../common/address-validation/addressValidation";

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
    GetUsdValueServiceError | UnknownTokenError | InvalidDefiPlazaPositionError
  >
>() {}

export const AggregateDefiPlazaPositionsLive = Layer.effect(
  AggregateDefiPlazaPositionsService,
  Effect.gen(function* () {
    const getUsdValueService = yield* GetUsdValueService;
    const addressValidationService = yield* AddressValidationService;
    return (input) =>
      Effect.gen(function* () {
        const defiPlazaPositions =
          input.accountBalance.defiPlazaPositions.items;

        if (defiPlazaPositions.length === 0) {
          // Return zero entries for all supported pools
          const results: AggregateDefiPlazaPositionsOutput[] = [];
          for (const pool of Object.values(DefiPlaza)) {
            const baseTokenName = yield* addressValidationService.getTokenName(
              pool.baseResourceAddress
            );
            const quoteTokenName = yield* addressValidationService.getTokenName(
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
          const token1Name = yield* addressValidationService.getTokenName(position1.resourceAddress);
          const token2Name = yield* addressValidationService.getTokenName(position2.resourceAddress);

          // Determine which tokens are XRD derivatives (XRD or LSULP)
          const isToken1XrdDerivative =
            position1.resourceAddress === Assets.Fungible.XRD ||
            position1.resourceAddress ===
              CaviarNineConstants.LSULP.resourceAddress;
          const isToken2XrdDerivative =
            position2.resourceAddress === Assets.Fungible.XRD ||
            position2.resourceAddress ===
              CaviarNineConstants.LSULP.resourceAddress;

          // Calculate USD value of all non-XRD derivative tokens
          let totalUsdValue = new BigNumber(0);

          // Add token1 value if it's not an XRD derivative
          if (!isToken1XrdDerivative) {
            const token1UsdValue = yield* getUsdValueService({
              amount: new BigNumber(position1.amount),
              resourceAddress: position1.resourceAddress,
              timestamp: input.timestamp,
            });
            totalUsdValue = totalUsdValue.plus(token1UsdValue);
          }

          // Add token2 value if it's not an XRD derivative
          if (!isToken2XrdDerivative) {
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
                  isXrdOrDerivative: isToken1XrdDerivative,
                },
                quoteToken: {
                  resourceAddress: position2.resourceAddress,
                  amount: position2.amount.toString(),
                  isXrdOrDerivative: isToken2XrdDerivative,
                },
              },
            });
          }
        }

        return results;
      });
  })
);
