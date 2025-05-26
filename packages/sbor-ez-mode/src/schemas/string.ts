import type { ProgrammaticScryptoSborValue } from "@radixdlt/babylon-gateway-api-sdk";
import { SborError, SborSchema } from "../sborSchema";

export class StringSchema extends SborSchema<string> {
  constructor() {
    super(["String"]);
  }

  validate(value: ProgrammaticScryptoSborValue, path: string[]): boolean {
    if (value.kind !== "String" || typeof value.value !== "string") {
      throw new SborError("Invalid string", path);
    }
    return true;
  }

  parse(value: ProgrammaticScryptoSborValue, path: string[]): string {
    this.validate(value, path);
    if (value.kind !== "String") {
      throw new SborError("Invalid string", path);
    }
    return value.value;
  }
}
