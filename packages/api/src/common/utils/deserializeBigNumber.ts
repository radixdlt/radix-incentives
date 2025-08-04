import { BigNumber } from "bignumber.js";

/**
 * Deserializes a BigNumber from its internal JSON representation
 * @param value - Object with {s, e, c} properties or a BigNumber-compatible value
 * @returns BigNumber instance
 */
export function deserializeBigNumber(
  value: { s: number; e: number; c: number[] } | string | number | BigNumber
): BigNumber {
  // If it's already a BigNumber, return it
  if (BigNumber.isBigNumber(value)) {
    return value;
  }

  // If it's a primitive type, use the constructor directly
  if (typeof value === "string" || typeof value === "number") {
    return new BigNumber(value);
  }

  // Handle the {s, e, c} format
  if (
    typeof value === "object" &&
    value !== null &&
    "s" in value &&
    "e" in value &&
    "c" in value
  ) {
    // Create a new BigNumber instance and directly assign the internal properties
    // This is the most reliable way to reconstruct from the internal format
    const bn = new BigNumber(0);
    
    // Override the internal properties
    // @ts-expect-error Accessing private properties for reconstruction
    bn.s = value.s;
    // @ts-expect-error Accessing private properties for reconstruction
    bn.e = value.e;
    // @ts-expect-error Accessing private properties for reconstruction
    bn.c = value.c.slice(); // Copy the coefficient array
    
    // Return the reconstructed BigNumber
    return bn;
  }

  throw new Error("Invalid BigNumber format");
}

/**
 * Type guard to check if a value is in BigNumber JSON format
 */
export function isBigNumberJSON(
  value: unknown
): value is { s: number; e: number; c: number[] } {
  return (
    typeof value === "object" &&
    value !== null &&
    "s" in value &&
    "e" in value &&
    "c" in value &&
    typeof value.s === "number" &&
    typeof value.e === "number" &&
    Array.isArray(value.c) &&
    value.c.every((n) => typeof n === "number")
  );
}