import type {
  ProgrammaticScryptoSborValue,
  ProgrammaticScryptoSborValueTuple,
} from "@radixdlt/babylon-gateway-api-sdk";
import { SborError, SborSchema } from "../sborSchema";

export type TupleSchema = SborSchema<unknown>[];

export class OrderedTupleSchema<T extends TupleSchema> extends SborSchema<{
  [K in keyof T]: T[K] extends SborSchema<infer U> ? U : never;
}> {
  private schemas: T;

  constructor(schemas: T) {
    super(["Tuple"]);
    this.schemas = schemas;
  }

  validate(value: ProgrammaticScryptoSborValue, path: string[]): boolean {
    if (
      !value ||
      typeof value !== "object" ||
      !("kind" in value) ||
      value.kind !== "Tuple"
    ) {
      throw new SborError("The object is not a tuple", path);
    }

    const tupleValue = value as ProgrammaticScryptoSborValueTuple;
    const fields = tupleValue.fields;

    if (fields.length !== this.schemas.length) {
      throw new SborError(
        `Expected ${this.schemas.length} fields, got ${fields.length}`,
        path
      );
    }

    return this.schemas.every((schema, index) => {
      const field = fields[index];
      if (!field) return false;
      if (!schema) {
        throw new SborError(`Schema not found for field at index ${index}`, [
          ...path,
          index.toString(),
        ]);
      }

      if (!schema.kinds.includes(field.kind)) {
        throw new SborError(
          `Expected kind ${schema.kinds}, got ${field.kind}`,
          [...path, index.toString()]
        );
      }

      return schema.validate(field, [...path, index.toString()]);
    });
  }

  parse(
    value: ProgrammaticScryptoSborValue,
    path: string[]
  ): {
    [K in keyof T]: T[K] extends SborSchema<infer U> ? U : never;
  } {
    this.validate(value, path);
    const tupleValue = value as ProgrammaticScryptoSborValueTuple;
    const fields = tupleValue.fields;

    return fields.map((field, index) => {
      const schema = this.schemas[index];
      if (!schema) {
        throw new SborError(`Schema not found for field at index ${index}`, [
          ...path,
          index.toString(),
        ]);
      }
      return schema.parse(field, [...path, index.toString()]);
    }) as {
      [K in keyof T]: T[K] extends SborSchema<infer U> ? U : never;
    };
  }
}
