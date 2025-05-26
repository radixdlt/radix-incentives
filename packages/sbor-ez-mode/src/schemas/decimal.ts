import type {
  ProgrammaticScryptoSborValue,
  ProgrammaticScryptoSborValueDecimal,
  ProgrammaticScryptoSborValuePreciseDecimal,
} from "@radixdlt/babylon-gateway-api-sdk";
import { SborError, SborSchema } from "../sborSchema";

// Primitive schemas
export class DecimalSchema extends SborSchema<string> {
  constructor() {
    super(["Decimal", "PreciseDecimal"]);
  }

  validate(value: ProgrammaticScryptoSborValue, path: string[]): boolean {
    if (value.kind !== "Decimal" && value.kind !== "PreciseDecimal") {
      throw new SborError(
        "The Kind of this value is not Decimal or PreciseDecimal",
        path
      );
    }
    return true;
  }

  parse(value: ProgrammaticScryptoSborValue, path: string[]): string {
    this.validate(value, path);
    const valueDecimal = value as
      | ProgrammaticScryptoSborValueDecimal
      | ProgrammaticScryptoSborValuePreciseDecimal;
    return valueDecimal.value;
  }
}
