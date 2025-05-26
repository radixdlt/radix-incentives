import type {
  ProgrammaticScryptoSborValue,
  ProgrammaticScryptoSborValueI128,
  ProgrammaticScryptoSborValueI16,
  ProgrammaticScryptoSborValueI32,
  ProgrammaticScryptoSborValueI64,
  ProgrammaticScryptoSborValueI8,
  ProgrammaticScryptoSborValueU128,
  ProgrammaticScryptoSborValueU16,
  ProgrammaticScryptoSborValueU32,
  ProgrammaticScryptoSborValueU64,
  ProgrammaticScryptoSborValueU8,
} from "@radixdlt/babylon-gateway-api-sdk";
import { SborError, SborSchema } from "../sborSchema";

type ProgrammaticScryptoSborValueNumber =
  | ProgrammaticScryptoSborValueI8
  | ProgrammaticScryptoSborValueI16
  | ProgrammaticScryptoSborValueI32
  | ProgrammaticScryptoSborValueI64
  | ProgrammaticScryptoSborValueI128
  | ProgrammaticScryptoSborValueU8
  | ProgrammaticScryptoSborValueU16
  | ProgrammaticScryptoSborValueU32
  | ProgrammaticScryptoSborValueU64
  | ProgrammaticScryptoSborValueU128;

type SborKind = ProgrammaticScryptoSborValue["kind"];

// Add this new class alongside your existing schemas
export class NumberSchema extends SborSchema<number> {
  constructor() {
    const validKinds: SborKind[] = [
      "U8",
      "U16",
      "U32",
      "U64",
      "U128", // Unsigned integers
      "I8",
      "I16",
      "I32",
      "I64",
      "I128", // Signed integers
    ];
    super(validKinds);
  }

  validate(value: ProgrammaticScryptoSborValue, path: string[]): boolean {
    // Allow multiple numeric kinds

    if (!this.kinds.includes(value.kind)) {
      throw new SborError(
        `Invalid number kind. Expected one of ${this.kinds.join(", ")}, got ${value.kind}`,
        path
      );
    }

    // help typescript to know that value is a number
    const number = value as ProgrammaticScryptoSborValueNumber;

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
    const ranges = {
      U8: { min: 0n, max: 255n },
      U16: { min: 0n, max: 65535n },
      U32: { min: 0n, max: 4294967295n },
      U64: { min: 0n, max: 18446744073709551615n },
      U128: { min: 0n, max: 340282366920938463463374607431768211455n },
      I8: { min: -128n, max: 127n },
      I16: { min: -32768n, max: 32767n },
      I32: { min: -2147483648n, max: 2147483647n },
      I64: { min: -9223372036854775808n, max: 9223372036854775807n },
      I128: {
        min: -170141183460469231731687303715884105728n,
        max: 170141183460469231731687303715884105727n,
      },
    };

    const range = ranges[value.kind as keyof typeof ranges];
    if (num < range.min || num > range.max) {
      throw new SborError(
        `Number out of range for ${value.kind}. Must be between ${range.min} and ${range.max}`,
        path
      );
    }

    return true;
  }

  parse(value: ProgrammaticScryptoSborValue, path: string[]): number {
    this.validate(value, path);
    const number = value as ProgrammaticScryptoSborValueNumber;
    return Number(number.value);
  }
}
