import type { ProgrammaticScryptoSborValue } from "@radixdlt/babylon-gateway-api-sdk";
import { SborError, SborSchema } from "../sborSchema";

export class NonFungibleLocalIdSchema extends SborSchema<string> {
  constructor() {
    super(["NonFungibleLocalId"]);
  }

  validate(value: ProgrammaticScryptoSborValue, path: string[]): boolean {
    if (value.kind !== "NonFungibleLocalId") {
      throw new SborError("Invalid nonfungiblelocalid", path);
    }
    return true;
  }

  parse(value: ProgrammaticScryptoSborValue, path: string[]): string {
    this.validate(value, path);
    if (value.kind !== "NonFungibleLocalId") {
      throw new SborError("Invalid nonfungiblelocalid", path);
    }
    return value.value;
  }
}
