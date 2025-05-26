import type { ProgrammaticScryptoSborValue } from "@radixdlt/babylon-gateway-api-sdk";
import { SborError, SborSchema } from "../sborSchema";

// Primitive schemas
export class BoolSchema extends SborSchema<boolean> {
  constructor() {
    super(["Bool"]);
  }

  validate(value: ProgrammaticScryptoSborValue, path: string[]): boolean {
    if (value.kind !== "Bool") {
      throw new SborError("Invalid boolean", path);
    }
    if (typeof value.value !== "boolean") {
      throw new SborError("Invalid boolean value", path);
    }
    return true;
  }

  parse(value: ProgrammaticScryptoSborValue, path: string[]): boolean {
    this.validate(value, path);
    if (value.kind !== "Bool") {
      throw new SborError("Invalid decimal", path);
    }
    return value.value;
  }
}
