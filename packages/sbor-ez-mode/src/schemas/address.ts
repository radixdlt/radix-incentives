import type { ProgrammaticScryptoSborValue } from "@radixdlt/babylon-gateway-api-sdk";
import { SborError, SborSchema } from "../sborSchema";

export class AddressSchema extends SborSchema<string> {
  constructor() {
    super(["Reference"]);
  }

  validate(value: ProgrammaticScryptoSborValue, path: string[]): boolean {
    if (value.kind !== "Reference") {
      throw new SborError("Invalid reference", path);
    }
    if (typeof value.value !== "string") {
      throw new SborError("Invalid resource address", path);
    }
    return true;
  }

  parse(value: ProgrammaticScryptoSborValue, path: string[]): string {
    this.validate(value, path);
    if (value.kind !== "Reference") {
      throw new SborError("Invalid reference", path);
    }
    return value.value;
  }
}
