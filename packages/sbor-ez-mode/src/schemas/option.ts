import type {
  ProgrammaticScryptoSborValue,
  ProgrammaticScryptoSborValueEnum,
} from "@radixdlt/babylon-gateway-api-sdk";
import { SborError, SborSchema } from "../sborSchema";

export class OptionSchema<T extends SborSchema<unknown>> extends SborSchema<
  | {
      variant: "Some";
      value: T extends SborSchema<infer O> ? O : never;
    }
  | {
      variant: "None";
    }
> {
  private innerSchema: T;

  constructor(innerSchema: T) {
    super(["Enum"]);
    this.innerSchema = innerSchema;
  }
  validate(value: ProgrammaticScryptoSborValue, path: string[]): boolean {
    if (
      !value ||
      typeof value !== "object" ||
      !("kind" in value) ||
      value.kind !== "Enum"
    ) {
      throw new SborError("Invalid enum structure", path);
    }

    const enumValue = value as ProgrammaticScryptoSborValueEnum;
    if (enumValue.variant_name === "None") {
      if (enumValue.fields.length !== 0) {
        throw new SborError("Invalid enum None variant", path);
      }
      return true;
      // biome-ignore lint/style/noUselessElse: <explanation>
    } else {
      if (enumValue.variant_name !== "Some") {
        throw new SborError("Invalid enum variant", path);
      }
      if (enumValue.fields.length !== 1) {
        throw new SborError("Invalid enum Some variant", path);
      }
      const field = enumValue.fields[0];
      if (!field) {
        throw new SborError("Missing field in Some variant", path);
      }
      return this.innerSchema.validate(field, path);
    }
  }

  parse(
    value: ProgrammaticScryptoSborValue,
    path: string[]
  ):
    | {
        variant: "Some";
        value: T extends SborSchema<infer O> ? O : never;
      }
    | {
        variant: "None";
      } {
    this.validate(value, path);
    const enumValue = value as ProgrammaticScryptoSborValueEnum;
    if (enumValue.variant_name === "None") {
      return { variant: "None" };
    }
    const field = enumValue.fields[0];
    if (!field) {
      throw new SborError("Missing field in Some variant", path);
    }
    return {
      variant: "Some",
      value: this.innerSchema.parse(field, path) as T extends SborSchema<
        infer O
      >
        ? O
        : never,
    };
  }
}
