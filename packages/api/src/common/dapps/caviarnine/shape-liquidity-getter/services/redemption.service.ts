import { Decimal } from "decimal.js";
import { getC9BinData } from "../utils/c9Data";
import { getGatewayApi, getNFTDataInChunks } from "./gateway";
import type {
  RedemptionValueInput,
  RedemptionValuesInput,
  RedemptionValueOutput,
  RedemptionValuesOutput,
} from "../types";
import {
  ValidationError,
  ComponentError,
  NFTError,
  DataError,
  NetworkError,
  BaseError,
} from "../types/errors";
import {
  calculateTick,
  calculateBinStartTick,
  calculateBinFraction,
  calculatePrice,
} from "../utils/tickCalculator";

/**
 * Calculates redemption value for a single NFT using component data
 */
function calculateSingleRedemption(
  nftData: any,
  c9Data: any,
  priceBounds?: [number, number],
  middlePrice?: number
): RedemptionValueOutput | null {
  try {
    const liquidityClaimsField = nftData.fields.find(
      (f: any) => f.field_name === "liquidity_claims"
    );

    if (!liquidityClaimsField?.entries) {
      throw NFTError.invalidClaims(nftData.id || "unknown");
    }

    // Initialize amounts
    let amount_x = new Decimal(0);
    let amount_y = new Decimal(0);
    let isActive = false;

    // Calculate price bounds ticks if provided
    let lowerBoundTick: number | undefined;
    let upperBoundTick: number | undefined;
    if (priceBounds) {
      // Calculate the middle price
      let currentPrice: number;
      if (middlePrice !== undefined) {
        currentPrice = middlePrice;
      } else {
        // Calculate current price from current tick + half bin span
        const middleTick = c9Data.currentTick + Math.floor(c9Data.binSpan / 2);
        currentPrice = parseFloat(calculatePrice(middleTick));
      }

      // Calculate actual price bounds using multipliers
      const lowerPrice = currentPrice * priceBounds[0];
      const upperPrice = currentPrice * priceBounds[1];

      // Convert to ticks
      lowerBoundTick = calculateTick(lowerPrice);
      upperBoundTick = calculateTick(upperPrice);
    }

    // Calculate redemption values
    for (const entry of liquidityClaimsField.entries) {
      const tick = parseInt(entry.key.value);
      const claimAmount = entry.value.value;

      // Skip if outside price bounds
      if (priceBounds && (tick < lowerBoundTick! || tick > upperBoundTick!)) {
        continue;
      }

      if (tick < c9Data.currentTick) {
        // Bin below current tick - only Y tokens
        const bin = c9Data.binMapData[tick];
        if (bin) {
          let share = new Decimal(claimAmount).div(bin.total_claim);

          // Apply bin fraction if price bounds are provided
          if (priceBounds) {
            const binStartTick = calculateBinStartTick(tick, c9Data.binSpan);
            const binFraction = calculateBinFraction(
              binStartTick,
              c9Data.binSpan,
              lowerBoundTick!,
              upperBoundTick!
            );
            share = share.times(binFraction);
          }

          amount_y = amount_y.plus(share.times(bin.amount));
        }
      } else if (tick > c9Data.currentTick) {
        // Bin above current tick - only X tokens
        const bin = c9Data.binMapData[tick];
        if (bin) {
          let share = new Decimal(claimAmount).div(bin.total_claim);

          // Apply bin fraction if price bounds are provided
          if (priceBounds) {
            const binStartTick = calculateBinStartTick(tick, c9Data.binSpan);
            const binFraction = calculateBinFraction(
              binStartTick,
              c9Data.binSpan,
              lowerBoundTick!,
              upperBoundTick!
            );
            share = share.times(binFraction);
          }

          amount_x = amount_x.plus(share.times(bin.amount));
        }
      } else {
        // Active bin - both X and Y tokens
        isActive = true;
        let liquidityShare = new Decimal(claimAmount).div(
          c9Data.active_total_claim
        );

        // Apply bin fraction if price bounds are provided
        if (priceBounds) {
          const binStartTick = calculateBinStartTick(tick, c9Data.binSpan);
          const binFraction = calculateBinFraction(
            binStartTick,
            c9Data.binSpan,
            lowerBoundTick!,
            upperBoundTick!
          );
          liquidityShare = liquidityShare.times(binFraction);
        }

        amount_x = amount_x.plus(
          new Decimal(c9Data.active_x).times(liquidityShare)
        );
        amount_y = amount_y.plus(
          new Decimal(c9Data.active_y).times(liquidityShare)
        );
      }
    }

    return {
      xToken: amount_x.toString(),
      yToken: amount_y.toString(),
      isActive,
    };
  } catch (error) {
    if (error instanceof NFTError) {
      throw error;
    }
    console.error("Error calculating single redemption value:", error);
    return null;
  }
}

/**
 * Calculates the redemption value for a single NFT position
 * @param input The input parameters containing componentAddress, nftId, and optional stateVersion and priceBounds
 * @returns A promise that resolves to the redemption values or null if calculation fails
 */
export async function getRedemptionValue(
  input: RedemptionValueInput
): Promise<RedemptionValueOutput | null> {
  try {
    const { componentAddress, nftId, stateVersion, priceBounds, middlePrice } =
      input;

    // Type validation
    if (typeof componentAddress !== "string") {
      throw ValidationError.invalidComponentAddress(componentAddress);
    }
    if (typeof nftId !== "string") {
      throw ValidationError.invalidNftId(nftId);
    }
    if (typeof stateVersion !== "number") {
      throw ValidationError.invalidStateVersion(stateVersion);
    }
    if (priceBounds !== undefined) {
      if (!Array.isArray(priceBounds) || priceBounds.length !== 2) {
        throw ValidationError.invalidPriceBounds();
      }
      if (
        typeof priceBounds[0] !== "number" ||
        typeof priceBounds[1] !== "number"
      ) {
        throw ValidationError.invalidPriceBounds();
      }
      if (priceBounds[0] >= priceBounds[1]) {
        throw ValidationError.invalidPriceBounds();
      }
      if (priceBounds[0] <= 0) {
        throw ValidationError.invalidPriceBounds();
      }
    }
    if (middlePrice !== undefined && typeof middlePrice !== "number") {
      throw ValidationError.invalidMiddlePrice();
    }
    if (middlePrice !== undefined && middlePrice <= 0) {
      throw ValidationError.invalidMiddlePrice();
    }

    // Initialize API once
    const api = getGatewayApi();

    // 1. Get all C9 data
    let c9Data;
    try {
      c9Data = await getC9BinData(componentAddress, stateVersion, api);
    } catch (error: any) {
      if (error instanceof DataError) {
        throw error;
      }
      if (
        error?.details?.validation_errors?.[0]?.errors?.[0]?.includes(
          "beyond the end"
        )
      ) {
        throw DataError.stateVersionTooHigh(stateVersion);
      }
      if (error?.code === 400) {
        throw NetworkError.requestFailed(error.message, error.code);
      }
      throw ComponentError.notC9Component(componentAddress);
    }

    if (!c9Data) {
      throw ComponentError.notC9Component(componentAddress);
    }
    if (!c9Data.currentTick) {
      throw ComponentError.missingField(componentAddress, "currentTick");
    }

    // 2. Get NFT data
    const nftDataMap = await getNFTDataInChunks(
      [nftId],
      c9Data.nftAddress,
      api,
      stateVersion
    ).catch((error) => {
      if (error?.code === 400) {
        throw NetworkError.requestFailed(error.message, error.code);
      }
      return {} as Record<string, object>;
    });

    const nftData = nftDataMap[nftId];
    if (!nftData) {
      throw NFTError.notFound(nftId);
    }

    // 3. Calculate redemption value
    const result = calculateSingleRedemption(
      nftData,
      c9Data,
      priceBounds,
      middlePrice
    );
    if (!result) {
      throw DataError.invalidFormat("redemption calculation");
    }
    return result;
  } catch (error) {
    if (error instanceof BaseError) {
      throw error;
    }
    console.error("Error calculating redemption value:", error);
    throw ComponentError.notC9Component(input.componentAddress);
  }
}

/**
 * Calculates redemption values for multiple NFT positions
 * @param input The input parameters containing componentAddress, array of nftIds, and optional stateVersion and priceBounds
 * @returns A promise that resolves to an object mapping nftIds to their redemption values
 */
export async function getRedemptionValues(
  input: RedemptionValuesInput
): Promise<RedemptionValuesOutput> {
  try {
    const { componentAddress, nftIds, stateVersion, priceBounds, middlePrice } =
      input;

    // Type validation
    if (typeof componentAddress !== "string") {
      throw ValidationError.invalidComponentAddress(componentAddress);
    }
    if (!Array.isArray(nftIds)) {
      throw ValidationError.invalidNftIds();
    }
    if (!nftIds.every((id) => typeof id === "string")) {
      throw ValidationError.invalidNftIds();
    }
    if (typeof stateVersion !== "number") {
      throw ValidationError.invalidStateVersion(stateVersion);
    }
    if (priceBounds !== undefined) {
      if (!Array.isArray(priceBounds) || priceBounds.length !== 2) {
        throw ValidationError.invalidPriceBounds();
      }
      if (
        typeof priceBounds[0] !== "number" ||
        typeof priceBounds[1] !== "number"
      ) {
        throw ValidationError.invalidPriceBounds();
      }
      if (priceBounds[0] >= priceBounds[1]) {
        throw ValidationError.invalidPriceBounds();
      }
      if (priceBounds[0] <= 0) {
        throw ValidationError.invalidPriceBounds();
      }
    }
    if (middlePrice !== undefined && typeof middlePrice !== "number") {
      throw ValidationError.invalidMiddlePrice();
    }
    if (middlePrice !== undefined && middlePrice <= 0) {
      throw ValidationError.invalidMiddlePrice();
    }

    const results: RedemptionValuesOutput = {};

    // Initialize API once
    const api = getGatewayApi();

    // 1. Get component data (only once for all NFTs)
    let c9Data;
    try {
      c9Data = await getC9BinData(componentAddress, stateVersion, api);
    } catch (error: any) {
      if (error instanceof DataError) {
        throw error;
      }
      if (
        error?.details?.validation_errors?.[0]?.errors?.[0]?.includes(
          "beyond the end"
        )
      ) {
        throw DataError.stateVersionTooHigh(stateVersion);
      }
      if (error?.code === 400) {
        throw NetworkError.requestFailed(error.message, error.code);
      }
      throw ComponentError.notC9Component(componentAddress);
    }

    if (!c9Data) {
      throw ComponentError.notC9Component(componentAddress);
    }
    if (!c9Data.currentTick) {
      throw ComponentError.missingField(componentAddress, "currentTick");
    }

    // 2. Get NFT data in chunks
    const nftDataMap = await getNFTDataInChunks(
      nftIds,
      c9Data.nftAddress,
      api,
      stateVersion
    ).catch((error) => {
      if (error?.code === 400) {
        throw NetworkError.requestFailed(error.message, error.code);
      }
      return {} as Record<string, object>;
    });

    // 3. Calculate redemption values for each NFT
    for (const nftId of nftIds) {
      const nftData = nftDataMap[nftId];
      if (nftData) {
        try {
          const redemptionValue = calculateSingleRedemption(
            nftData,
            c9Data,
            priceBounds,
            middlePrice
          );
          if (redemptionValue) {
            results[nftId] = redemptionValue;
          }
        } catch (error) {
          console.error(
            `Error calculating redemption for NFT ${nftId}:`,
            error
          );
          // Continue processing other NFTs even if one fails
        }
      }
    }

    return results;
  } catch (error) {
    if (error instanceof BaseError) {
      throw error;
    }
    console.error("Error calculating redemption values:", error);
    throw ComponentError.notC9Component(input.componentAddress);
  }
}
