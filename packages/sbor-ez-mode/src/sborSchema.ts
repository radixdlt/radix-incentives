import type { ProgrammaticScryptoSborValue } from "@radixdlt/babylon-gateway-api-sdk";
import { err, ok, type Result } from "neverthrow";

// Schema and parsing errors
export class SborError extends Error {
  constructor(
    message: string,
    public readonly path: string[] = []
  ) {
    super(message);
  }
}
export const kinds: [
  "Bool",
  "I8",
  "I16",
  "I32",
  "I64",
  "I128",
  "U8",
  "U16",
  "U32",
  "U64",
  "U128",
  "String",
  "Enum",
  "Array",
  "Bytes",
  "Map",
  "Tuple",
  "Reference",
  "Own",
  "Decimal",
  "PreciseDecimal",
  "NonFungibleLocalId",
] = [
  "Bool",
  "I8",
  "I16",
  "I32",
  "I64",
  "I128",
  "U8",
  "U16",
  "U32",
  "U64",
  "U128",
  "String",
  "Enum",
  "Array",
  "Bytes",
  "Map",
  "Tuple",
  "Reference",
  "Own",
  "Decimal",
  "PreciseDecimal",
  "NonFungibleLocalId",
];

export type SborKind = ProgrammaticScryptoSborValue["kind"];
// Base schema class
export abstract class SborSchema<T> {
  readonly kinds: SborKind[];

  constructor(kinds: SborKind[]) {
    this.kinds = kinds;
  }

  abstract validate(
    value: ProgrammaticScryptoSborValue,
    path: string[]
  ): boolean;

  abstract parse(value: ProgrammaticScryptoSborValue, path: string[]): T;

  safeParse(value: ProgrammaticScryptoSborValue): Result<T, SborError> {
    try {
      const data = this.parse(value, []);
      return ok(data);
    } catch (error) {
      if (error instanceof SborError) {
        return err(error);
      }
      throw error;
    }
  }
}
