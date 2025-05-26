import type { SborSchema } from "./sborSchema";
import { ArraySchema } from "./schemas/array";
import { BoolSchema } from "./schemas/bool";
import { DecimalSchema } from "./schemas/decimal";
import { NumberSchema } from "./schemas/number";
import { OrderedTupleSchema, type TupleSchema } from "./schemas/orderedTuple";
import { AddressSchema } from "./schemas/address";
import { StringSchema } from "./schemas/string";
import { type StructDefinition, StructSchema } from "./schemas/struct";
import { ValueSchema } from "./schemas/value";
import { EnumSchema, type VariantDefinition } from "./schemas/enum"; // Add this import
import { NonFungibleLocalIdSchema } from "./schemas/nonfungiblelocalid";
import { type MapDefinition, MapSchema } from "./schemas/map";
import { InternalAddressSchema } from "./schemas/internalAddress";
import { InstantSchema } from "./schemas/instant";
import { OptionSchema } from "./schemas/option";

/**
 * The main object through which to build schemas for parsing SBOR values.
 * This object contains methods for creating schemas for all the different types of values that can be parsed.
 * @example
 * ```ts
 * import { s } from '@calamari-radix/gateway-ez-mode';
 * const myStructSchema = s.struct({
 *   bing: s.string(),
 *   bong: s.number(),
 *   foo: s.struct({ bar: s.string() }),
 * });
 * ```
 *
 * Parsing can be done using the returned schema:
 * ```ts
 * const parsed = myStructSchema.safeParse(myProgrammaticScryptoSborValue);
 * ```
 */
export const s = {
  /**
   * Essentially a no-op, this schema will return the raw ProgrammaticScryptoSborValue
   * Handy as fallback in case you can't parse your value for some reason.
   * @returns ValueSchema
   */
  value: () => new ValueSchema(),
  /**
   * A shema for any decimal, such as Decimal or PreciseDecimal
   * @returns DecimalSchema
   */
  decimal: () => new DecimalSchema(),
  /**
   * A schema for a String
   * @returns StringSchema
   */
  string: () => new StringSchema(),
  /**
   * A schema for a Bool
   * @returns BoolSchema
   */
  bool: () => new BoolSchema(),
  /**
   * A schema for a NonFungibleLocalId
   * @returns NonFungibleLocalIdSchema
   */
  nonFungibleLocalId: () => new NonFungibleLocalIdSchema(),
  /**
   * A schema for a Number
   * @returns NumberSchema
   */
  number: () => new NumberSchema(),
  /**
   * A schema for an Instant. This will parse the instant directly into a Date object
   * @returns InstantSchema
   */
  instant: () => new InstantSchema(),
  /**
   * A schema for a Referenced Address, such as a global account, component, or resource address
   * @returns AddressSchema
   */
  address: () => new AddressSchema(),
  /**
   * A schema for an Internal (owned) Address, such as a Vault or KeyValueStore
   * @returns InternalAddressSchema
   */
  internalAddress: () => new InternalAddressSchema(),
  /**
   * A schema for a Struct
   * @param definition The struct definition, which is an object of schemas that describes the fields of the struct
   * @returns StructSchema
   * @example
   * ```ts
   * const myStructSchema = s.struct({
   *    bing: s.string(),
   *    bong: s.number(),
   *    foo: s.struct({ bar: s.string() }),
   * });
   * ```
   */
  struct: <T extends StructDefinition>(definition: T) =>
    new StructSchema(definition, false),
  /**
   * A schema for a struct, where missing fields are allowed and parsed as `null`.
   * This is useful for when you don't know exactly what fields will be present in the struct.
   * @param definition The struct definition, which is an object of schemas that describes the fields of the struct
   * @returns StructSchema
   *
   * @example
   * ```ts
   * const myStructSchema = s.structNullable({
   *   bing: s.string(),
   *   bong: s.number(),
   *   foo: s.number(),
   * });
   * ```
   * Parsing a struct that doesn't have 'foo' will give back:
   * ```json
   * {
   *  bing: "hello",
   *  bong: 123,
   *  foo: null
   * }
   * ```
   */
  structNullable: <T extends StructDefinition>(definition: T) =>
    new StructSchema(definition, true),
  // structNullable: <T extends StructDefinition>(definition: T) =>
  //     new StructSchema(definition, true),
  /**
   * A schema for an Ordered Tuple. The SBOR kind of "Tuple" is shared between Rust structs and tupled, so
   * we explicitly call this an OrderedTuple to avoid confusion.
   * @param schemas An array of schemas that describe the fields of the tuple
   * @returns OrderedTupleSchema
   * @example
   * ```ts
   * const myTupleSchema = s.orderedTuple([s.string(), s.number()]);
   * const myNestedTupleSchema = s.orderedTuple([s.string(), s.orderedTuple([s.number(), s.string()])]);
   * const structInTupleSchema = s.orderedTuple([s.struct({ foo: s.string() }), s.number()]);
   * ```
   */
  tuple: <const T extends SborSchema<unknown>[]>(schemas: T) =>
    new OrderedTupleSchema(schemas),
  /**
   * A schema for an Array
   * @param schema The schema that describes the elements of the array
   * @returns ArraySchema
   * @example
   * ```ts
   * const myArraySchema = s.array(s.string());
   * const myNestedArraySchema = s.array(s.array(s.number()));
   * ```
   */
  array: <T>(schema: SborSchema<T>) => new ArraySchema(schema),
  /**
   * A schema for an Enum
   * @param variants An array of variant definitions, which are objects with a string variant name and a schema.
   * The schema passed as "value" must be either a StructSchema or an OrderedTupleSchema. This has to do with
   * the fact that Rust represents enum values either with struct syntax or tuple syntax.
   * @returns EnumSchema
   * @example
   * ```ts
   * const myEnumSchema = s.enum([
   *     {
   *         variant: 'NonFungible',
   *         schema: s.struct({
   *             ids: s.array(s.nonFungibleLocalId()),
   *             resource_address: s.address(),
   *         }),
   *     },
   *     { variant: 'Fungible', schema: s.tuple([s.decimal()]) },
   * ]);
   * ```
   * Parsing a NonFungible will give back:
   * ```json
   * {
   *   variant: 'NonFungible',
   *   value: {
   *     ids: ["#1#", "#2#"],
   *     resource_address: "resource_rdx...."
   *   }
   * }
   * ```
   * Parsing a Fungible will give back:
   * ```json
   * {
   *   variant: 'Fungible',
   *   value: ["12345"]
   * }
   */
  enum: <
    const VARIANT_DEF extends VariantDefinition<S>[],
    S extends StructSchema<D, B> | OrderedTupleSchema<T>,
    T extends TupleSchema,
    D extends StructDefinition,
    B extends boolean,
  >(
    variants: VARIANT_DEF
  ): EnumSchema<VARIANT_DEF> => new EnumSchema(variants),
  /**
   * A utility schema for the Option enum in Rust. This is a common pattern in Rust to represent
   * nullable values. The Option schema takes a single schema as an argument, which describes the
   * type of the value inside the Option.
   * @param schema The schema that describes the type of the value inside the Option
   * @returns OptionSchema
   */
  option: <T>(schema: SborSchema<T>) => new OptionSchema(schema),
  /**
   * A schema for a Map
   * @param definition A definition that describes the type of the values in the map
   * @returns MapSchema
   * @example
   * ```ts
   * const myMapSchema = s.map({ key: s.string(), value: s.number() });
   * ```
   * Parsing a map will give back an Map object with the keys and values parsed according to the schema.
   */
  map: <K, V>(definition: MapDefinition<K, V>) =>
    new MapSchema<K, V>(definition),
};

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace s {
  /**
   * A utility type that extracts the parsed type from a schema.
   * @example
   * ```ts
   * const myStructSchema = s.struct({
   *   bing: s.string(),
   *   bong: s.number(),
   *   foo: s.struct({ bar: s.string() }),
   * });
   * type MyStruct = s.infer<typeof myStructSchema>;
   * ```
   */
  export type infer<T extends SborSchema<any>> =
    T extends SborSchema<infer R> ? R : never;
}
