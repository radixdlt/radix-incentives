import { Decimal } from "decimal.js";

const MIN_PRICE = new Decimal("0.000000000001892254");
const MAX_TICK = new Decimal("4294967295");
const TICK_SIZE = new Decimal("1.00100025");

/**
 * Calculates the tick for a given price
 * @param price The price to calculate the tick for
 * @returns The calculated tick
 */
export function calculateTick(price: Decimal): number {
  const priceDecimal = new Decimal(price);

  // Check for invalid inputs
  if (priceDecimal.lte(0)) {
    return 0;
  }

  const priceRatio = priceDecimal.div(MIN_PRICE);
  const tick = priceRatio.ln().div(TICK_SIZE.ln());
  return Math.round(tick.toNumber());
}

/**
 * Calculates the price for a given tick
 * @param tick The tick to calculate the price for
 * @returns The calculated price
 */
export function calculatePrice(tick: number): Decimal {
  return MIN_PRICE.mul(TICK_SIZE.pow(tick));
}

/**
 * Calculates the bin start tick for a given tick and bin span
 * @param tick The tick to calculate the bin start for
 * @param binSpan The bin span
 * @returns The bin start tick
 */
export function calculateBinStartTick(tick: number, binSpan: number): number {
  if (binSpan <= 0) {
    return tick;
  }
  return Math.floor(tick / binSpan) * binSpan;
}

/**
 * Calculates the fraction of a bin that is within the price bounds
 * @param binStartTick The start tick of the bin
 * @param binSpan The bin span
 * @param lowerBoundTick The lower bound tick
 * @param upperBoundTick The upper bound tick
 * @returns The fraction of the bin that is within bounds (0-1)
 */
export function calculateBinFraction(
  binStartTick: number,
  binSpan: number,
  lowerBoundTick: number,
  upperBoundTick: number
): number {
  if (binSpan <= 0) {
    return 0;
  }

  if (lowerBoundTick >= upperBoundTick) {
    return 0;
  }

  const binEndTick = binStartTick + binSpan;

  // If bin is completely outside bounds, return 0
  if (binEndTick <= lowerBoundTick || binStartTick >= upperBoundTick) {
    return 0;
  }

  // If bin is completely inside bounds, return 1
  if (binStartTick >= lowerBoundTick && binEndTick <= upperBoundTick) {
    return 1;
  }

  // Calculate partial fraction
  const effectiveStart = Math.max(binStartTick, lowerBoundTick);
  const effectiveEnd = Math.min(binEndTick, upperBoundTick);
  return (effectiveEnd - effectiveStart) / binSpan;
}
