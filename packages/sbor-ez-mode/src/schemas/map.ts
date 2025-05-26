import type {
  ProgrammaticScryptoSborValue,
  ProgrammaticScryptoSborValueMap,
} from "@radixdlt/babylon-gateway-api-sdk";
import { SborError, SborSchema } from "../sborSchema";

export interface MapDefinition<T, U> {
  key: SborSchema<T>;
  value: SborSchema<U>;
}

export class MapSchema<K, V> extends SborSchema<Map<K, V>> {
  private definition: MapDefinition<K, V>;

  constructor(definition: MapDefinition<K, V>) {
    super(["Map"]);
    this.definition = definition;
  }

  validate(value: ProgrammaticScryptoSborValue, path: string[]): boolean {
    if (
      !value ||
      typeof value !== "object" ||
      !("kind" in value) ||
      value.kind !== "Map"
    ) {
      throw new SborError("Invalid map structure", path);
    }

    const entries = value.entries;

    return entries.every((entry, index) => {
      if (!entry.key || !entry.value) {
        throw new SborError("Invalid map entry", [...path, index.toString()]);
      }

      return (
        this.definition.key.validate(entry.key, [...path, index.toString()]) &&
        this.definition.value.validate(entry.value, [...path, index.toString()])
      );
    });
  }

  parse(value: ProgrammaticScryptoSborValue, path: string[]): Map<K, V> {
    this.validate(value, path);
    const mapValue = value as ProgrammaticScryptoSborValueMap;
    const entries = mapValue.entries;

    return new Map<K, V>(
      entries.map((entry, index) => [
        this.definition.key.parse(entry.key, [...path, index.toString()]),
        this.definition.value.parse(entry.value, [...path, index.toString()]),
      ])
    );
  }
}
