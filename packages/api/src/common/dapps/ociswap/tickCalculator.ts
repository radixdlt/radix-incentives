import { Decimal } from "decimal.js";

// Configure Decimal.js for high precision
Decimal.config({ precision: 50 });

export const TICK_BASE_SQRT = new Decimal(
  "1.000049998750062496094023416993798697"
);

export function tickToPriceSqrt(tick: number): Decimal {
  return TICK_BASE_SQRT.pow(tick);
}

export function floorToDecimals(value: Decimal, divisibility: number): Decimal {
  const decimalPlaces = Math.max(0, divisibility);
  return value.toDecimalPlaces(decimalPlaces, Decimal.ROUND_DOWN);
}

export function removableAmounts(
  liquidity: Decimal,
  priceSqrt: Decimal,
  priceLeftBoundSqrt: Decimal,
  priceRightBoundSqrt: Decimal,
  xDivisibility: number,
  yDivisibility: number
): [Decimal, Decimal] {
  // When the current price is below the lower bound, all liquidity can be withdrawn as token x.
  if (priceSqrt.lte(priceLeftBoundSqrt)) {
    const xAmount = Decimal.max(
      liquidity.div(priceLeftBoundSqrt).sub(liquidity.div(priceRightBoundSqrt)),
      new Decimal(0)
    );
    return [floorToDecimals(xAmount, xDivisibility), new Decimal(0)];
  }

  // When the current price is above the upper bound, all liquidity can be withdrawn as token y.
  if (priceSqrt.gte(priceRightBoundSqrt)) {
    const yAmount = liquidity.mul(priceRightBoundSqrt.sub(priceLeftBoundSqrt));
    return [new Decimal(0), floorToDecimals(yAmount, yDivisibility)];
  }

  // When the current price is within the bounds, calculate the withdrawable amounts for both tokens.
  const xAmount = Decimal.max(
    liquidity.div(priceSqrt).sub(liquidity.div(priceRightBoundSqrt)),
    new Decimal(0)
  );
  const yAmount = liquidity.mul(priceSqrt.sub(priceLeftBoundSqrt));

  return [
    floorToDecimals(xAmount, xDivisibility),
    floorToDecimals(yAmount, yDivisibility),
  ];
}
