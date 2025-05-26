import type {
  ProgrammaticScryptoSborValue,
  ProgrammaticScryptoSborValueTuple,
} from "@radixdlt/babylon-gateway-api-sdk";
import { SborError, SborSchema } from "../sborSchema";

// Tuple schema (acting like a struct)
export interface StructDefinition {
  [key: string]: SborSchema<unknown>;
}

export type ParsedType<T extends SborSchema<unknown>> =
  T extends SborSchema<infer U> ? U : never;

export class StructSchema<
  T extends StructDefinition,
  O extends boolean = false,
> extends SborSchema<{
  [K in keyof T]: O extends true ? ParsedType<T[K]> | null : ParsedType<T[K]>;
}> {
  private definition: T;
  private allowMissing: O;

  /**
   * @param definition The struct definition.
   * @param allowMissing If true, missing fields are allowed and parsed as `null`;
   *                     if false, missing fields will be a parsing error.
   */
  constructor(definition: T, allowMissing: O) {
    super(["Tuple"]);
    this.definition = definition;
    this.allowMissing = allowMissing;
  }

  validate(value: ProgrammaticScryptoSborValue, path: string[]): boolean {
    if (
      !value ||
      typeof value !== "object" ||
      !("kind" in value) ||
      value.kind !== "Tuple"
    ) {
      throw new SborError("Invalid tuple structure", path);
    }

    const tupleValue = value as ProgrammaticScryptoSborValueTuple;
    const fields = tupleValue.fields;
    const definedFields = Object.keys(this.definition);

    // If missing fields are not allowed, check for their existence.
    if (!this.allowMissing) {
      const fieldNames = fields.map((f) => f.field_name).filter(Boolean);
      const missingFields = definedFields.filter(
        (name) => !fieldNames.includes(name)
      );
      if (missingFields.length > 0) {
        throw new SborError(
          `Missing required fields: ${missingFields.join(", ")}`,
          path
        );
      }
    }

    // Validate each field if present.
    for (const name of definedFields) {
      const field = fields.find((f) => f.field_name === name);
      if (!field) {
        if (!this.allowMissing) {
          throw new SborError(`Missing field: ${name}`, [...path, name]);
        }
        // If allowMissing is true, skip further validation.
        continue;
      }

      const schema = this.definition[name];
      if (!schema) {
        throw new SborError(`Schema not found for field ${name}`, [
          ...path,
          name,
        ]);
      }
      if (!schema.kinds.includes(field.kind)) {
        throw new SborError(
          `Expected kind ${schema.kinds} for field ${name}, got ${field.kind}`,
          [...path, name]
        );
      }
      schema.validate(field, [...path, name]);
    }

    return true;
  }

  parse(
    value: ProgrammaticScryptoSborValue,
    path: string[]
  ): {
    [K in keyof T]: O extends true ? ParsedType<T[K]> | null : ParsedType<T[K]>;
  } {
    this.validate(value, path);
    const tupleValue = value as ProgrammaticScryptoSborValueTuple;
    const fields = tupleValue.fields;
    const result: Partial<{ [K in keyof T]: ParsedType<T[K]> | null }> = {};

    for (const [name, schema] of Object.entries(this.definition)) {
      if (!schema) {
        throw new SborError(`Schema not found for field ${name}`, [
          ...path,
          name,
        ]);
      }
      const field = fields.find((f) => f.field_name === name);
      if (field) {
        result[name as keyof T] = schema.parse(field, [
          ...path,
          name,
        ]) as ParsedType<T[typeof name]>;
      } else {
        // Only assign null if allowMissing is true.
        result[name as keyof T] = null;
      }
    }

    return result as {
      [K in keyof T]: O extends true
        ? ParsedType<T[K]> | null
        : ParsedType<T[K]>;
    };
  }
}
