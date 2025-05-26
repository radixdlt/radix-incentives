import type { ProgrammaticScryptoSborValue } from "@radixdlt/babylon-gateway-api-sdk";
import { kinds, SborSchema } from "../sborSchema";

// Primitive schemas
export class ValueSchema extends SborSchema<ProgrammaticScryptoSborValue> {
  constructor() {
    super(kinds);
  }

  validate(): boolean {
    return true;
  }

  parse(value: ProgrammaticScryptoSborValue): ProgrammaticScryptoSborValue {
    return value;
  }
}
