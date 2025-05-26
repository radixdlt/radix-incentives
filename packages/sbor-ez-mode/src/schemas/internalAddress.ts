import type { ProgrammaticScryptoSborValue } from "@radixdlt/babylon-gateway-api-sdk";
import { SborError, SborSchema } from "../sborSchema";

export class InternalAddressSchema extends SborSchema<string> {
  constructor() {
    super(["Own"]);
  }

  validate(value: ProgrammaticScryptoSborValue, path: string[]): boolean {
    if (value.kind !== "Own") {
      throw new SborError("Invalid reference", path);
    }
    if (typeof value.value !== "string") {
      throw new SborError("Invalid owned value", path);
    }
    return true;
  }

  parse(value: ProgrammaticScryptoSborValue, path: string[]): string {
    this.validate(value, path);
    if (value.kind !== "Own") {
      throw new SborError("Invalid owned value", path);
    }
    return value.value;
  }
}
