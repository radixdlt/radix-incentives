import type {
  ProgrammaticScryptoSborValue,
  ProgrammaticScryptoSborValueEnum,
  ProgrammaticScryptoSborValueTuple,
} from "@radixdlt/babylon-gateway-api-sdk";
import { SborError, SborSchema } from "../sborSchema";
import type { ParsedType, StructSchema } from "./struct"; // Assuming you have this from your previous code
import type { OrderedTupleSchema } from "./orderedTuple"; // Assuming you have this from your previous code

export interface VariantDefinition<
  S extends StructSchema<any, any> | OrderedTupleSchema<any>,
> {
  variant: string;
  schema: S;
}

// Helper types to extract parsed and output types from variant schemas
type VariantParsedType<T extends VariantDefinition<any>> =
  T["schema"] extends StructSchema<infer U, any>
    ? { [K in keyof U]: ParsedType<U[K]> }
    : T["schema"] extends OrderedTupleSchema<infer U>
      ? { [K in keyof U]: ParsedType<U[K]> }
      : never;

export type EnumParsedType<T extends VariantDefinition<any>[]> = {
  [K in keyof T]: T[K] extends VariantDefinition<infer S>
    ? S extends StructSchema<any, any>
      ? {
          variant: T[K]["variant"];
          value: VariantParsedType<T[K]>;
        }
      : S extends OrderedTupleSchema<any>
        ? { variant: T[K]["variant"]; value: VariantParsedType<T[K]> }
        : never
    : never;
}[number];

export class EnumSchema<T extends VariantDefinition<any>[]> extends SborSchema<
  {
    [K in keyof T]: T[K] extends VariantDefinition<any>
      ? { variant: T[K]["variant"]; value: VariantParsedType<T[K]> }
      : never;
  }[number]
> {
  private variants: Map<string, VariantDefinition<any>>;

  constructor(variants: T) {
    super(["Enum"]);
    this.variants = new Map(variants.map((v) => [v.variant, v]));
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

    // Validate variant exists
    const variantName = enumValue.variant_name;
    if (!variantName || !this.variants.has(variantName)) {
      throw new SborError(
        `Unknown variant: ${variantName || "undefined"}`,
        path
      );
    }

    const variantDef = this.variants.get(variantName)!;

    // If the variant has no schema (empty variant), fields should be empty
    if (!variantDef.schema) {
      if (enumValue.fields.length > 0) {
        throw new SborError(
          `Empty variant ${variantName} should have no fields`,
          path
        );
      }
      return true;
    }

    // Validate the variant's contents using its schema
    const tupleValue: ProgrammaticScryptoSborValueTuple = {
      kind: "Tuple",
      fields: enumValue.fields,
      field_name: enumValue.field_name,
      type_name: enumValue.type_name,
    };
    return variantDef.schema.validate(tupleValue, [...path, variantName]);
  }

  parse(
    value: ProgrammaticScryptoSborValue,
    path: string[]
  ): EnumParsedType<T> {
    this.validate(value, path);
    const enumValue = value as ProgrammaticScryptoSborValueEnum;
    const variantName = enumValue.variant_name!;
    const variantDef = this.variants.get(variantName)!;

    // Empty variant
    if (!variantDef.schema) {
      return { variant: variantName } as EnumParsedType<T>;
    }

    // Parse variant with contents
    const tupleValue: ProgrammaticScryptoSborValueTuple = {
      kind: "Tuple",
      fields: enumValue.fields,
      field_name: enumValue.field_name,
      type_name: enumValue.type_name,
    };
    return {
      variant: variantName,
      value: variantDef.schema.parse(tupleValue, [...path, variantName]),
    } as EnumParsedType<T>;
  }
}
