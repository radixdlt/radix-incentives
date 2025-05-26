import type { ProgrammaticScryptoSborValue } from "@radixdlt/babylon-gateway-api-sdk";
import { SborError, SborSchema } from "../sborSchema";

// Primitive schemas
export class BytesSchema extends SborSchema<string> {
  constructor() {
    super(["Bytes"]);
  }

  validate(value: ProgrammaticScryptoSborValue, path: string[]): boolean {
    if (value.kind !== "Bytes") {
      throw new SborError("Invalid bytes", path);
    }
    if (value.element_type_name !== "U8") {
      throw new SborError("Invalid bytes element type", path);
    }
    return true;
  }

  parse(value: ProgrammaticScryptoSborValue, path: string[]): string {
    this.validate(value, path);
    if (value.kind !== "Bytes") {
      throw new SborError("Invalid bytes", path);
    }
    return value.hex;
  }
}
