import { describe, expect, expectTypeOf, it } from 'vitest';
import { s } from './factory';
import { ProgrammaticScryptoSborValue } from '@radixdlt/babylon-gateway-api-sdk';
import { SborError, SborSchema } from './sborSchema';
import { Result } from 'neverthrow';

function evaluateResultHelper<T, E>(
    schema: SborSchema<T>,
    example: ProgrammaticScryptoSborValue,
    expectedParsedValue: E
): T {
    const result = schema.safeParse(example);
    if (result.isOk()) {
        expect(result.value).toEqual(expectedParsedValue);
        return result.value;
    } else {
        console.error(result.error);
        throw new Error('Failed to parse');
    }
}

describe('sbor', () => {
    it('parse a complex structure', () => {
        const example: ProgrammaticScryptoSborValue = {
            fields: [
                {
                    element_kind: 'Tuple',
                    elements: [
                        {
                            fields: [
                                {
                                    value: 'XRP/USD',
                                    kind: 'String',
                                },
                                {
                                    fields: [
                                        {
                                            value: '4.182833800936179164',
                                            kind: 'Decimal',
                                            field_name: 'oi_long',
                                        },
                                        {
                                            value: '3.628419587417141536',
                                            kind: 'Decimal',
                                            field_name: 'oi_short',
                                        },
                                        {
                                            value: '1.370474241159020676',
                                            kind: 'Decimal',
                                            field_name: 'cost',
                                        },
                                        {
                                            value: '1.222607230209630933',
                                            kind: 'Decimal',
                                            field_name: 'skew_abs_snap',
                                        },
                                        {
                                            value: '0.147867010949389743',
                                            kind: 'Decimal',
                                            field_name: 'pnl_snap',
                                        },
                                        {
                                            value: '-6.209391626742886295',
                                            kind: 'Decimal',
                                            field_name: 'funding_2_rate',
                                        },
                                        {
                                            value: '-11043086051690144.381798536004162019',
                                            kind: 'Decimal',
                                            field_name: 'funding_long_index',
                                        },
                                        {
                                            value: '-12.721663589564077452',
                                            kind: 'Decimal',
                                            field_name: 'funding_short_index',
                                        },
                                        {
                                            value: '1741797196',
                                            kind: 'I64',
                                            type_name: 'Instant',
                                            field_name: 'last_update',
                                        },
                                        {
                                            value: '2.20522346',
                                            kind: 'Decimal',
                                            field_name: 'last_price',
                                        },
                                    ],
                                    kind: 'Tuple',
                                    type_name: 'PoolPosition',
                                },
                            ],
                            kind: 'Tuple',
                        },
                    ],
                    kind: 'Array',
                    field_name: 'updates',
                },
            ],
            kind: 'Tuple',
            type_name: 'EventPairUpdates',
        };

        const schema = s.struct({
            updates: s.array(
                s.tuple([
                    s.string(),
                    s.struct({
                        oi_long: s.decimal(),
                        oi_short: s.decimal(),
                        cost: s.decimal(),
                        skew_abs_snap: s.decimal(),
                        pnl_snap: s.decimal(),
                        funding_2_rate: s.decimal(),
                        funding_long_index: s.decimal(),
                        last_update: s.number(),
                    }),
                ])
            ),
        });

        const parsed = {
            updates: [
                [
                    'XRP/USD',
                    {
                        oi_long: '4.182833800936179164',
                        oi_short: '3.628419587417141536',
                        cost: '1.370474241159020676',
                        skew_abs_snap: '1.222607230209630933',
                        pnl_snap: '0.147867010949389743',
                        funding_2_rate: '-6.209391626742886295',
                        funding_long_index:
                            '-11043086051690144.381798536004162019',
                        last_update: 1741797196,
                    },
                ],
            ],
        };

        type expectedType = {
            updates: [
                string,
                {
                    oi_long: string;
                    oi_short: string;
                    cost: string;
                    skew_abs_snap: string;
                    pnl_snap: string;
                    funding_2_rate: string;
                    funding_long_index: string;
                    last_update: number;
                },
            ][];
        };

        const result = evaluateResultHelper(schema, example, parsed);

        expectTypeOf(result).toEqualTypeOf<expectedType>();
    });

    it('parse a struct', () => {
        const example: ProgrammaticScryptoSborValue = {
            fields: [
                {
                    value: 'resource_rdx1t5pyvlaas0ljxy0wytm5gvyamyv896m69njqdmm2stukr3xexc2up9',
                    kind: 'Reference',
                    type_name: 'ResourceAddress',
                    field_name: 'input_address',
                },
                {
                    value: '0.003427947474666592',
                    kind: 'Decimal',
                    field_name: 'input_amount',
                },
                {
                    value: 'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
                    kind: 'Reference',
                    type_name: 'ResourceAddress',
                    field_name: 'output_address',
                },
                {
                    value: '522.23800528105807128',
                    kind: 'Decimal',
                    field_name: 'output_amount',
                },
                {
                    field_name: 'is_success',
                    kind: 'Bool',
                    value: true,
                },
            ],
            kind: 'Tuple',
            type_name: 'SwapEvent',
        };

        const swapEventSchema = s.struct({
            input_address: s.address(),
            input_amount: s.decimal(),
            output_address: s.address(),
            output_amount: s.decimal(),
            is_success: s.bool(),
        });

        const parsed = {
            input_address:
                'resource_rdx1t5pyvlaas0ljxy0wytm5gvyamyv896m69njqdmm2stukr3xexc2up9',
            input_amount: '0.003427947474666592',
            output_address:
                'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
            output_amount: '522.23800528105807128',
            is_success: true,
        };
        const result = evaluateResultHelper(swapEventSchema, example, parsed);

        type resultType = {
            input_address: string;
            input_amount: string;
            output_address: string;
            output_amount: string;
            is_success: boolean;
        };
        expectTypeOf(result).toEqualTypeOf<resultType>();

        // infer the result using s.infer
        type inferredResultType = s.infer<typeof swapEventSchema>;
        // check whether the inferred result is the same as the expected result
        expectTypeOf<resultType>().toEqualTypeOf<inferredResultType>();
    });

    it('parse a nullable struct', () => {
        const example: ProgrammaticScryptoSborValue = {
            kind: 'Tuple',
            fields: [
                {
                    kind: 'String',
                    value: 'boing',
                    field_name: 'foo',
                },
                {
                    kind: 'String',
                    value: 'boing',
                    field_name: 'bar',
                },
            ],
        };

        const parsed = {
            foo: 'boing',
            bar: 'boing',
            boing: null,
        };

        const schema = s.structNullable({
            foo: s.string(),
            bar: s.string(),
            // boing is not really a part of the
            // type we're parsing, so it should be null
            boing: s.string(),
        });

        type expectedType = {
            foo: string | null;
            bar: string | null;
            boing: string | null;
        };

        const result = evaluateResultHelper(schema, example, parsed);

        expectTypeOf(result).toEqualTypeOf<expectedType>();
    });

    it('parse a nullable struct where the value is present', () => {
        const example: ProgrammaticScryptoSborValue = {
            kind: 'Tuple',
            fields: [
                {
                    kind: 'String',
                    value: 'boing',
                    field_name: 'foo',
                },
                {
                    kind: 'String',
                    value: 'boing',
                    field_name: 'bar',
                },
                {
                    kind: 'String',
                    value: 'boing',
                    field_name: 'boing',
                },
            ],
        };

        const parsed = {
            foo: 'boing',
            bar: 'boing',
            boing: 'boing',
        };

        const schema = s.structNullable({
            foo: s.string(),
            bar: s.string(),
            // this time, boing is present,
            // so it should be parsed as a string and not null
            boing: s.string(),
        });

        type expectedType = {
            foo: string | null;
            bar: string | null;
            boing: string | null;
        };

        const result = evaluateResultHelper(schema, example, parsed);

        expectTypeOf(result).toEqualTypeOf<expectedType>();
    });

    it('parse an enum', () => {
        const boingEvents: ProgrammaticScryptoSborValue[] = [
            {
                kind: 'Enum',
                type_name: 'BoingEvent',
                variant_id: '0',
                variant_name: 'Empty',
                fields: [],
            },
            {
                kind: 'Enum',
                type_name: 'BoingEvent',
                variant_id: '1',
                variant_name: 'StructBased',
                fields: [
                    {
                        kind: 'String',
                        field_name: 'name',
                        value: 'daan',
                    },
                ],
            },
            {
                kind: 'Enum',
                type_name: 'BoingEvent',
                variant_id: '2',
                variant_name: 'StructBasedEmpty',
                fields: [],
            },
            {
                kind: 'Enum',
                type_name: 'BoingEvent',
                variant_id: '3',
                variant_name: 'TupleBased',
                fields: [
                    {
                        kind: 'String',
                        value: 'daan',
                    },
                ],
            },
            {
                kind: 'Enum',
                type_name: 'BoingEvent',
                variant_id: '4',
                variant_name: 'TupleBasedTwoVals',
                fields: [
                    {
                        kind: 'String',
                        value: 'daan',
                    },
                    {
                        kind: 'U32',
                        value: '5',
                    },
                ],
            },
            {
                kind: 'Enum',
                type_name: 'BoingEvent',
                variant_id: '5',
                variant_name: 'TupleBasedEmpty',
                fields: [],
            },
            {
                kind: 'Enum',
                type_name: 'BoingEvent',
                variant_id: '6',
                variant_name: 'ContainsOption',
                fields: [
                    {
                        field_name: 'option',
                        kind: 'Enum',
                        type_name: 'Option',
                        variant_id: '0',
                        variant_name: 'None',
                        fields: [],
                    },
                ],
            },
            {
                kind: 'Enum',
                type_name: 'BoingEvent',
                variant_id: '6',
                variant_name: 'ContainsOption',
                fields: [
                    {
                        field_name: 'option',
                        kind: 'Enum',
                        type_name: 'Option',
                        variant_id: '1',
                        variant_name: 'Some',
                        fields: [
                            {
                                kind: 'String',
                                value: 'daan',
                            },
                        ],
                    },
                ],
            },
        ];

        const schema = s.enum([
            {
                variant: 'Empty',
                schema: s.tuple([]),
            },
            {
                variant: 'StructBased',
                schema: s.struct({
                    name: s.string(),
                }),
            },
            {
                variant: 'StructBasedEmpty',
                schema: s.struct({}),
            },
            {
                variant: 'TupleBased',
                schema: s.tuple([s.string()]),
            },
            {
                variant: 'TupleBasedTwoVals',
                schema: s.tuple([s.string(), s.number()]),
            },
            {
                variant: 'TupleBasedEmpty',
                schema: s.tuple([]),
            },
            {
                variant: 'ContainsOption',
                schema: s.struct({
                    option: s.option(s.string()),
                }),
            },
        ]);

        type expectedType =
            | {
                  variant: 'Empty';
                  value: [];
              }
            | {
                  variant: 'StructBased';
                  value: {
                      name: string;
                  };
              }
            | {
                  variant: 'StructBasedEmpty';
                  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
                  value: {};
              }
            | {
                  variant: 'TupleBased';
                  value: [string];
              }
            | {
                  variant: 'TupleBasedTwoVals';
                  value: [string, number];
              }
            | {
                  variant: 'TupleBasedEmpty';
                  value: [];
              }
            | {
                  variant: 'ContainsOption';
                  value: {
                      option:
                          | {
                                variant: 'None';
                            }
                          | {
                                variant: 'Some';
                                value: string;
                            };
                  };
              };

        boingEvents.forEach((event) => {
            const result = schema.safeParse(event);
            expectTypeOf(result).toEqualTypeOf<
                Result<expectedType, SborError>
            >();
        });
    });

    it('parse a map', () => {
        const example: ProgrammaticScryptoSborValue = {
            kind: 'Map',
            field_name: 'map',
            key_kind: 'String',
            value_kind: 'String',
            entries: [
                {
                    key: {
                        kind: 'String',
                        value: 'boinoing',
                    },
                    value: {
                        kind: 'String',
                        value: 'boobies',
                    },
                },
                {
                    key: {
                        kind: 'String',
                        value: 'impostor',
                    },
                    value: {
                        kind: 'String',
                        value: 'amogus',
                    },
                },
            ],
        };

        const parsed = new Map([
            ['boinoing', 'boobies'],
            ['impostor', 'amogus'],
        ]);
        const schema = s.map({
            key: s.string(),
            value: s.string(),
        });

        type expectedType = Map<string, string>;

        const result = evaluateResultHelper(schema, example, parsed);

        expectTypeOf(result).toEqualTypeOf<expectedType>();
    });

    it('parse a kvs address (Own)', () => {
        const example: ProgrammaticScryptoSborValue = {
            kind: 'Own',
            type_name: 'KeyValueStore',
            field_name: 'liq_lock',
            value: 'internal_keyvaluestore_rdx1krcfpw0y5les3c725s5py0aqmecymsagzqvx92sz3ul2ecfmdytjq8',
        };

        const parsed =
            'internal_keyvaluestore_rdx1krcfpw0y5les3c725s5py0aqmecymsagzqvx92sz3ul2ecfmdytjq8';

        const schema = s.internalAddress();

        type expectedType = string;

        const result = evaluateResultHelper(schema, example, parsed);
        expectTypeOf(result).toEqualTypeOf<expectedType>();
    });

    it('parse a tuple', () => {
        const example: ProgrammaticScryptoSborValue = {
            kind: 'Tuple',
            field_name: 'tuple',
            type_name: 'tuple',
            fields: [
                {
                    kind: 'String',
                    value: 'hello',
                },
                {
                    kind: 'U32',
                    value: '5',
                },
            ],
        };
        const parsed = ['hello', 5];
        const schema = s.tuple([s.string(), s.number()]);

        type expectedType = [string, number];

        const result = evaluateResultHelper(schema, example, parsed);
        expectTypeOf(result).toEqualTypeOf<expectedType>();
    });

    it('parse a very nested tuple', () => {
        const example: ProgrammaticScryptoSborValue = {
            kind: 'Tuple',
            field_name: 'tuple',
            type_name: 'tuple',
            fields: [
                {
                    kind: 'Tuple',
                    field_name: 'tuple',
                    type_name: 'tuple',
                    fields: [
                        {
                            kind: 'String',
                            value: 'hello',
                        },
                        {
                            kind: 'U32',
                            value: '5',
                        },
                    ],
                },
                {
                    kind: 'Tuple',
                    field_name: 'tuple',
                    type_name: 'tuple',
                    fields: [
                        {
                            kind: 'String',
                            value: 'world',
                        },
                        {
                            kind: 'U32',
                            value: '10',
                        },
                    ],
                },
            ],
        };
        const parsed = [
            ['hello', 5],
            ['world', 10],
        ];

        const schema = s.tuple([
            s.tuple([s.string(), s.number()]),
            s.tuple([s.string(), s.number()]),
        ]);

        type expectedType = [[string, number], [string, number]];

        const result = evaluateResultHelper(schema, example, parsed);
        expectTypeOf(result).toEqualTypeOf<expectedType>();
    });

    it('parse all possible variants of an enum', () => {
        const examples: ProgrammaticScryptoSborValue[] = [
            {
                kind: 'Enum',
                variant_id: '1',
                variant_name: 'StructBased',
                fields: [
                    {
                        kind: 'String',
                        field_name: 'name',
                        value: 'daan',
                    },
                ],
            },
            {
                kind: 'Enum',
                variant_id: '2',
                variant_name: 'StructBasedEmpty',
                fields: [],
            },
            {
                kind: 'Enum',
                variant_id: '5',
                variant_name: 'TupleBasedEmpty',
                fields: [],
            },
            {
                kind: 'Enum',
                variant_id: '3',
                variant_name: 'TupleBased',
                fields: [
                    {
                        kind: 'String',
                        value: 'daan',
                    },
                ],
            },
            {
                kind: 'Enum',
                variant_id: '4',
                variant_name: 'TupleBasedTwoVals',
                fields: [
                    {
                        kind: 'String',
                        value: 'daan',
                    },
                    {
                        kind: 'U32',
                        value: '5',
                    },
                ],
            },
            // this one is an enum at the top level, but also contains an option which
            // is also an enum
            {
                kind: 'Enum',
                variant_id: '6',
                variant_name: 'ContainsOption',
                fields: [
                    {
                        field_name: 'option',
                        kind: 'Enum',
                        type_name: 'Option',
                        variant_id: '0',
                        variant_name: 'None',
                        fields: [],
                    },
                ],
            },
            {
                kind: 'Enum',
                variant_id: '6',
                variant_name: 'ContainsOption',
                fields: [
                    {
                        field_name: 'option',
                        kind: 'Enum',
                        type_name: 'Option',
                        variant_id: '1',
                        variant_name: 'Some',
                        fields: [
                            {
                                kind: 'String',
                                value: 'daan',
                            },
                        ],
                    },
                ],
            },
        ];
        const schema = s.enum([
            {
                variant: 'StructBased',
                schema: s.struct({
                    name: s.string(),
                }),
            },
            {
                variant: 'StructBasedEmpty',
                schema: s.struct({}),
            },
            {
                variant: 'TupleBased',
                schema: s.tuple([s.string()]),
            },
            {
                variant: 'TupleBasedTwoVals',
                schema: s.tuple([s.string(), s.number()]),
            },
            {
                variant: 'TupleBasedEmpty',
                schema: s.tuple([]),
            },
            {
                variant: 'ContainsOption',
                schema: s.struct({
                    option: s.option(s.string()),
                }),
            },
        ]);

        const parsed = [
            { variant: 'StructBased', value: { name: 'daan' } },
            { variant: 'StructBasedEmpty', value: {} },
            { variant: 'TupleBasedEmpty', value: [] },
            { variant: 'TupleBased', value: ['daan'] },
            { variant: 'TupleBasedTwoVals', value: ['daan', 5] },
            {
                variant: 'ContainsOption',
                value: { option: { variant: 'None' } },
            },
            {
                variant: 'ContainsOption',
                value: { option: { variant: 'Some', value: 'daan' } },
            },
        ];

        type expectedType =
            | {
                  variant: 'StructBased';
                  value: {
                      name: string;
                  };
              }
            | {
                  variant: 'TupleBasedEmpty';
                  value: [];
              }
            | {
                  variant: 'StructBasedEmpty';
                  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
                  value: {};
              }
            | {
                  variant: 'TupleBased';
                  value: [string];
              }
            | {
                  variant: 'TupleBasedTwoVals';
                  value: [string, number];
              }
            | {
                  variant: 'ContainsOption';
                  value: {
                      option:
                          | {
                                variant: 'Some';
                                value: string;
                            }
                          | { variant: 'None' };
                  };
              };

        examples.forEach((example, i) => {
            const result = evaluateResultHelper(schema, example, parsed[i]);
            expectTypeOf(result).toEqualTypeOf<expectedType>();
        });
    });

    it('parse an instant', () => {
        const example: ProgrammaticScryptoSborValue = {
            kind: 'I64',
            type_name: 'Instant',
            field_name: 'end_timestamp',
            value: '1741712929',
        };

        const parsed = new Date(Date.parse('2025-03-11T17:08:49.000Z'));

        const schema = s.instant();
        const result = evaluateResultHelper(schema, example, parsed);
        expectTypeOf(result).toEqualTypeOf<Date>();
    });

    it('parse a None', () => {
        const example: ProgrammaticScryptoSborValue = {
            kind: 'Enum',
            variant_id: '0',
            variant_name: 'None',
            fields: [],
        };

        const parsed = {
            variant: 'None',
        };

        const schema = s.option(s.string());

        type expectedType =
            | {
                  variant: 'Some';
                  value: string;
              }
            | {
                  variant: 'None';
              };

        const result = evaluateResultHelper(schema, example, parsed);
        expectTypeOf(result).toEqualTypeOf<expectedType>();
    });

    it('parse a Some', () => {
        const example: ProgrammaticScryptoSborValue = {
            kind: 'Enum',
            variant_id: '1',
            variant_name: 'Some',
            fields: [
                {
                    kind: 'Tuple',
                    fields: [
                        {
                            kind: 'String',
                            value: 'hello',
                            field_name: 'boing',
                        },
                    ],
                },
            ],
        };

        const parsed = {
            variant: 'Some',
            value: {
                boing: 'hello',
            },
        };

        const schema = s.option(
            s.struct({
                boing: s.string(),
            })
        );
        type expectedType =
            | {
                  variant: 'Some';
                  value: {
                      boing: string;
                  };
              }
            | {
                  variant: 'None';
              };
        const result = evaluateResultHelper(schema, example, parsed);
        expectTypeOf(result).toEqualTypeOf<expectedType>();
    });

    it('parse an array of non fungible local ids', () => {
        const example: ProgrammaticScryptoSborValue = {
            kind: 'Array',
            field_name: 'nft_ids',
            type_name: 'Array',
            element_kind: 'NonFungibleLocalId',
            elements: [
                {
                    kind: 'NonFungibleLocalId',
                    value: '#1#',
                },
                {
                    kind: 'NonFungibleLocalId',
                    value: '#2#',
                },
                {
                    kind: 'NonFungibleLocalId',
                    value: '#3#',
                },
            ],
        };
        const parsed = ['#1#', '#2#', '#3#'];
        const schema = s.array(s.nonFungibleLocalId());

        type expectedType = string[];

        const result = evaluateResultHelper(schema, example, parsed);
        expectTypeOf(result).toEqualTypeOf<expectedType>();
    });
    it('parse a multi-layered structure of doom', () => {
        const schema = s.tuple([
            s.struct({
                name: s.string(),
                complicated_array: s.array(
                    s.tuple([
                        s.decimal(),
                        s.enum([
                            {
                                variant: 'Empty',
                                schema: s.tuple([]),
                            },
                            {
                                variant: 'StructBased',
                                schema: s.struct({
                                    inner_name: s.string(),
                                    inner_value: s.number(),
                                }),
                            },
                        ]),
                        s.bool(),
                    ])
                ),
            }),
            // The array of enums part
            s.array(
                s.enum([
                    {
                        variant: 'HiddenMessage',
                        schema: s.tuple([s.string()]),
                    },
                    {
                        variant: 'LuckyNumber',
                        schema: s.tuple([s.number()]),
                    },
                ])
            ),
        ]);

        // 2) Example data following the "ProgrammaticScryptoSborValue" shape
        const example: ProgrammaticScryptoSborValue = {
            kind: 'Tuple',
            fields: [
                // The struct portion
                {
                    kind: 'Tuple',
                    fields: [
                        {
                            field_name: 'name',
                            kind: 'String',
                            value: 'A mighty struct indeed',
                        },
                        {
                            field_name: 'complicated_array',
                            kind: 'Array',
                            type_name: 'Array',
                            element_kind: 'Tuple',
                            elements: [
                                {
                                    // Each element is a Tuple
                                    kind: 'Tuple',
                                    fields: [
                                        {
                                            kind: 'Decimal',
                                            value: '42.1234',
                                        },
                                        {
                                            kind: 'Enum',
                                            variant_id: '1',
                                            variant_name: 'StructBased',
                                            fields: [
                                                {
                                                    field_name: 'inner_name',
                                                    kind: 'String',
                                                    value: 'DeepInside',
                                                },
                                                {
                                                    field_name: 'inner_value',
                                                    kind: 'U32',
                                                    value: '999999',
                                                },
                                            ],
                                        },
                                        {
                                            kind: 'Bool',
                                            value: true,
                                        },
                                    ],
                                },
                                {
                                    kind: 'Tuple',
                                    fields: [
                                        {
                                            kind: 'Decimal',
                                            value: '0.0001',
                                        },
                                        {
                                            kind: 'Enum',
                                            variant_id: '0',
                                            variant_name: 'Empty',
                                            fields: [],
                                        },
                                        {
                                            kind: 'Bool',
                                            value: false,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                // Array of enums portion
                {
                    kind: 'Array',
                    type_name: 'Array',
                    element_kind: 'Enum',
                    elements: [
                        {
                            kind: 'Enum',
                            variant_id: '0',
                            variant_name: 'HiddenMessage',
                            fields: [
                                {
                                    kind: 'String',
                                    value: 'secret stuff inside an array of enums',
                                },
                            ],
                        },
                        {
                            kind: 'Enum',
                            variant_id: '1',
                            variant_name: 'LuckyNumber',
                            fields: [
                                {
                                    kind: 'I32',
                                    value: '777',
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const expectedParsedValue = [
            {
                name: 'A mighty struct indeed',
                complicated_array: [
                    [
                        '42.1234', // decimal as string
                        {
                            variant: 'StructBased',
                            value: {
                                inner_name: 'DeepInside',
                                inner_value: 999999,
                            },
                        },
                        true,
                    ],
                    [
                        '0.0001', // decimal as string
                        {
                            variant: 'Empty',
                            value: [],
                        },
                        false,
                    ],
                ],
            },
            [
                {
                    variant: 'HiddenMessage',
                    value: ['secret stuff inside an array of enums'],
                },
                {
                    variant: 'LuckyNumber',
                    value: [777],
                },
            ],
        ];

        type expectedType = [
            {
                name: string;
                complicated_array: [
                    string,
                    (
                        | {
                              variant: 'StructBased';
                              value: {
                                  inner_name: string;
                                  inner_value: number;
                              };
                          }
                        | {
                              variant: 'Empty';
                              value: [];
                          }
                    ),
                    boolean,
                ][];
            },
            (
                | {
                      variant: 'HiddenMessage';
                      value: [string];
                  }
                | {
                      variant: 'LuckyNumber';
                      value: [number];
                  }
            )[],
        ];
        const result = evaluateResultHelper(
            schema,
            example,
            expectedParsedValue
        );
        expectTypeOf(result).toEqualTypeOf<expectedType>();
    });

    it('parse a PreciseDecimal', () => {
        const example: ProgrammaticScryptoSborValue = {
            kind: 'PreciseDecimal',
            value: '123.456',
        };

        const parsed = '123.456';
        const schema = s.decimal();
        const result = evaluateResultHelper(schema, example, parsed);
        expectTypeOf(result).toEqualTypeOf<string>();
    });

    it('testing generated schema of ociswap precisionpool', () => {
        const example: ProgrammaticScryptoSborValue = {
            kind: 'Tuple',
            type_name: 'PrecisionPool',
            fields: [
                {
                    kind: 'Reference',
                    type_name: 'ComponentAddress',
                    field_name: 'pool_address',
                    value: 'component_rdx1cp6fus3tmgfddxvfksn9ng8nh7rd0zqyarl3pgvatzfcwdzuq4nvst',
                },
                {
                    kind: 'Own',
                    type_name: 'Vault',
                    field_name: 'x_liquidity',
                    value: 'internal_vault_rdx1tpf4j3xrdvlmmhdk4232gmy65n2dvhuygzj2ufp7jvlkqkr3k70tdx',
                },
                {
                    kind: 'Own',
                    type_name: 'Vault',
                    field_name: 'y_liquidity',
                    value: 'internal_vault_rdx1trk0j6gasw0a0a8vm8reegfm2arj27rapmffjxdjzfsg23vctmuapn',
                },
                {
                    kind: 'Own',
                    type_name: 'Vault',
                    field_name: 'x_fees',
                    value: 'internal_vault_rdx1trgsrylgw9uj8atmepytjtxder25kawa70dq3fgcctp6hy85lcjq46',
                },
                {
                    kind: 'Own',
                    type_name: 'Vault',
                    field_name: 'y_fees',
                    value: 'internal_vault_rdx1trt36r2ypsa2d6nkv6m3ynwhfvduqyj69wwp0f0ac9ax2ykl3uq7ue',
                },
                {
                    kind: 'U32',
                    field_name: 'tick_spacing',
                    value: '60',
                },
                {
                    kind: 'PreciseDecimal',
                    field_name: 'max_liquidity_per_tick',
                    value: '106125742744311269.65457311918850380388841927303465765',
                },
                {
                    kind: 'PreciseDecimal',
                    field_name: 'price_sqrt',
                    value: '0.170709179821498589523144422307580686',
                },
                {
                    kind: 'Enum',
                    type_name: 'Option',
                    field_name: 'active_tick',
                    variant_id: '1',
                    variant_name: 'Some',
                    fields: [
                        {
                            kind: 'I32',
                            value: '-40440',
                        },
                    ],
                },
                {
                    kind: 'PreciseDecimal',
                    field_name: 'active_liquidity',
                    value: '2601629.738964659409787981546051466255292134',
                },
                {
                    kind: 'Reference',
                    type_name: 'ResourceAddress',
                    field_name: 'lp_manager',
                    value: 'resource_rdx1ngv3qc6st8a8fexnqz23nl0ggnydup2a6zaultldushkpxrtmm02up',
                },
                {
                    kind: 'U64',
                    field_name: 'lp_counter',
                    value: '34',
                },
                {
                    kind: 'Tuple',
                    type_name: 'AvlTree',
                    field_name: 'ticks',
                    fields: [
                        {
                            kind: 'Enum',
                            type_name: 'Option',
                            field_name: 'root',
                            variant_id: '1',
                            variant_name: 'Some',
                            fields: [
                                {
                                    kind: 'I32',
                                    value: '-31440',
                                },
                            ],
                        },
                        {
                            kind: 'Own',
                            type_name: 'KeyValueStore',
                            field_name: 'store',
                            value: 'internal_keyvaluestore_rdx1kplayw0a626grcr6whuxzsw84stykvh9cp0znadg5adxjxmafl3zf3',
                        },
                        {
                            kind: 'Map',
                            field_name: 'store_cache',
                            key_kind: 'I32',
                            value_kind: 'Tuple',
                            value_type_name: 'Node',
                            entries: [],
                        },
                    ],
                },
                {
                    kind: 'Reference',
                    type_name: 'ComponentAddress',
                    field_name: 'registry',
                    value: 'component_rdx1crdy3ut4f78nxjpum37kl0682nq0vee9ntwrz8eg7mtxe8kyanwjmv',
                },
                {
                    kind: 'U64',
                    field_name: 'next_sync_time',
                    value: '1743802966',
                },
                {
                    kind: 'Decimal',
                    field_name: 'input_fee_rate',
                    value: '0.01',
                },
                {
                    kind: 'Decimal',
                    field_name: 'fee_protocol_share',
                    value: '0.1',
                },
                {
                    kind: 'PreciseDecimal',
                    field_name: 'x_lp_fee',
                    value: '0.268161448946111888032739450603034827',
                },
                {
                    kind: 'PreciseDecimal',
                    field_name: 'y_lp_fee',
                    value: '0.009030772719485233115495696611069994',
                },
                {
                    kind: 'Own',
                    type_name: 'Vault',
                    field_name: 'x_protocol_fee',
                    value: 'internal_vault_rdx1tqksgqvrhnhtl599fv4d5pd93xmadptxslkw8uyn6zzq6dke45xdt4',
                },
                {
                    kind: 'Own',
                    type_name: 'Vault',
                    field_name: 'y_protocol_fee',
                    value: 'internal_vault_rdx1tz8yuffczg9zmkkjaut0hr5zel7n5rehqne7xcalwf0knl5dlr59p6',
                },
                {
                    kind: 'U64',
                    field_name: 'instantiated_at',
                    value: '1727451450',
                },
                {
                    kind: 'Reference',
                    type_name: 'ResourceAddress',
                    field_name: 'flash_manager',
                    value: 'resource_rdx1nfy368dkh3emwtplg4vpgrpyvpcch0sezytp93fea0zjqup9tj2z3u',
                },
                {
                    kind: 'Decimal',
                    field_name: 'flash_loan_fee_rate',
                    value: '0.009',
                },
                {
                    kind: 'Map',
                    field_name: 'hooks',
                    key_kind: 'Tuple',
                    value_kind: 'Reference',
                    value_type_name: 'ComponentAddress',
                    entries: [],
                },
                {
                    kind: 'Tuple',
                    type_name: 'HookCalls',
                    field_name: 'hook_calls',
                    fields: [
                        {
                            kind: 'Tuple',
                            field_name: 'before_instantiate',
                            fields: [
                                {
                                    kind: 'String',
                                    value: 'before_instantiate',
                                },
                                {
                                    kind: 'Array',
                                    element_kind: 'Reference',
                                    elements: [],
                                },
                            ],
                        },
                        {
                            kind: 'Tuple',
                            field_name: 'after_instantiate',
                            fields: [
                                {
                                    kind: 'String',
                                    value: 'after_instantiate',
                                },
                                {
                                    kind: 'Array',
                                    element_kind: 'Reference',
                                    elements: [],
                                },
                            ],
                        },
                        {
                            kind: 'Tuple',
                            field_name: 'before_add_liquidity',
                            fields: [
                                {
                                    kind: 'String',
                                    value: 'before_add_liquidity',
                                },
                                {
                                    kind: 'Array',
                                    element_kind: 'Reference',
                                    elements: [],
                                },
                            ],
                        },
                        {
                            kind: 'Tuple',
                            field_name: 'after_add_liquidity',
                            fields: [
                                {
                                    kind: 'String',
                                    value: 'after_add_liquidity',
                                },
                                {
                                    kind: 'Array',
                                    element_kind: 'Reference',
                                    elements: [],
                                },
                            ],
                        },
                        {
                            kind: 'Tuple',
                            field_name: 'before_swap',
                            fields: [
                                {
                                    kind: 'String',
                                    value: 'before_swap',
                                },
                                {
                                    kind: 'Array',
                                    element_kind: 'Reference',
                                    elements: [],
                                },
                            ],
                        },
                        {
                            kind: 'Tuple',
                            field_name: 'after_swap',
                            fields: [
                                {
                                    kind: 'String',
                                    value: 'after_swap',
                                },
                                {
                                    kind: 'Array',
                                    element_kind: 'Reference',
                                    elements: [],
                                },
                            ],
                        },
                        {
                            kind: 'Tuple',
                            field_name: 'before_remove_liquidity',
                            fields: [
                                {
                                    kind: 'String',
                                    value: 'before_remove_liquidity',
                                },
                                {
                                    kind: 'Array',
                                    element_kind: 'Reference',
                                    elements: [],
                                },
                            ],
                        },
                        {
                            kind: 'Tuple',
                            field_name: 'after_remove_liquidity',
                            fields: [
                                {
                                    kind: 'String',
                                    value: 'after_remove_liquidity',
                                },
                                {
                                    kind: 'Array',
                                    element_kind: 'Reference',
                                    elements: [],
                                },
                            ],
                        },
                    ],
                },
                {
                    kind: 'Map',
                    field_name: 'hook_badges',
                    key_kind: 'Reference',
                    key_type_name: 'ComponentAddress',
                    value_kind: 'Own',
                    value_type_name: 'Vault',
                    entries: [],
                },
                {
                    kind: 'Tuple',
                    type_name: 'Oracle',
                    field_name: 'oracle',
                    fields: [
                        {
                            kind: 'Own',
                            type_name: 'KeyValueStore',
                            field_name: 'observations',
                            value: 'internal_keyvaluestore_rdx1krzv59c6nn43y8zmp3j0kmqdmxfep2vgjs0cj09al0l6zrm5tlvj4d',
                        },
                        {
                            kind: 'Enum',
                            type_name: 'Option',
                            field_name: 'last_observation_index',
                            variant_id: '1',
                            variant_name: 'Some',
                            fields: [
                                {
                                    kind: 'U16',
                                    value: '3210',
                                },
                            ],
                        },
                        {
                            kind: 'U16',
                            field_name: 'observations_stored',
                            value: '3211',
                        },
                        {
                            kind: 'Enum',
                            type_name: 'Option',
                            field_name: 'sub_observations',
                            variant_id: '1',
                            variant_name: 'Some',
                            fields: [
                                {
                                    kind: 'Tuple',
                                    type_name: 'SubObservations',
                                    fields: [
                                        {
                                            kind: 'PreciseDecimal',
                                            field_name: 'price_sqrt_sum',
                                            value: '4.093043071561028153376905943915838968',
                                        },
                                        {
                                            kind: 'PreciseDecimal',
                                            field_name: 'price_sqrt_last',
                                            value: '0.170709179821498589523144422307580686',
                                        },
                                        {
                                            kind: 'I64',
                                            type_name: 'Instant',
                                            field_name: 'last_updated',
                                            value: '1743694944',
                                        },
                                        {
                                            kind: 'Enum',
                                            type_name: 'Option',
                                            field_name: 'initialization',
                                            variant_id: '0',
                                            variant_name: 'None',
                                            fields: [],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            kind: 'U16',
                            field_name: 'observations_limit',
                            value: '65535',
                        },
                    ],
                },
            ],
        };
        // Generated TypeScript schema for Scrypto SBOR types of package address: package_rdx1pkl8tdw43xqx64etxwdf8rjtvptqurq4c3fky0kaj6vwa0zrkfmcmc

        const HookCalls = s.struct({
            before_instantiate: s.tuple([s.string(), s.array(s.address())]),
            after_instantiate: s.tuple([s.string(), s.array(s.address())]),
            before_add_liquidity: s.tuple([s.string(), s.array(s.address())]),
            after_add_liquidity: s.tuple([s.string(), s.array(s.address())]),
            before_swap: s.tuple([s.string(), s.array(s.address())]),
            after_swap: s.tuple([s.string(), s.array(s.address())]),
            before_remove_liquidity: s.tuple([
                s.string(),
                s.array(s.address()),
            ]),
            after_remove_liquidity: s.tuple([s.string(), s.array(s.address())]),
        });

        const Node = s.struct({
            key: s.number(),
            value: s.tuple([]),
            left_child: s.option(s.number()),
            right_child: s.option(s.number()),
            parent: s.option(s.number()),
            next: s.option(s.number()),
            prev: s.option(s.number()),
            balance_factor: s.number(),
        });

        const AvlTree = s.struct({
            root: s.option(s.number()),
            store: s.internalAddress(),
            store_cache: s.map({ key: s.number(), value: Node }),
        });

        const SubObservations = s.struct({
            price_sqrt_sum: s.decimal(),
            price_sqrt_last: s.decimal(),
            last_updated: s.instant(),
            initialization: s.option(s.instant()),
        });

        const Oracle = s.struct({
            observations: s.internalAddress(),
            last_observation_index: s.option(s.number()),
            observations_stored: s.number(),
            sub_observations: s.option(SubObservations),
            observations_limit: s.number(),
        });

        const PrecisionPool = s.struct({
            pool_address: s.address(),
            x_liquidity: s.internalAddress(),
            y_liquidity: s.internalAddress(),
            x_fees: s.internalAddress(),
            y_fees: s.internalAddress(),
            tick_spacing: s.number(),
            max_liquidity_per_tick: s.decimal(),
            price_sqrt: s.decimal(),
            active_tick: s.option(s.number()),
            active_liquidity: s.decimal(),
            lp_manager: s.address(),
            lp_counter: s.number(),
            ticks: AvlTree,
            registry: s.address(),
            next_sync_time: s.number(),
            input_fee_rate: s.decimal(),
            fee_protocol_share: s.decimal(),
            x_lp_fee: s.decimal(),
            y_lp_fee: s.decimal(),
            x_protocol_fee: s.internalAddress(),
            y_protocol_fee: s.internalAddress(),
            instantiated_at: s.number(),
            flash_manager: s.address(),
            flash_loan_fee_rate: s.decimal(),
            hooks: s.map({
                key: s.tuple([s.address(), s.string()]),
                value: s.address(),
            }),
            hook_calls: HookCalls,
            hook_badges: s.map({
                key: s.address(),
                value: s.internalAddress(),
            }),
            oracle: Oracle,
        });

        const result = PrecisionPool.safeParse(example);
        console.log(result);
    });
});
