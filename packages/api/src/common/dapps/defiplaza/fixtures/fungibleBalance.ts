import type { GetFungibleBalanceOutput } from '../../../gateway/getFungibleBalance';
import BigNumber from 'bignumber.js';
import { deserializeBigNumber } from '../../../utils/deserializeBigNumber';

export const fungibleBalance = [
  {
    address:
      'account_rdx12x2a5dft0gszufcce98ersqvsd8qr5kzku968jd50n8w4qyl9awecr',
    fungibleResources: [
      {
        resourceAddress:
          'resource_rdx1tkdws0nvfwjnn2q62x4gqgelyt4t5z7cn58pwvrtf4zrxtdw2sem8x',
        amount: {
          s: 1,
          e: 1,
          c: [19, 23797024451522, 20310000000000],
        },
        lastUpdatedStateVersion: 302823029,
      },
      {
        resourceAddress:
          'resource_rdx1thdahk9aypz6c4f4uygkgl40c8nt0arc0fnxrsj4ar3tsrm4s208cx',
        amount: {
          s: 1,
          e: 0,
          c: [1],
        },
        lastUpdatedStateVersion: 165489810,
      },
      {
        resourceAddress:
          'resource_rdx1thyp96620fhte4qvgw5rfkl66rv9hvhfqw2vtw4u2erwv5wnu9238q',
        amount: {
          s: 1,
          e: 2,
          c: [500],
        },
        lastUpdatedStateVersion: 74505377,
      },
      {
        resourceAddress:
          'resource_rdx1t4h4396mukhpzdrr5sfvegjsxl8q7a34q2vkt4quxcxahna8fucuz4',
        amount: {
          s: 1,
          e: 0,
          c: [2],
        },
        lastUpdatedStateVersion: 52430567,
      },
      {
        resourceAddress:
          'resource_rdx1t4tjx4g3qzd98nayqxm7qdpj0a0u8ns6a0jrchq49dyfevgh6u0gj3',
        amount: {
          s: 1,
          e: 0,
          c: [9, 41275300000000],
        },
        lastUpdatedStateVersion: 77445290,
      },
      {
        resourceAddress:
          'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
        amount: {
          s: 1,
          e: 3,
          c: [1232, 86372261163929, 69040000000000],
        },
        lastUpdatedStateVersion: 302823029,
      },
    ],
    details: {
      type: 'Component',
      package_address:
        'package_rdx1pkgxxxxxxxxxaccntxxxxxxxxxx000929625493xxxxxxxxxaccntx',
      blueprint_name: 'Account',
      blueprint_version: '1.0.0',
      state: {
        default_deposit_rule: 'Accept',
      },
      role_assignments: {
        owner: {
          rule: {
            type: 'Protected',
            access_rule: {
              type: 'ProofRule',
              proof_rule: {
                type: 'Require',
                requirement: {
                  type: 'NonFungible',
                  non_fungible: {
                    local_id: {
                      id_type: 'Bytes',
                      sbor_hex:
                        '5cc0021d95da352b7a202e2718c94f91c00c834e01d2c2b70ba3c9b47cceea809f',
                      simple_rep:
                        '[95da352b7a202e2718c94f91c00c834e01d2c2b70ba3c9b47cceea809f]',
                    },
                    resource_address:
                      'resource_rdx1nfxxxxxxxxxxed25sgxxxxxxxxx002236757237xxxxxxxxxed25sg',
                  },
                },
              },
            },
          },
          updater: 'Object',
        },
        entries: [
          {
            role_key: {
              name: 'securify',
              module: 'Main',
            },
            assignment: {
              resolution: 'Explicit',
              explicit_rule: {
                type: 'Protected',
                access_rule: {
                  type: 'ProofRule',
                  proof_rule: {
                    type: 'Require',
                    requirement: {
                      type: 'NonFungible',
                      non_fungible: {
                        local_id: {
                          id_type: 'Bytes',
                          sbor_hex:
                            '5cc0021d95da352b7a202e2718c94f91c00c834e01d2c2b70ba3c9b47cceea809f',
                          simple_rep:
                            '[95da352b7a202e2718c94f91c00c834e01d2c2b70ba3c9b47cceea809f]',
                        },
                        resource_address:
                          'resource_rdx1nfxxxxxxxxxxed25sgxxxxxxxxx002236757237xxxxxxxxxed25sg',
                      },
                    },
                  },
                },
              },
            },
            updater_roles: [
              {
                name: '_self_',
                module: 'Main',
              },
            ],
          },
          {
            role_key: {
              name: 'metadata_locker',
              module: 'Metadata',
            },
            assignment: {
              resolution: 'Owner',
            },
            updater_roles: [
              {
                name: 'metadata_locker_updater',
                module: 'Metadata',
              },
            ],
          },
          {
            role_key: {
              name: 'metadata_locker_updater',
              module: 'Metadata',
            },
            assignment: {
              resolution: 'Owner',
            },
            updater_roles: [
              {
                name: 'metadata_locker_updater',
                module: 'Metadata',
              },
            ],
          },
          {
            role_key: {
              name: 'metadata_setter',
              module: 'Metadata',
            },
            assignment: {
              resolution: 'Owner',
            },
            updater_roles: [
              {
                name: 'metadata_setter_updater',
                module: 'Metadata',
              },
            ],
          },
          {
            role_key: {
              name: 'metadata_setter_updater',
              module: 'Metadata',
            },
            assignment: {
              resolution: 'Owner',
            },
            updater_roles: [
              {
                name: 'metadata_setter_updater',
                module: 'Metadata',
              },
            ],
          },
        ],
      },
      royalty_vault_balance: undefined,
      royalty_config: undefined,
      two_way_linked_dapp_address: undefined,
      direct_linked_dapp_address: undefined,
      blueprint_linked_dapp_address: undefined,
      two_way_linked_dapp_details: undefined,
      native_resource_details: undefined,
    },
    metadata: {
      total_count: 8,
      next_cursor: undefined,
      items: [
        {
          key: 'claimed_entities',
          value: {
            raw_hex:
              '5c228801208006c009e8023b3494ebdfe0f8c847d2e28175b7f65362a39f4bccecf6d73bf8c0b3ecfab1f10a1dcd762d5de5649d9cd0ea29523912ff77aaf2473d47655d08e0571a9b55f35b3bb32bc12cecf1bd0dcb08e0814823a972fb0eebfcc02355f6b08316436e2c4bff5cff3c9afdc116fda38821e0baa181d4b799c078b351771ceea2ef81d764279bcc2bd1568a6c3384e131a59a1075f00cc01aace94a202679deacaf3eab907fe72212159f20bccb89b290a05a0f29',
            programmatic_json: {
              kind: 'Enum',
              type_name: undefined,
              field_name: undefined,
              variant_id: '136',
              variant_name: undefined,
              fields: [
                {
                  kind: 'Array',
                  type_name: undefined,
                  field_name: undefined,
                  element_kind: 'Reference',
                  element_type_name: undefined,
                  elements: [
                    {
                      kind: 'Reference',
                      type_name: undefined,
                      field_name: undefined,
                      value:
                        'component_rdx1cqy7sq3mxj2whhlqlryy05hzs96m0ajnv23e7j7vanmdwwlccnmz68',
                    },
                    {
                      kind: 'Reference',
                      type_name: undefined,
                      field_name: undefined,
                      value:
                        'component_rdx1cze7e7437y9pmntk94w72eyanngw522j8yf07aa27frn63m9ezkfeu',
                    },
                    {
                      kind: 'Reference',
                      type_name: undefined,
                      field_name: undefined,
                      value:
                        'resource_rdx1t5ywq4c6nd2lxkemkv4uzt8v7x7smjcguzq5sgafwtasa6luq7fclq',
                    },
                    {
                      kind: 'Reference',
                      type_name: undefined,
                      field_name: undefined,
                      value:
                        'component_rdx1cq34ta4ssvtyxm3vf0l4eleunt7uz9ha5wyzrc965xqafdueadpy4x',
                    },
                    {
                      kind: 'Reference',
                      type_name: undefined,
                      field_name: undefined,
                      value:
                        'component_rdx1cputx5thrnh29mup6ajz0x7v90g4dznvxwzwzvd9ngg8tuqvqlxmlh',
                    },
                    {
                      kind: 'Reference',
                      type_name: undefined,
                      field_name: undefined,
                      value:
                        'component_rdx1cqd2e622yqn8nh4v4ul2hyrluu3py9vlyz7vhzdjjzs95refpdem7w',
                    },
                  ],
                },
              ],
            },
            typed: {
              type: 'GlobalAddressArray',
              values: [
                'component_rdx1cqy7sq3mxj2whhlqlryy05hzs96m0ajnv23e7j7vanmdwwlccnmz68',
                'component_rdx1cze7e7437y9pmntk94w72eyanngw522j8yf07aa27frn63m9ezkfeu',
                'resource_rdx1t5ywq4c6nd2lxkemkv4uzt8v7x7smjcguzq5sgafwtasa6luq7fclq',
                'component_rdx1cq34ta4ssvtyxm3vf0l4eleunt7uz9ha5wyzrc965xqafdueadpy4x',
                'component_rdx1cputx5thrnh29mup6ajz0x7v90g4dznvxwzwzvd9ngg8tuqvqlxmlh',
                'component_rdx1cqd2e622yqn8nh4v4ul2hyrluu3py9vlyz7vhzdjjzs95refpdem7w',
              ],
            },
          },
          is_locked: false,
          last_updated_at_state_version: 102329840,
        },
        {
          key: 'account_type',
          value: {
            raw_hex: '5c2200010c0f6461707020646566696e6974696f6e',
            programmatic_json: {
              kind: 'Enum',
              type_name: undefined,
              field_name: undefined,
              variant_id: '0',
              variant_name: undefined,
              fields: [
                {
                  kind: 'String',
                  type_name: undefined,
                  field_name: undefined,
                  value: 'dapp definition',
                },
              ],
            },
            typed: {
              type: 'String',
              value: 'dapp definition',
            },
          },
          is_locked: false,
          last_updated_at_state_version: 506838,
        },
        {
          key: 'icon_url',
          value: {
            raw_hex:
              '5c220d010c4168747470733a2f2f72616469782e64656669706c617a612e6e65742f6173736574732f696d672f626162796c6f6e2f64656669706c617a612d69636f6e2e706e67',
            programmatic_json: {
              kind: 'Enum',
              type_name: undefined,
              field_name: undefined,
              variant_id: '13',
              variant_name: undefined,
              fields: [
                {
                  kind: 'String',
                  type_name: undefined,
                  field_name: undefined,
                  value:
                    'https://radix.defiplaza.net/assets/img/babylon/defiplaza-icon.png',
                },
              ],
            },
            typed: {
              type: 'Url',
              value:
                'https://radix.defiplaza.net/assets/img/babylon/defiplaza-icon.png',
            },
          },
          is_locked: false,
          last_updated_at_state_version: 296858031,
        },
        {
          key: 'description',
          value: {
            raw_hex:
              '5c2200010c7c4120444558207370656369666963616c6c792064657369676e656420746f2072656475636520746865207269736b206f6620496d7065726d616e656e74204c6f737320616e642068656c70206d616b652070726f766964696e67206c6971756964697479207375737461696e61626c792070726f66697461626c652e',
            programmatic_json: {
              kind: 'Enum',
              type_name: undefined,
              field_name: undefined,
              variant_id: '0',
              variant_name: undefined,
              fields: [
                {
                  kind: 'String',
                  type_name: undefined,
                  field_name: undefined,
                  value:
                    'A DEX specifically designed to reduce the risk of Impermanent Loss and help make providing liquidity sustainably profitable.',
                },
              ],
            },
            typed: {
              type: 'String',
              value:
                'A DEX specifically designed to reduce the risk of Impermanent Loss and help make providing liquidity sustainably profitable.',
            },
          },
          is_locked: false,
          last_updated_at_state_version: 296858031,
        },
        {
          key: 'name',
          value: {
            raw_hex: '5c2200010c0944656669506c617a61',
            programmatic_json: {
              kind: 'Enum',
              type_name: undefined,
              field_name: undefined,
              variant_id: '0',
              variant_name: undefined,
              fields: [
                {
                  kind: 'String',
                  type_name: undefined,
                  field_name: undefined,
                  value: 'DefiPlaza',
                },
              ],
            },
            typed: {
              type: 'String',
              value: 'DefiPlaza',
            },
          },
          is_locked: false,
          last_updated_at_state_version: 506838,
        },
        {
          key: 'claimed_websites',
          value: {
            raw_hex:
              '5c228e01200c021b68747470733a2f2f72616469782e64656669706c617a612e6e65741b68747470733a2f2f61646d696e2e64656669706c617a612e6e6574',
            programmatic_json: {
              kind: 'Enum',
              type_name: undefined,
              field_name: undefined,
              variant_id: '142',
              variant_name: undefined,
              fields: [
                {
                  kind: 'Array',
                  type_name: undefined,
                  field_name: undefined,
                  element_kind: 'String',
                  element_type_name: undefined,
                  elements: [
                    {
                      kind: 'String',
                      type_name: undefined,
                      field_name: undefined,
                      value: 'https://radix.defiplaza.net',
                    },
                    {
                      kind: 'String',
                      type_name: undefined,
                      field_name: undefined,
                      value: 'https://admin.defiplaza.net',
                    },
                  ],
                },
              ],
            },
            typed: {
              type: 'OriginArray',
              values: [
                'https://radix.defiplaza.net',
                'https://admin.defiplaza.net',
              ],
            },
          },
          is_locked: false,
          last_updated_at_state_version: 296858031,
        },
        {
          key: 'owner_keys',
          value: {
            raw_hex:
              '5c228f01202201010120071d95da352b7a202e2718c94f91c00c834e01d2c2b70ba3c9b47cceea809f',
            programmatic_json: {
              kind: 'Enum',
              type_name: undefined,
              field_name: undefined,
              variant_id: '143',
              variant_name: undefined,
              fields: [
                {
                  kind: 'Array',
                  type_name: undefined,
                  field_name: undefined,
                  element_kind: 'Enum',
                  element_type_name: undefined,
                  elements: [
                    {
                      kind: 'Enum',
                      type_name: undefined,
                      field_name: undefined,
                      variant_id: '1',
                      variant_name: undefined,
                      fields: [
                        {
                          kind: 'Bytes',
                          type_name: undefined,
                          field_name: undefined,
                          element_kind: 'U8',
                          element_type_name: undefined,
                          hex: '95da352b7a202e2718c94f91c00c834e01d2c2b70ba3c9b47cceea809f',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            typed: {
              type: 'PublicKeyHashArray',
              values: [
                {
                  key_hash_type: 'EddsaEd25519',
                  hash_hex:
                    '95da352b7a202e2718c94f91c00c834e01d2c2b70ba3c9b47cceea809f',
                },
              ],
            },
          },
          is_locked: false,
          last_updated_at_state_version: 503428,
        },
        {
          key: 'owner_badge',
          value: {
            raw_hex:
              '5c220b01c0021e5195da352b7a202e2718c94f91c00c834e01d2c2b70ba3c9b47cceea809f',
            programmatic_json: {
              kind: 'Enum',
              type_name: undefined,
              field_name: undefined,
              variant_id: '11',
              variant_name: undefined,
              fields: [
                {
                  kind: 'NonFungibleLocalId',
                  type_name: undefined,
                  field_name: undefined,
                  value:
                    '[5195da352b7a202e2718c94f91c00c834e01d2c2b70ba3c9b47cceea809f]',
                },
              ],
            },
            typed: {
              type: 'NonFungibleLocalId',
              value:
                '[5195da352b7a202e2718c94f91c00c834e01d2c2b70ba3c9b47cceea809f]',
            },
          },
          is_locked: true,
          last_updated_at_state_version: 503428,
        },
      ],
    },
  },
].map((item) => ({
  ...item,
  fungibleResources: item.fungibleResources.map((resource) => ({
    ...resource,
    amount: deserializeBigNumber(resource.amount),
  })),
})) as GetFungibleBalanceOutput;
