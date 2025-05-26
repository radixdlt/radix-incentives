import type {
  ProgrammaticScryptoSborValue,
  ProgrammaticScryptoSborValueI64,
} from "@radixdlt/babylon-gateway-api-sdk";
import { SborError, SborSchema } from "../sborSchema";

// Add this new class alongside your existing schemas
export class InstantSchema extends SborSchema<Date> {
  constructor() {
    super(["I64"]);
  }

  validate(value: ProgrammaticScryptoSborValue, path: string[]): boolean {
    if (!this.kinds.includes(value.kind)) {
      throw new SborError(`Invalid number kind. Expected an I64`, path);
    }

    // help typescript to know that value is a number

    const number = value as ProgrammaticScryptoSborValueI64;

    // Validate that the value is a string representation of a number
    if (typeof number.value !== "string") {
      throw new SborError("Number value must be a string", path);
    }

    // Parse the string to verify it's a valid number
    const numStr = number.value;
    const num = BigInt(numStr); // Use BigInt to handle large numbers

    // For unsigned integers, ensure the number is non-negative
    if (value.kind.startsWith("U") && num < 0) {
      throw new SborError("Unsigned integer cannot be negative", path);
    }

    // Check range constraints based on the kind
    const range = { min: -9223372036854775808n, max: 9223372036854775807n };

    if (num < range.min || num > range.max) {
      throw new SborError(
        `Number out of range for ${value.kind}. Must be between ${range.min} and ${range.max}`,
        path
      );
    }

    return true;
  }

  parse(value: ProgrammaticScryptoSborValue, path: string[]): Date {
    this.validate(value, path);
    const number = value as ProgrammaticScryptoSborValueI64;
    // number represents a unix timestamp in seconds
    const date = new Date(Number(number.value) * 1000);
    return date;
  }
}
