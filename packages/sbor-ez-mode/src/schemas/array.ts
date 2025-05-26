import type {
  ProgrammaticScryptoSborValue,
  ProgrammaticScryptoSborValueArray,
} from "@radixdlt/babylon-gateway-api-sdk";
import { SborError, SborSchema } from "../sborSchema";
import type { ParsedType } from "./struct";

export class ArraySchema<T extends SborSchema<unknown>> extends SborSchema<
  ParsedType<T>[]
> {
  private itemSchema: T;

  constructor(itemSchema: T) {
    super(["Array"]);
    this.itemSchema = itemSchema;
  }

  validate(value: ProgrammaticScryptoSborValue, path: string[]): boolean {
    if (
      !value ||
      typeof value !== "object" ||
      !("kind" in value) ||
      value.kind !== "Array"
    ) {
      throw new SborError("Invalid array structure", path);
    }

    const arrayValue = value as ProgrammaticScryptoSborValueArray;
    const items = arrayValue.elements;

    return items.every((item, index) => {
      return this.itemSchema.validate(item, [...path, index.toString()]);
    });
  }

  parse(value: ProgrammaticScryptoSborValue, path: string[]): ParsedType<T>[] {
    this.validate(value, path);
    const arrayValue = value as ProgrammaticScryptoSborValueArray;
    const items = arrayValue.elements;

    return items.map((item, index) =>
      this.itemSchema.parse(item, [...path, index.toString()])
    ) as ParsedType<T>[];
  }
}
