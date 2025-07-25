import {
  LedgerState,
  StateKeyValueStoreDataResponseItem,
} from "@radixdlt/babylon-gateway-api-sdk";

export const poolStatesKvs = {
  key_value_store_address:
    "internal_keyvaluestore_rdx1kr9pe655r6gvkemdnwd2588pkfs8nz0ds0depfzpr65grz4e77hnju",
  ledger_state: {
    network: "mainnet",
    state_version: 337393034,
    proposer_round_timestamp: "2025-07-24T23:59:59.545Z",
    epoch: 223865,
    round: 759,
  },
  entries: [
    {
      key: {
        raw_hex:
          "5c805d6d8a7e441bbe66229586913c2d7e9b9c831cb728d4860c3b8e8b054497",
        programmatic_json: {
          kind: "Reference",
          type_name: "ResourceAddress",
          field_name: undefined,
          value:
            "resource_rdx1t4kc5ljyrwlxvg54s6gnctt7nwwgx89h9r2gvrpm369s23yhzyyzlx",
        },
      },
      value: {
        raw_hex:
          "5c211380c0e086c480626f52d0a520d2173cf9149d2e4e0fa97cfd895fab66431aee90582d186081ad79dff4b4908585574e71bcb5dcce69ebdaf9573a171db88b9058036272fe705e146103cc3f8823d0263b8b4300ceb30e7f261d49c0f09d805d6d8a7e441bbe66229586913c2d7e9b9c831cb728d4860c3b8e8b054497a0006c004171917c00000000000000000000000000000000000501c2826800000000a000000000000000000000000000000000000000000000000005436a586700000000b00000000000000000000000000000000000000000000000000000000000000000b00000a831b74039495ecf2ec3ef798f7bd3740100000000000000000000000000b00000000000000000000000000000000000000000000000000000000000000000b00000a831b74039495ecf2ec3ef798f7bd374010000000000000000000000000080c0cbdff270dee98aa95ea26ef1de366013c0b6ff49eab9dbae8041aec3d821012103a0000000000000000000000000000000000000000000000000a0000004bfc91b8e0000000000000000000000000000000000a000002cf61a24a229000000000000000000000000000000002105220101a00000d9e9ac2d780300000000000000000000000000000000220101a00000d9e9ac2d7803000000000000000000000000000000002380a0002307a000a00000d9e9ac2d780300000000000000000000000000000000210ea0000014bbf08ac60200000000000000000000000000000000a000004f8c34e8140200000000000000000000000000000000a00000087e93371c0100000000000000000000000000000000a00080c6a47e8d0300000000000000000000000000000000000700a0000000000000000000000000000000000000000000000000a0000064a7b3b6e00d00000000000000000000000000000000220000220101a000000000000000000000000000000000000000000000000022000005010000000000000005040000000000000005f000000000000000a00000eda49db83e06000000000000000000000000000000002107210201010100210201010100210201010100210201010100210201010100210201010100210201010100a0000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000",
        programmatic_json: {
          kind: "Tuple",
          type_name: "LendingPoolState",
          field_name: undefined,
          fields: [
            {
              kind: "Reference",
              type_name: "GlobalSingleResourcePool",
              field_name: "pool",
              value:
                "component_rdx1crsgd3yqvfh49599yrfpw08ezjwjuns04970mz2l4dnyxxhwzuecy5",
            },
            {
              kind: "Own",
              type_name: "Vault",
              field_name: "collaterals",
              value:
                "internal_vault_rdx1tqk3scyp44uala95jzzc246wwx7tthxwd84a472h8gt3mwytavpeve",
            },
            {
              kind: "Own",
              type_name: "Vault",
              field_name: "reserve",
              value:
                "internal_vault_rdx1tqpkyuh7wp0pgcgreslcsg7sycackscqe6esulexr4yupuyadpt45d",
            },
            {
              kind: "Reference",
              type_name: "ResourceAddress",
              field_name: "pool_res_address",
              value:
                "resource_rdx1t4kc5ljyrwlxvg54s6gnctt7nwwgx89h9r2gvrpm369s23yhzyyzlx",
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "price",
              value: "0.03506281272",
            },
            {
              kind: "I64",
              type_name: undefined,
              field_name: "price_updated_at",
              value: "1753399809",
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "interest_rate",
              value: "0",
            },
            {
              kind: "I64",
              type_name: undefined,
              field_name: "interest_updated_at",
              value: "1733847619",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_loan",
              value: "0",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_deposit",
              value: "32477734.186050229582517114",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_loan_unit",
              value: "0",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_deposit_unit",
              value: "32477734.186050229582517114",
            },
            {
              kind: "Reference",
              type_name: "ComponentAddress",
              field_name: "price_feed_comp",
              value:
                "component_rdx1cr9alunsmm5c42275fh0rh3kvqfupdhlf84tnkawspq6as7cysqn98",
            },
            {
              kind: "Tuple",
              type_name: "InterestStrategy",
              field_name: "interest_strategy",
              fields: [
                {
                  kind: "Tuple",
                  type_name: "InterestStrategyBreakPoints",
                  field_name: "break_points",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: "r0",
                      value: "0",
                    },
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: "r1",
                      value: "0.04",
                    },
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: "r2",
                      value: "3",
                    },
                  ],
                },
              ],
            },
            {
              kind: "Tuple",
              type_name: "LiquidationThreshold",
              field_name: "liquidation_threshold",
              fields: [
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "identical_resource",
                  variant_id: "1",
                  variant_name: "Some",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: undefined,
                      value: "0.25",
                    },
                  ],
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "identical_asset_type",
                  variant_id: "1",
                  variant_name: "Some",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: undefined,
                      value: "0.25",
                    },
                  ],
                },
                {
                  kind: "Map",
                  type_name: undefined,
                  field_name: "resource",
                  key_kind: "Reference",
                  key_type_name: "ResourceAddress",
                  value_kind: "Decimal",
                  value_type_name: undefined,
                  entries: [],
                },
                {
                  kind: "Map",
                  type_name: undefined,
                  field_name: "asset_type",
                  key_kind: "U8",
                  key_type_name: undefined,
                  value_kind: "Decimal",
                  value_type_name: undefined,
                  entries: [],
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "default_value",
                  value: "0.25",
                },
              ],
            },
            {
              kind: "Tuple",
              type_name: "PoolConfig",
              field_name: "pool_config",
              fields: [
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "protocol_interest_fee_rate",
                  value: "0.2",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "protocol_flashloan_fee_rate",
                  value: "0.15",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "protocol_liquidation_fee_rate",
                  value: "0.08",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "flashloan_fee_rate",
                  value: "0.001",
                },
                {
                  kind: "U8",
                  type_name: undefined,
                  field_name: "asset_type",
                  value: "0",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "liquidation_bonus_rate",
                  value: "0",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "loan_close_factor",
                  value: "1",
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "deposit_limit",
                  variant_id: "0",
                  variant_name: "None",
                  fields: [],
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "borrow_limit",
                  variant_id: "1",
                  variant_name: "Some",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: undefined,
                      value: "0",
                    },
                  ],
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "utilization_limit",
                  variant_id: "0",
                  variant_name: "None",
                  fields: [],
                },
                {
                  kind: "I64",
                  type_name: undefined,
                  field_name: "interest_update_period",
                  value: "1",
                },
                {
                  kind: "I64",
                  type_name: undefined,
                  field_name: "price_update_period",
                  value: "4",
                },
                {
                  kind: "I64",
                  type_name: undefined,
                  field_name: "price_expiration_period",
                  value: "240",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "optimal_usage",
                  value: "0.45",
                },
              ],
            },
            {
              kind: "Tuple",
              type_name: "OperatingStatus",
              field_name: "operating_status",
              fields: [
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_contribute_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_redeem_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_deposit_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_withdraw_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_borrow_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_repay_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_liquidate_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
              ],
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "pool_utilization",
              value: "0",
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "total_reserved_amount",
              value: "0",
            },
          ],
        },
      },
      last_updated_at_state_version: 337375021,
      is_locked: false,
    },
    {
      key: {
        raw_hex:
          "5c805d0ccad70fe14a2797407bf6cf573b76cce9395ad94ff77c40d35bf0e4a9",
        programmatic_json: {
          kind: "Reference",
          type_name: "ResourceAddress",
          field_name: undefined,
          value:
            "resource_rdx1t5xv44c0u99z096q00mv74emwmxwjw26m98lwlzq6ddlpe9f5cuc7s",
        },
      },
      value: {
        raw_hex:
          "5c211380c0de11e8e23019b4814ebceb3ba940c2140a42cddfbeb881ccdea691ab18905838fc412562882f0a57b2bdd644917cc520eec333e009959973ddbfcf699058416f4c4a801d66b7e3340708eff7ba1c6fd3969dba90d2ea3b1cbcdad3805d0ccad70fe14a2797407bf6cf573b76cce9395ad94ff77c40d35bf0e4a9a000e55113bcd27f01000000000000000000000000000000000501c2826800000000a000000000000000000000000000000000000000000000000005436a586700000000b00000000000000000000000000000000000000000000000000000000000000000b00000bc1a87f5cd23215fe75e2a488468030e0100000000000000000000000000b00000000000000000000000000000000000000000000000000000000000000000b00000bc1a87f5cd23215fe75e2a488468030e010000000000000000000000000080c0cbdff270dee98aa95ea26ef1de366013c0b6ff49eab9dbae8041aec3d821012103a0000000000000000000000000000000000000000000000000a0000004bfc91b8e0000000000000000000000000000000000a000002cf61a24a229000000000000000000000000000000002105220101a000009e1869d0290400000000000000000000000000000000220101a000009e1869d02904000000000000000000000000000000002380a0002307a000a000009e1869d0290400000000000000000000000000000000210ea0000014bbf08ac60200000000000000000000000000000000a000004f8c34e8140200000000000000000000000000000000a00000087e93371c0100000000000000000000000000000000a00080c6a47e8d0300000000000000000000000000000000000700a0000000000000000000000000000000000000000000000000a0000064a7b3b6e00d00000000000000000000000000000000220000220101a000000000000000000000000000000000000000000000000022000005010000000000000005040000000000000005f000000000000000a00000eda49db83e06000000000000000000000000000000002107210201010100210201010100210201010100210201010100210201010100210201010100210201010100a0000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000",
        programmatic_json: {
          kind: "Tuple",
          type_name: "LendingPoolState",
          field_name: undefined,
          fields: [
            {
              kind: "Reference",
              type_name: "GlobalSingleResourcePool",
              field_name: "pool",
              value:
                "component_rdx1cr0pr68zxqvmfq2whn4nh22qcg2q5skdm7lt3qwvm6nfr2ccaryjsz",
            },
            {
              kind: "Own",
              type_name: "Vault",
              field_name: "collaterals",
              value:
                "internal_vault_rdx1tqu0csf9v2yz7zjhk27av3y30nzjpmkrx0sqn9vew0wmlnmfpz2hep",
            },
            {
              kind: "Own",
              type_name: "Vault",
              field_name: "reserve",
              value:
                "internal_vault_rdx1tpqk7nz2sqwkddlrxsrs3mlhhgwxl5uknkafp5h28vwtekknmd32kg",
            },
            {
              kind: "Reference",
              type_name: "ResourceAddress",
              field_name: "pool_res_address",
              value:
                "resource_rdx1t5xv44c0u99z096q00mv74emwmxwjw26m98lwlzq6ddlpe9f5cuc7s",
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "price",
              value: "0.1080366213",
            },
            {
              kind: "I64",
              type_name: undefined,
              field_name: "price_updated_at",
              value: "1753399809",
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "interest_rate",
              value: "0",
            },
            {
              kind: "I64",
              type_name: undefined,
              field_name: "interest_updated_at",
              value: "1733847619",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_loan",
              value: "0",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_deposit",
              value: "23521476.975234466813417415",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_loan_unit",
              value: "0",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_deposit_unit",
              value: "23521476.975234466813417415",
            },
            {
              kind: "Reference",
              type_name: "ComponentAddress",
              field_name: "price_feed_comp",
              value:
                "component_rdx1cr9alunsmm5c42275fh0rh3kvqfupdhlf84tnkawspq6as7cysqn98",
            },
            {
              kind: "Tuple",
              type_name: "InterestStrategy",
              field_name: "interest_strategy",
              fields: [
                {
                  kind: "Tuple",
                  type_name: "InterestStrategyBreakPoints",
                  field_name: "break_points",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: "r0",
                      value: "0",
                    },
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: "r1",
                      value: "0.04",
                    },
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: "r2",
                      value: "3",
                    },
                  ],
                },
              ],
            },
            {
              kind: "Tuple",
              type_name: "LiquidationThreshold",
              field_name: "liquidation_threshold",
              fields: [
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "identical_resource",
                  variant_id: "1",
                  variant_name: "Some",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: undefined,
                      value: "0.3",
                    },
                  ],
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "identical_asset_type",
                  variant_id: "1",
                  variant_name: "Some",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: undefined,
                      value: "0.3",
                    },
                  ],
                },
                {
                  kind: "Map",
                  type_name: undefined,
                  field_name: "resource",
                  key_kind: "Reference",
                  key_type_name: "ResourceAddress",
                  value_kind: "Decimal",
                  value_type_name: undefined,
                  entries: [],
                },
                {
                  kind: "Map",
                  type_name: undefined,
                  field_name: "asset_type",
                  key_kind: "U8",
                  key_type_name: undefined,
                  value_kind: "Decimal",
                  value_type_name: undefined,
                  entries: [],
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "default_value",
                  value: "0.3",
                },
              ],
            },
            {
              kind: "Tuple",
              type_name: "PoolConfig",
              field_name: "pool_config",
              fields: [
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "protocol_interest_fee_rate",
                  value: "0.2",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "protocol_flashloan_fee_rate",
                  value: "0.15",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "protocol_liquidation_fee_rate",
                  value: "0.08",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "flashloan_fee_rate",
                  value: "0.001",
                },
                {
                  kind: "U8",
                  type_name: undefined,
                  field_name: "asset_type",
                  value: "0",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "liquidation_bonus_rate",
                  value: "0",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "loan_close_factor",
                  value: "1",
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "deposit_limit",
                  variant_id: "0",
                  variant_name: "None",
                  fields: [],
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "borrow_limit",
                  variant_id: "1",
                  variant_name: "Some",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: undefined,
                      value: "0",
                    },
                  ],
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "utilization_limit",
                  variant_id: "0",
                  variant_name: "None",
                  fields: [],
                },
                {
                  kind: "I64",
                  type_name: undefined,
                  field_name: "interest_update_period",
                  value: "1",
                },
                {
                  kind: "I64",
                  type_name: undefined,
                  field_name: "price_update_period",
                  value: "4",
                },
                {
                  kind: "I64",
                  type_name: undefined,
                  field_name: "price_expiration_period",
                  value: "240",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "optimal_usage",
                  value: "0.45",
                },
              ],
            },
            {
              kind: "Tuple",
              type_name: "OperatingStatus",
              field_name: "operating_status",
              fields: [
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_contribute_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_redeem_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_deposit_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_withdraw_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_borrow_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_repay_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_liquidate_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
              ],
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "pool_utilization",
              value: "0",
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "total_reserved_amount",
              value: "0",
            },
          ],
        },
      },
      last_updated_at_state_version: 337375021,
      is_locked: false,
    },
    {
      key: {
        raw_hex:
          "5c805ded045268f3d05dec859e7ce13e18f778218dc4f2768c1859fa90c09c32",
        programmatic_json: {
          kind: "Reference",
          type_name: "ResourceAddress",
          field_name: undefined,
          value:
            "resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf",
        },
      },
      value: {
        raw_hex:
          "5c211380c0b608ef2f283c1f23d74409d06169746f9adffa2051aced57f4c8d573769058013429807d9ed43666e22b5727e6925ab2e6add99722834cab8db6d0849058873320de987b5144ed1f1213f08f9231af9b05855445a3c63985e720cc805ded045268f3d05dec859e7ce13e18f778218dc4f2768c1859fa90c09c32a000f09129a8d3cd0f000000000000000000000000000000000501c2826800000000a02a88e455b18b0100000000000000000000000000000000000501c2826800000000b0bbcc2257afa4476edaefa12fcb48cab57d020000000000000000000000000000b0b3ccbe4b9050c8b6c3127117934b1f8cf2fc0100000000000000000000000000b0a087ec40765b3b8c74c884967eeb1d46b8010000000000000000000000000000b0366c1da5b7a317f20b4f2d7c2402ae38eafc010000000000000000000000000080c0cbdff270dee98aa95ea26ef1de366013c0b6ff49eab9dbae8041aec3d821012103a0000000000000000000000000000000000000000000000000a0000004bfc91b8e0000000000000000000000000000000000a000002cf61a24a229000000000000000000000000000000002105220101a0000001608e43050900000000000000000000000000000000220101a0000001608e430509000000000000000000000000000000002380a0002307a000a0000001608e43050900000000000000000000000000000000210ea000009e1869d0290400000000000000000000000000000000a000004f8c34e8140200000000000000000000000000000000a00000087e93371c0100000000000000000000000000000000a00080c6a47e8d0300000000000000000000000000000000000700a0000000000000000000000000000000000000000000000000a0000064a7b3b6e00d0000000000000000000000000000000022000022000022000005010000000000000005040000000000000005f000000000000000a00000eda49db83e06000000000000000000000000000000002107210201010100210201010100210201010100210201010100210201010100210201010100210201010100a0ddfb4a068b63110000000000000000000000000000000000a0000000000000000000000000000000000000000000000000",
        programmatic_json: {
          kind: "Tuple",
          type_name: "LendingPoolState",
          field_name: undefined,
          fields: [
            {
              kind: "Reference",
              type_name: "GlobalSingleResourcePool",
              field_name: "pool",
              value:
                "component_rdx1czmq3me09q7p7g7hgsyaqctfw3he4hl6ypg6em2h7nyd2umk0dhhnq",
            },
            {
              kind: "Own",
              type_name: "Vault",
              field_name: "collaterals",
              value:
                "internal_vault_rdx1tqqng2vq0k0dgdnxug44wflxjfdt9e4dmxtj9q6v4wxmd5yykthxay",
            },
            {
              kind: "Own",
              type_name: "Vault",
              field_name: "reserve",
              value:
                "internal_vault_rdx1tzrnxgx7npa4z38drufp8uy0jgc6lxc9s42ytg7x8xz7wgxvn6nher",
            },
            {
              kind: "Reference",
              type_name: "ResourceAddress",
              field_name: "pool_res_address",
              value:
                "resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf",
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "price",
              value: "1.138799",
            },
            {
              kind: "I64",
              type_name: undefined,
              field_name: "price_updated_at",
              value: "1753399809",
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "interest_rate",
              value: "0.000435068743223338",
            },
            {
              kind: "I64",
              type_name: undefined,
              field_name: "interest_updated_at",
              value: "1753399809",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_loan",
              value: "217001.508316271845052855595516478697426107",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_deposit",
              value: "44335575.840542519422460869149182595841313971",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_loan_unit",
              value: "149817.442757922354156233791861573292951456",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_deposit_unit",
              value: "44332742.667464577701258244480298663492283446",
            },
            {
              kind: "Reference",
              type_name: "ComponentAddress",
              field_name: "price_feed_comp",
              value:
                "component_rdx1cr9alunsmm5c42275fh0rh3kvqfupdhlf84tnkawspq6as7cysqn98",
            },
            {
              kind: "Tuple",
              type_name: "InterestStrategy",
              field_name: "interest_strategy",
              fields: [
                {
                  kind: "Tuple",
                  type_name: "InterestStrategyBreakPoints",
                  field_name: "break_points",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: "r0",
                      value: "0",
                    },
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: "r1",
                      value: "0.04",
                    },
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: "r2",
                      value: "3",
                    },
                  ],
                },
              ],
            },
            {
              kind: "Tuple",
              type_name: "LiquidationThreshold",
              field_name: "liquidation_threshold",
              fields: [
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "identical_resource",
                  variant_id: "1",
                  variant_name: "Some",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: undefined,
                      value: "0.65",
                    },
                  ],
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "identical_asset_type",
                  variant_id: "1",
                  variant_name: "Some",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: undefined,
                      value: "0.65",
                    },
                  ],
                },
                {
                  kind: "Map",
                  type_name: undefined,
                  field_name: "resource",
                  key_kind: "Reference",
                  key_type_name: "ResourceAddress",
                  value_kind: "Decimal",
                  value_type_name: undefined,
                  entries: [],
                },
                {
                  kind: "Map",
                  type_name: undefined,
                  field_name: "asset_type",
                  key_kind: "U8",
                  key_type_name: undefined,
                  value_kind: "Decimal",
                  value_type_name: undefined,
                  entries: [],
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "default_value",
                  value: "0.65",
                },
              ],
            },
            {
              kind: "Tuple",
              type_name: "PoolConfig",
              field_name: "pool_config",
              fields: [
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "protocol_interest_fee_rate",
                  value: "0.3",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "protocol_flashloan_fee_rate",
                  value: "0.15",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "protocol_liquidation_fee_rate",
                  value: "0.08",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "flashloan_fee_rate",
                  value: "0.001",
                },
                {
                  kind: "U8",
                  type_name: undefined,
                  field_name: "asset_type",
                  value: "0",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "liquidation_bonus_rate",
                  value: "0",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "loan_close_factor",
                  value: "1",
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "deposit_limit",
                  variant_id: "0",
                  variant_name: "None",
                  fields: [],
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "borrow_limit",
                  variant_id: "0",
                  variant_name: "None",
                  fields: [],
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "utilization_limit",
                  variant_id: "0",
                  variant_name: "None",
                  fields: [],
                },
                {
                  kind: "I64",
                  type_name: undefined,
                  field_name: "interest_update_period",
                  value: "1",
                },
                {
                  kind: "I64",
                  type_name: undefined,
                  field_name: "price_update_period",
                  value: "4",
                },
                {
                  kind: "I64",
                  type_name: undefined,
                  field_name: "price_expiration_period",
                  value: "240",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "optimal_usage",
                  value: "0.45",
                },
              ],
            },
            {
              kind: "Tuple",
              type_name: "OperatingStatus",
              field_name: "operating_status",
              fields: [
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_contribute_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_redeem_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_deposit_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_withdraw_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_borrow_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_repay_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_liquidate_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
              ],
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "pool_utilization",
              value: "0.004894523361262557",
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "total_reserved_amount",
              value: "0",
            },
          ],
        },
      },
      last_updated_at_state_version: 337375021,
      is_locked: false,
    },
    {
      key: {
        raw_hex:
          "5c805d0ef01b1ee07abf7dceafd58acb16ee3a99678d34a8e0c863c2de18e4ea",
        programmatic_json: {
          kind: "Reference",
          type_name: "ResourceAddress",
          field_name: undefined,
          value:
            "resource_rdx1t580qxc7upat7lww4l2c4jckacafjeudxj5wpjrrct0p3e82sq4y75",
        },
      },
      value: {
        raw_hex:
          "5c211380c06976c7aa6f5d5670467dc8e9d35c1a83beafd39917fa322164746b129790581b7ca95c4ae00ea7d9dbcd3e37d0fe5433ca0658c5f1fbe84805a51579905873f7fd5f8529020ad59c9c28d2789f6702bf3f663566097931a50f289a805d0ef01b1ee07abf7dceafd58acb16ee3a99678d34a8e0c863c2de18e4eaa00000f92a9a4e144a595c0c0000000000000000000000000005f8c1826800000000a078fdaf7046f804000000000000000000000000000000000005f8c1826800000000b0c83ed8263dfa12457ba42675442d020000000000000000000000000000000000b0bad24134c6b4b007a25ec329f5d6870000000000000000000000000000000000b0007ee3dd7b3be71a414ea254a634010000000000000000000000000000000000b0e9b0907581b485cd5319e2d8c7b67e000000000000000000000000000000000080c0cbdff270dee98aa95ea26ef1de366013c0b6ff49eab9dbae8041aec3d821012103a0000000000000000000000000000000000000000000000000a0000004bfc91b8e0000000000000000000000000000000000a000002cf61a24a229000000000000000000000000000000002105220101a000008bbd0689680a00000000000000000000000000000000220101a000008bbd0689680a000000000000000000000000000000002380a0002307a000a000008bbd0689680a00000000000000000000000000000000210ea00000d9e9ac2d780300000000000000000000000000000000a000004f8c34e8140200000000000000000000000000000000a00000087e93371c0100000000000000000000000000000000a00080c6a47e8d0300000000000000000000000000000000000700a0000000000000000000000000000000000000000000000000a0000064a7b3b6e00d0000000000000000000000000000000022000022000022000005010000000000000005040000000000000005f000000000000000a00000eda49db83e06000000000000000000000000000000002107210201010100210201010100210201010100210201010100210201010100210201010100210201010100a08de3bb7318e9370000000000000000000000000000000000a0276492ddfeffffffffffffffffffffffffffffffffffffff",
        programmatic_json: {
          kind: "Tuple",
          type_name: "LendingPoolState",
          field_name: undefined,
          fields: [
            {
              kind: "Reference",
              type_name: "GlobalSingleResourcePool",
              field_name: "pool",
              value:
                "component_rdx1cp5hd3a2daw4vuzx0hywn56ur2pmat7nnytl5v3pv36xky5hkpr84y",
            },
            {
              kind: "Own",
              type_name: "Vault",
              field_name: "collaterals",
              value:
                "internal_vault_rdx1tqdhe22uftsqaf7em0xnud7sle2r8jsxtrzlr7lgfqz629te5kvx0a",
            },
            {
              kind: "Own",
              type_name: "Vault",
              field_name: "reserve",
              value:
                "internal_vault_rdx1tpel0l2ls55syzk4njwz35ncnans90elvc6kvztexxjs72y6hhq6fz",
            },
            {
              kind: "Reference",
              type_name: "ResourceAddress",
              field_name: "pool_res_address",
              value:
                "resource_rdx1t580qxc7upat7lww4l2c4jckacafjeudxj5wpjrrct0p3e82sq4y75",
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "price",
              value: "14943214.65",
            },
            {
              kind: "I64",
              type_name: undefined,
              field_name: "price_updated_at",
              value: "1753399800",
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "interest_rate",
              value: "0.001398881328823672",
            },
            {
              kind: "I64",
              type_name: undefined,
              field_name: "interest_updated_at",
              value: "1753399800",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_loan",
              value: "0.011302725920747022673851296232521416",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_deposit",
              value: "0.70531993538227201096112384640875385",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_loan_unit",
              value: "0.006260160225858435703784172119358976",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_deposit_unit",
              value: "0.657936636249692185509894367315276009",
            },
            {
              kind: "Reference",
              type_name: "ComponentAddress",
              field_name: "price_feed_comp",
              value:
                "component_rdx1cr9alunsmm5c42275fh0rh3kvqfupdhlf84tnkawspq6as7cysqn98",
            },
            {
              kind: "Tuple",
              type_name: "InterestStrategy",
              field_name: "interest_strategy",
              fields: [
                {
                  kind: "Tuple",
                  type_name: "InterestStrategyBreakPoints",
                  field_name: "break_points",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: "r0",
                      value: "0",
                    },
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: "r1",
                      value: "0.04",
                    },
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: "r2",
                      value: "3",
                    },
                  ],
                },
              ],
            },
            {
              kind: "Tuple",
              type_name: "LiquidationThreshold",
              field_name: "liquidation_threshold",
              fields: [
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "identical_resource",
                  variant_id: "1",
                  variant_name: "Some",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: undefined,
                      value: "0.75",
                    },
                  ],
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "identical_asset_type",
                  variant_id: "1",
                  variant_name: "Some",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: undefined,
                      value: "0.75",
                    },
                  ],
                },
                {
                  kind: "Map",
                  type_name: undefined,
                  field_name: "resource",
                  key_kind: "Reference",
                  key_type_name: "ResourceAddress",
                  value_kind: "Decimal",
                  value_type_name: undefined,
                  entries: [],
                },
                {
                  kind: "Map",
                  type_name: undefined,
                  field_name: "asset_type",
                  key_kind: "U8",
                  key_type_name: undefined,
                  value_kind: "Decimal",
                  value_type_name: undefined,
                  entries: [],
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "default_value",
                  value: "0.75",
                },
              ],
            },
            {
              kind: "Tuple",
              type_name: "PoolConfig",
              field_name: "pool_config",
              fields: [
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "protocol_interest_fee_rate",
                  value: "0.25",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "protocol_flashloan_fee_rate",
                  value: "0.15",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "protocol_liquidation_fee_rate",
                  value: "0.08",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "flashloan_fee_rate",
                  value: "0.001",
                },
                {
                  kind: "U8",
                  type_name: undefined,
                  field_name: "asset_type",
                  value: "0",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "liquidation_bonus_rate",
                  value: "0",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "loan_close_factor",
                  value: "1",
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "deposit_limit",
                  variant_id: "0",
                  variant_name: "None",
                  fields: [],
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "borrow_limit",
                  variant_id: "0",
                  variant_name: "None",
                  fields: [],
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "utilization_limit",
                  variant_id: "0",
                  variant_name: "None",
                  fields: [],
                },
                {
                  kind: "I64",
                  type_name: undefined,
                  field_name: "interest_update_period",
                  value: "1",
                },
                {
                  kind: "I64",
                  type_name: undefined,
                  field_name: "price_update_period",
                  value: "4",
                },
                {
                  kind: "I64",
                  type_name: undefined,
                  field_name: "price_expiration_period",
                  value: "240",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "optimal_usage",
                  value: "0.45",
                },
              ],
            },
            {
              kind: "Tuple",
              type_name: "OperatingStatus",
              field_name: "operating_status",
              fields: [
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_contribute_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_redeem_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_deposit_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_withdraw_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_borrow_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_repay_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_liquidate_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
              ],
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "pool_utilization",
              value: "0.015737414949266317",
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "total_reserved_amount",
              value: "-0.000000004872575961",
            },
          ],
        },
      },
      last_updated_at_state_version: 337374938,
      is_locked: false,
    },
    {
      key: {
        raw_hex:
          "5c805d2db24a9592cf4df7ecef92668e61621288695122fc4737acefd5460dbf",
        programmatic_json: {
          kind: "Reference",
          type_name: "ResourceAddress",
          field_name: undefined,
          value:
            "resource_rdx1t5kmyj54jt85malva7fxdrnpvgfgs623yt7ywdaval25vrdlmnwe97",
        },
      },
      value: {
        raw_hex:
          "5c211380c0b96f689565d0dad606f91fc9a960ca1d0d79ed005fc87d4bfc109b5f6d90581aff1095940c0d0a71bd72fe8d356ece9b2562be0125689b4c8af5c3759058e3385f7ef17f12113975b87638d2aacbb8145e7ca9c5079750cfc6db70805d2db24a9592cf4df7ecef92668e61621288695122fc4737acefd5460dbfa080b47bb2ff1802000000000000000000000000000000000005f8c1826800000000a000000000000000000000000000000000000000000000000005b33a116700000000b00000000000000000000000000000000000000000000000000000000000000000b000006c03597884e73aca241f0c9dbc1ba7ab8d02000000000000000000000000b00000000000000000000000000000000000000000000000000000000000000000b000006c03597884e73aca241f0c9dbc1ba7ab8d0200000000000000000000000080c0cbdff270dee98aa95ea26ef1de366013c0b6ff49eab9dbae8041aec3d821012103a0000000000000000000000000000000000000000000000000a0000004bfc91b8e0000000000000000000000000000000000a000002cf61a24a229000000000000000000000000000000002105220101a000002876e1158d0500000000000000000000000000000000220101a000002876e1158d05000000000000000000000000000000002380a0002307a000a000002876e1158d0500000000000000000000000000000000210ea0000014bbf08ac60200000000000000000000000000000000a000004f8c34e8140200000000000000000000000000000000a00000087e93371c0100000000000000000000000000000000a00080c6a47e8d0300000000000000000000000000000000000700a0000000000000000000000000000000000000000000000000a0000064a7b3b6e00d00000000000000000000000000000000220000220101a000000000000000000000000000000000000000000000000022000005010000000000000005040000000000000005f000000000000000a00000eda49db83e06000000000000000000000000000000002107210201010100210201010100210201000101210201010100210201010100210201010100210201010100a0000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000",
        programmatic_json: {
          kind: "Tuple",
          type_name: "LendingPoolState",
          field_name: undefined,
          fields: [
            {
              kind: "Reference",
              type_name: "GlobalSingleResourcePool",
              field_name: "pool",
              value:
                "component_rdx1czuk76y4vhgd44sxly0un2tqegws670dqp0usl2tlsgfkhmdl8dad3",
            },
            {
              kind: "Own",
              type_name: "Vault",
              field_name: "collaterals",
              value:
                "internal_vault_rdx1tqd07yy4jsxq6zn3h4e0arf4dm8fkftzhcqj26ymfj90tsm4crgeym",
            },
            {
              kind: "Own",
              type_name: "Vault",
              field_name: "reserve",
              value:
                "internal_vault_rdx1tr3nshm779l3yyfewku8vwxj4t9ms9z70j5u2puh2r8udkmszgx8d0",
            },
            {
              kind: "Reference",
              type_name: "ResourceAddress",
              field_name: "pool_res_address",
              value:
                "resource_rdx1t5kmyj54jt85malva7fxdrnpvgfgs623yt7ywdaval25vrdlmnwe97",
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "price",
              value: "0.0005904364436",
            },
            {
              kind: "I64",
              type_name: undefined,
              field_name: "price_updated_at",
              value: "1753399800",
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "interest_rate",
              value: "0",
            },
            {
              kind: "I64",
              type_name: undefined,
              field_name: "interest_updated_at",
              value: "1729182387",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_loan",
              value: "0",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_deposit",
              value: "14577339679.558596704604306387",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_loan_unit",
              value: "0",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_deposit_unit",
              value: "14577339679.558596704604306387",
            },
            {
              kind: "Reference",
              type_name: "ComponentAddress",
              field_name: "price_feed_comp",
              value:
                "component_rdx1cr9alunsmm5c42275fh0rh3kvqfupdhlf84tnkawspq6as7cysqn98",
            },
            {
              kind: "Tuple",
              type_name: "InterestStrategy",
              field_name: "interest_strategy",
              fields: [
                {
                  kind: "Tuple",
                  type_name: "InterestStrategyBreakPoints",
                  field_name: "break_points",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: "r0",
                      value: "0",
                    },
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: "r1",
                      value: "0.04",
                    },
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: "r2",
                      value: "3",
                    },
                  ],
                },
              ],
            },
            {
              kind: "Tuple",
              type_name: "LiquidationThreshold",
              field_name: "liquidation_threshold",
              fields: [
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "identical_resource",
                  variant_id: "1",
                  variant_name: "Some",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: undefined,
                      value: "0.4",
                    },
                  ],
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "identical_asset_type",
                  variant_id: "1",
                  variant_name: "Some",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: undefined,
                      value: "0.4",
                    },
                  ],
                },
                {
                  kind: "Map",
                  type_name: undefined,
                  field_name: "resource",
                  key_kind: "Reference",
                  key_type_name: "ResourceAddress",
                  value_kind: "Decimal",
                  value_type_name: undefined,
                  entries: [],
                },
                {
                  kind: "Map",
                  type_name: undefined,
                  field_name: "asset_type",
                  key_kind: "U8",
                  key_type_name: undefined,
                  value_kind: "Decimal",
                  value_type_name: undefined,
                  entries: [],
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "default_value",
                  value: "0.4",
                },
              ],
            },
            {
              kind: "Tuple",
              type_name: "PoolConfig",
              field_name: "pool_config",
              fields: [
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "protocol_interest_fee_rate",
                  value: "0.2",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "protocol_flashloan_fee_rate",
                  value: "0.15",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "protocol_liquidation_fee_rate",
                  value: "0.08",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "flashloan_fee_rate",
                  value: "0.001",
                },
                {
                  kind: "U8",
                  type_name: undefined,
                  field_name: "asset_type",
                  value: "0",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "liquidation_bonus_rate",
                  value: "0",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "loan_close_factor",
                  value: "1",
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "deposit_limit",
                  variant_id: "0",
                  variant_name: "None",
                  fields: [],
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "borrow_limit",
                  variant_id: "1",
                  variant_name: "Some",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: undefined,
                      value: "0",
                    },
                  ],
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "utilization_limit",
                  variant_id: "0",
                  variant_name: "None",
                  fields: [],
                },
                {
                  kind: "I64",
                  type_name: undefined,
                  field_name: "interest_update_period",
                  value: "1",
                },
                {
                  kind: "I64",
                  type_name: undefined,
                  field_name: "price_update_period",
                  value: "4",
                },
                {
                  kind: "I64",
                  type_name: undefined,
                  field_name: "price_expiration_period",
                  value: "240",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "optimal_usage",
                  value: "0.45",
                },
              ],
            },
            {
              kind: "Tuple",
              type_name: "OperatingStatus",
              field_name: "operating_status",
              fields: [
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_contribute_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_redeem_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_deposit_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: false,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: true,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_withdraw_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_borrow_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_repay_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_liquidate_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
              ],
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "pool_utilization",
              value: "0",
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "total_reserved_amount",
              value: "0",
            },
          ],
        },
      },
      last_updated_at_state_version: 337374938,
      is_locked: false,
    },
    {
      key: {
        raw_hex:
          "5c805da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6",
        programmatic_json: {
          kind: "Reference",
          type_name: "ResourceAddress",
          field_name: undefined,
          value:
            "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
        },
      },
      value: {
        raw_hex:
          "5c211380c03b07794fad2283846a962333015728c6c2e1899123406a5785b960020f905895da20fbc3c8f91ab9c57a70b92fa726673d4dd1e83180d1f11077e12e905818d10eeba9d5e6019e712fa2ffb4fbbb75eecb6c2ddfc94b62ab3a7768805da66318c6318c61f5a61b4c6318c6318cf794aa8d295f14e6318c6318c6a0000064a7b3b6e00d0000000000000000000000000000000005fcc1826800000000a01fb3f92a508182000000000000000000000000000000000005fcc1826800000000b0d0caf57e4fc874f57070deb9b4039b032afb0000000000000000000000000000b0a6af5bda97ca0d628d8136cf95c7fb68c45f0200000000000000000000000000b065e7b4f0d07d12477d3ba6b236527d5e09f00000000000000000000000000000b09a594f1de2968b898afd4844695fa212e250020000000000000000000000000080c0cbdff270dee98aa95ea26ef1de366013c0b6ff49eab9dbae8041aec3d821012103a0000000000000000000000000000000000000000000000000a0000004bfc91b8e0000000000000000000000000000000000a000002cf61a24a229000000000000000000000000000000002105220101a0000001608e43050900000000000000000000000000000000220101a0000001608e430509000000000000000000000000000000002380a0002307a000a0000001608e43050900000000000000000000000000000000210ea000009e1869d0290400000000000000000000000000000000a000004f8c34e8140200000000000000000000000000000000a00000087e93371c0100000000000000000000000000000000a00080c6a47e8d0300000000000000000000000000000000000700a0000000000000000000000000000000000000000000000000a0000064a7b3b6e00d0000000000000000000000000000000022000022000022000005010000000000000005040000000000000005f000000000000000a00000eda49db83e06000000000000000000000000000000002107210201010100210201010100210201010100210201010100210201010100210201010100210201010100a0221f79e3c52ebc0500000000000000000000000000000000a0000000000000000000000000000000000000000000000000",
        programmatic_json: {
          kind: "Tuple",
          type_name: "LendingPoolState",
          field_name: undefined,
          fields: [
            {
              kind: "Reference",
              type_name: "GlobalSingleResourcePool",
              field_name: "pool",
              value:
                "component_rdx1cqasw720453g8pr2jc3nxq2h9rrv9cvfjy35q6jhskukqqs0t7qcky",
            },
            {
              kind: "Own",
              type_name: "Vault",
              field_name: "collaterals",
              value:
                "internal_vault_rdx1tz2a5g8mc0y0jx4ec4a8pwf05unxw02d685rrqx37yg80cfw0wqr9d",
            },
            {
              kind: "Own",
              type_name: "Vault",
              field_name: "reserve",
              value:
                "internal_vault_rdx1tqvdzrht4827vqv7wyh69la5lwahtmktdskalj2tv24n5amguxvv3w",
            },
            {
              kind: "Reference",
              type_name: "ResourceAddress",
              field_name: "pool_res_address",
              value:
                "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "price",
              value: "1",
            },
            {
              kind: "I64",
              type_name: undefined,
              field_name: "price_updated_at",
              value: "1753399804",
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "interest_rate",
              value: "0.036733928290759455",
            },
            {
              kind: "I64",
              type_name: undefined,
              field_name: "interest_updated_at",
              value: "1753399804",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_loan",
              value: "21879480.420847667573116821906019550947035856",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_deposit",
              value: "52943992.451521115413464173589199664038260646",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_loan_unit",
              value: "20910136.763060949937875984867487419701978981",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_deposit_unit",
              value: "51647401.855717382321303406848716185843751322",
            },
            {
              kind: "Reference",
              type_name: "ComponentAddress",
              field_name: "price_feed_comp",
              value:
                "component_rdx1cr9alunsmm5c42275fh0rh3kvqfupdhlf84tnkawspq6as7cysqn98",
            },
            {
              kind: "Tuple",
              type_name: "InterestStrategy",
              field_name: "interest_strategy",
              fields: [
                {
                  kind: "Tuple",
                  type_name: "InterestStrategyBreakPoints",
                  field_name: "break_points",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: "r0",
                      value: "0",
                    },
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: "r1",
                      value: "0.04",
                    },
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: "r2",
                      value: "3",
                    },
                  ],
                },
              ],
            },
            {
              kind: "Tuple",
              type_name: "LiquidationThreshold",
              field_name: "liquidation_threshold",
              fields: [
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "identical_resource",
                  variant_id: "1",
                  variant_name: "Some",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: undefined,
                      value: "0.65",
                    },
                  ],
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "identical_asset_type",
                  variant_id: "1",
                  variant_name: "Some",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: undefined,
                      value: "0.65",
                    },
                  ],
                },
                {
                  kind: "Map",
                  type_name: undefined,
                  field_name: "resource",
                  key_kind: "Reference",
                  key_type_name: "ResourceAddress",
                  value_kind: "Decimal",
                  value_type_name: undefined,
                  entries: [],
                },
                {
                  kind: "Map",
                  type_name: undefined,
                  field_name: "asset_type",
                  key_kind: "U8",
                  key_type_name: undefined,
                  value_kind: "Decimal",
                  value_type_name: undefined,
                  entries: [],
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "default_value",
                  value: "0.65",
                },
              ],
            },
            {
              kind: "Tuple",
              type_name: "PoolConfig",
              field_name: "pool_config",
              fields: [
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "protocol_interest_fee_rate",
                  value: "0.3",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "protocol_flashloan_fee_rate",
                  value: "0.15",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "protocol_liquidation_fee_rate",
                  value: "0.08",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "flashloan_fee_rate",
                  value: "0.001",
                },
                {
                  kind: "U8",
                  type_name: undefined,
                  field_name: "asset_type",
                  value: "0",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "liquidation_bonus_rate",
                  value: "0",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "loan_close_factor",
                  value: "1",
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "deposit_limit",
                  variant_id: "0",
                  variant_name: "None",
                  fields: [],
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "borrow_limit",
                  variant_id: "0",
                  variant_name: "None",
                  fields: [],
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "utilization_limit",
                  variant_id: "0",
                  variant_name: "None",
                  fields: [],
                },
                {
                  kind: "I64",
                  type_name: undefined,
                  field_name: "interest_update_period",
                  value: "1",
                },
                {
                  kind: "I64",
                  type_name: undefined,
                  field_name: "price_update_period",
                  value: "4",
                },
                {
                  kind: "I64",
                  type_name: undefined,
                  field_name: "price_expiration_period",
                  value: "240",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "optimal_usage",
                  value: "0.45",
                },
              ],
            },
            {
              kind: "Tuple",
              type_name: "OperatingStatus",
              field_name: "operating_status",
              fields: [
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_contribute_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_redeem_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_deposit_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_withdraw_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_borrow_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_repay_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_liquidate_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
              ],
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "pool_utilization",
              value: "0.413256693271043874",
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "total_reserved_amount",
              value: "0",
            },
          ],
        },
      },
      last_updated_at_state_version: 337374975,
      is_locked: false,
    },
    {
      key: {
        raw_hex:
          "5c805dc6c1c4c98297d1ed4df973b6415a64806e6b606250c04a792d5f263ff3",
        programmatic_json: {
          kind: "Reference",
          type_name: "ResourceAddress",
          field_name: undefined,
          value:
            "resource_rdx1thrvr3xfs2tarm2dl9emvs26vjqxu6mqvfgvqjne940jv0lnrrg7rw",
        },
      },
      value: {
        raw_hex:
          "5c211380c004f4d05375c84536a050ef3c657ba2d2167158f46cc4e46bb2ece8c5a39058c6c103dcaee592cc59a2f31940acf35628593e0a7899f57dedd1c9064c9058ad9fd036f0eb2ce0a51abba66ea9aa349c0f69279c2d920889c3538430805dc6c1c4c98297d1ed4df973b6415a64806e6b606250c04a792d5f263ff3a000b84baed8b748d70600000000000000000000000000000005fcc1826800000000a08ce479a40d817c000000000000000000000000000000000005fcc1826800000000b0b29a3523189505d6c6c3771c43bd1ed310000000000000000000000000000000b0b69c9072eab18353f99a7c262d771a0118000000000000000000000000000000b0cacb4c313fa1f283b8e249ef04cd016d0d000000000000000000000000000000b014987df02338f25c6dabf648c5976ad21400000000000000000000000000000080c0cbdff270dee98aa95ea26ef1de366013c0b6ff49eab9dbae8041aec3d821012103a0000000000000000000000000000000000000000000000000a0000004bfc91b8e0000000000000000000000000000000000a000008bbd0689680a000000000000000000000000000000002105220101a000008bbd0689680a00000000000000000000000000000000220101a000008bbd0689680a000000000000000000000000000000002380a0002307a000a000008bbd0689680a00000000000000000000000000000000210ea0000014bbf08ac60200000000000000000000000000000000a000004f8c34e8140200000000000000000000000000000000a00000087e93371c0100000000000000000000000000000000a00080c6a47e8d0300000000000000000000000000000000000701a0000000000000000000000000000000000000000000000000a0000064a7b3b6e00d0000000000000000000000000000000022000022000022000005010000000000000005040000000000000005f000000000000000a0000050ecc22b1a0b000000000000000000000000000000002107210201010100210201010100210201010100210201010100210201010100210201010100210201010100a0f0da85d91015ba0900000000000000000000000000000000a08a852dd43900000000000000000000000000000000000000",
        programmatic_json: {
          kind: "Tuple",
          type_name: "LendingPoolState",
          field_name: undefined,
          fields: [
            {
              kind: "Reference",
              type_name: "GlobalSingleResourcePool",
              field_name: "pool",
              value:
                "component_rdx1cqz0f5znwhyy2d4q2rhncetm5tfpvu2c73kvfertktkw33drxcawk8",
            },
            {
              kind: "Own",
              type_name: "Vault",
              field_name: "collaterals",
              value:
                "internal_vault_rdx1trrvzq7u4mje9nze5te3js9v7dtzskf7pfufnataahgujpjvaz9uuu",
            },
            {
              kind: "Own",
              type_name: "Vault",
              field_name: "reserve",
              value:
                "internal_vault_rdx1tzkel5pk7r4jec99r2a6vm4f4g6fcrmfy7wzmysg38p48ppsrrgpax",
            },
            {
              kind: "Reference",
              type_name: "ResourceAddress",
              field_name: "pool_res_address",
              value:
                "resource_rdx1thrvr3xfs2tarm2dl9emvs26vjqxu6mqvfgvqjne940jv0lnrrg7rw",
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "price",
              value: "126.1933155",
            },
            {
              kind: "I64",
              type_name: undefined,
              field_name: "price_updated_at",
              value: "1753399804",
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "interest_rate",
              value: "0.035044792706131084",
            },
            {
              kind: "I64",
              type_name: undefined,
              field_name: "interest_updated_at",
              value: "1753399804",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_loan",
              value: "5725.14458544390105502384685371655281733",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_deposit",
              value: "8168.243451000551161221450631815504108726",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_loan_unit",
              value: "4568.565972094552028238174872754029644746",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_deposit_unit",
              value: "7085.338679274985587019047581659934070804",
            },
            {
              kind: "Reference",
              type_name: "ComponentAddress",
              field_name: "price_feed_comp",
              value:
                "component_rdx1cr9alunsmm5c42275fh0rh3kvqfupdhlf84tnkawspq6as7cysqn98",
            },
            {
              kind: "Tuple",
              type_name: "InterestStrategy",
              field_name: "interest_strategy",
              fields: [
                {
                  kind: "Tuple",
                  type_name: "InterestStrategyBreakPoints",
                  field_name: "break_points",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: "r0",
                      value: "0",
                    },
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: "r1",
                      value: "0.04",
                    },
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: "r2",
                      value: "0.75",
                    },
                  ],
                },
              ],
            },
            {
              kind: "Tuple",
              type_name: "LiquidationThreshold",
              field_name: "liquidation_threshold",
              fields: [
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "identical_resource",
                  variant_id: "1",
                  variant_name: "Some",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: undefined,
                      value: "0.75",
                    },
                  ],
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "identical_asset_type",
                  variant_id: "1",
                  variant_name: "Some",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: undefined,
                      value: "0.75",
                    },
                  ],
                },
                {
                  kind: "Map",
                  type_name: undefined,
                  field_name: "resource",
                  key_kind: "Reference",
                  key_type_name: "ResourceAddress",
                  value_kind: "Decimal",
                  value_type_name: undefined,
                  entries: [],
                },
                {
                  kind: "Map",
                  type_name: undefined,
                  field_name: "asset_type",
                  key_kind: "U8",
                  key_type_name: undefined,
                  value_kind: "Decimal",
                  value_type_name: undefined,
                  entries: [],
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "default_value",
                  value: "0.75",
                },
              ],
            },
            {
              kind: "Tuple",
              type_name: "PoolConfig",
              field_name: "pool_config",
              fields: [
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "protocol_interest_fee_rate",
                  value: "0.2",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "protocol_flashloan_fee_rate",
                  value: "0.15",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "protocol_liquidation_fee_rate",
                  value: "0.08",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "flashloan_fee_rate",
                  value: "0.001",
                },
                {
                  kind: "U8",
                  type_name: undefined,
                  field_name: "asset_type",
                  value: "1",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "liquidation_bonus_rate",
                  value: "0",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "loan_close_factor",
                  value: "1",
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "deposit_limit",
                  variant_id: "0",
                  variant_name: "None",
                  fields: [],
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "borrow_limit",
                  variant_id: "0",
                  variant_name: "None",
                  fields: [],
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "utilization_limit",
                  variant_id: "0",
                  variant_name: "None",
                  fields: [],
                },
                {
                  kind: "I64",
                  type_name: undefined,
                  field_name: "interest_update_period",
                  value: "1",
                },
                {
                  kind: "I64",
                  type_name: undefined,
                  field_name: "price_update_period",
                  value: "4",
                },
                {
                  kind: "I64",
                  type_name: undefined,
                  field_name: "price_expiration_period",
                  value: "240",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "optimal_usage",
                  value: "0.8",
                },
              ],
            },
            {
              kind: "Tuple",
              type_name: "OperatingStatus",
              field_name: "operating_status",
              fields: [
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_contribute_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_redeem_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_deposit_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_withdraw_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_borrow_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_repay_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_liquidate_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
              ],
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "pool_utilization",
              value: "0.70089585412262168",
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "total_reserved_amount",
              value: "0.00000024837288897",
            },
          ],
        },
      },
      last_updated_at_state_version: 337374975,
      is_locked: false,
    },
    {
      key: {
        raw_hex:
          "5c805d7811f8e8e73a1653215f9be0af36b1760b934fa091b8463bc405999fe5",
        programmatic_json: {
          kind: "Reference",
          type_name: "ResourceAddress",
          field_name: undefined,
          value:
            "resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf",
        },
      },
      value: {
        raw_hex:
          "5c211380c03e9dbb776ec2ffcea8ee47dac2d389051786b6a420cf7c09fa2ef1cb3d90588963f3caa72d099c99615639499229f2e8d213a5cd21c74988abf288ff90585c32fe3245401644e370ebc09355e93fb3731ba8d22872e685ebc0aec0805d7811f8e8e73a1653215f9be0af36b1760b934fa091b8463bc405999fe5a000e0e82f2a89f3d60600000000000000000000000000000005fcc1826800000000a04fe8577895af8a000000000000000000000000000000000005fcc1826800000000b0fd1b21015dbd2f55a887a5a4da805a1576020000000000000000000000000000b0d30c006f10d4dd59a36f3027da4a63d55c030000000000000000000000000000b02f21961fffcf0af127334824d7cea6e71e020000000000000000000000000000b04b6fd4c72bdfde3a5a1eb62c5445ffbb0a03000000000000000000000000000080c0cbdff270dee98aa95ea26ef1de366013c0b6ff49eab9dbae8041aec3d821012103a0000000000000000000000000000000000000000000000000a0000004bfc91b8e0000000000000000000000000000000000a000008bbd0689680a000000000000000000000000000000002105220101a0000050ecc22b1a0b00000000000000000000000000000000220101a0000050ecc22b1a0b000000000000000000000000000000002380a0002307a000a0000050ecc22b1a0b00000000000000000000000000000000210ea0000014bbf08ac60200000000000000000000000000000000a000004f8c34e8140200000000000000000000000000000000a00000087e93371c0100000000000000000000000000000000a00080c6a47e8d0300000000000000000000000000000000000701a0000000000000000000000000000000000000000000000000a0000064a7b3b6e00d0000000000000000000000000000000022000022000022000005010000000000000005040000000000000005f000000000000000a000008bbd0689680a000000000000000000000000000000002107210201010100210201010100210201010100210201010100210201010100210201010100210201010100a0cc437090325c280a00000000000000000000000000000000a006fb2a66edffffffffffffffffffffffffffffffffffffff",
        programmatic_json: {
          kind: "Tuple",
          type_name: "LendingPoolState",
          field_name: undefined,
          fields: [
            {
              kind: "Reference",
              type_name: "GlobalSingleResourcePool",
              field_name: "pool",
              value:
                "component_rdx1cqlfmwmhdmp0ln4gaera4skn3yz30p4k5ssv7lqflgh0rjeakwzs9f",
            },
            {
              kind: "Own",
              type_name: "Vault",
              field_name: "collaterals",
              value:
                "internal_vault_rdx1tzyk8u725uksn8yev9trjjvj98ew35sn5hxjr36f3z4l9z8l0kny5d",
            },
            {
              kind: "Own",
              type_name: "Vault",
              field_name: "reserve",
              value:
                "internal_vault_rdx1tpwr9l3jg4qpv38rwr4upy64aylmxucm4rfzsuhxsh4uptkqpty4qa",
            },
            {
              kind: "Reference",
              type_name: "ResourceAddress",
              field_name: "pool_res_address",
              value:
                "resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf",
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "price",
              value: "126.1693388",
            },
            {
              kind: "I64",
              type_name: undefined,
              field_name: "price_updated_at",
              value: "1753399804",
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "interest_rate",
              value: "0.039036603290085455",
            },
            {
              kind: "I64",
              type_name: undefined,
              field_name: "interest_updated_at",
              value: "1753399804",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_loan",
              value: "214406.274868291107700262593765484513008637",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_deposit",
              value: "292926.476670680439176717483189218347846867",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_loan_unit",
              value: "184740.960654675141582577155881688305639727",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_deposit_unit",
              value: "264989.572541556096035213947960505136344907",
            },
            {
              kind: "Reference",
              type_name: "ComponentAddress",
              field_name: "price_feed_comp",
              value:
                "component_rdx1cr9alunsmm5c42275fh0rh3kvqfupdhlf84tnkawspq6as7cysqn98",
            },
            {
              kind: "Tuple",
              type_name: "InterestStrategy",
              field_name: "interest_strategy",
              fields: [
                {
                  kind: "Tuple",
                  type_name: "InterestStrategyBreakPoints",
                  field_name: "break_points",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: "r0",
                      value: "0",
                    },
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: "r1",
                      value: "0.04",
                    },
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: "r2",
                      value: "0.75",
                    },
                  ],
                },
              ],
            },
            {
              kind: "Tuple",
              type_name: "LiquidationThreshold",
              field_name: "liquidation_threshold",
              fields: [
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "identical_resource",
                  variant_id: "1",
                  variant_name: "Some",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: undefined,
                      value: "0.8",
                    },
                  ],
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "identical_asset_type",
                  variant_id: "1",
                  variant_name: "Some",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: undefined,
                      value: "0.8",
                    },
                  ],
                },
                {
                  kind: "Map",
                  type_name: undefined,
                  field_name: "resource",
                  key_kind: "Reference",
                  key_type_name: "ResourceAddress",
                  value_kind: "Decimal",
                  value_type_name: undefined,
                  entries: [],
                },
                {
                  kind: "Map",
                  type_name: undefined,
                  field_name: "asset_type",
                  key_kind: "U8",
                  key_type_name: undefined,
                  value_kind: "Decimal",
                  value_type_name: undefined,
                  entries: [],
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "default_value",
                  value: "0.8",
                },
              ],
            },
            {
              kind: "Tuple",
              type_name: "PoolConfig",
              field_name: "pool_config",
              fields: [
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "protocol_interest_fee_rate",
                  value: "0.2",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "protocol_flashloan_fee_rate",
                  value: "0.15",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "protocol_liquidation_fee_rate",
                  value: "0.08",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "flashloan_fee_rate",
                  value: "0.001",
                },
                {
                  kind: "U8",
                  type_name: undefined,
                  field_name: "asset_type",
                  value: "1",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "liquidation_bonus_rate",
                  value: "0",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "loan_close_factor",
                  value: "1",
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "deposit_limit",
                  variant_id: "0",
                  variant_name: "None",
                  fields: [],
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "borrow_limit",
                  variant_id: "0",
                  variant_name: "None",
                  fields: [],
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "utilization_limit",
                  variant_id: "0",
                  variant_name: "None",
                  fields: [],
                },
                {
                  kind: "I64",
                  type_name: undefined,
                  field_name: "interest_update_period",
                  value: "1",
                },
                {
                  kind: "I64",
                  type_name: undefined,
                  field_name: "price_update_period",
                  value: "4",
                },
                {
                  kind: "I64",
                  type_name: undefined,
                  field_name: "price_expiration_period",
                  value: "240",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "optimal_usage",
                  value: "0.75",
                },
              ],
            },
            {
              kind: "Tuple",
              type_name: "OperatingStatus",
              field_name: "operating_status",
              fields: [
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_contribute_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_redeem_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_deposit_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_withdraw_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_borrow_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_repay_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_liquidate_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
              ],
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "pool_utilization",
              value: "0.731936311689102284",
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "total_reserved_amount",
              value: "-0.000000079890285818",
            },
          ],
        },
      },
      last_updated_at_state_version: 337374975,
      is_locked: false,
    },
    {
      key: {
        raw_hex:
          "5c805dce706254813e545edd520bff2dd52f984a1b42ef56462136761393ccb2",
        programmatic_json: {
          kind: "Reference",
          type_name: "ResourceAddress",
          field_name: undefined,
          value:
            "resource_rdx1th88qcj5syl9ghka2g9l7tw497vy5x6zaatyvgfkwcfe8n9jt2npww",
        },
      },
      value: {
        raw_hex:
          "5c211380c0cfe69a9fe9a694b6c4655301bb708ef4a664c8264a62982620d9a8a04190584158eade12f036e0f29049d91e6bfcef88f88c42ebde617b8e5e6ff1d9905872764c4c06c83ed11842953962d4336027e6550eec8dd550a17d6d0ae4805dce706254813e545edd520bff2dd52f984a1b42ef56462136761393ccb2a0008052bb5c6d6a343c63000000000000000000000000000005f8c1826800000000a0a1501a3274ac05000000000000000000000000000000000005f8c1826800000000b0553596ab1c77bb40fe6057d8c9050b0000000000000000000000000000000000b00351876a8673fc58ad341248d848640200000000000000000000000000000000b0c9d3204af04e016a59972f2ccda3030000000000000000000000000000000000b0b3722a8132faf324cc4db3ec6dbef1010000000000000000000000000000000080c0cbdff270dee98aa95ea26ef1de366013c0b6ff49eab9dbae8041aec3d821012103a0000000000000000000000000000000000000000000000000a0000004bfc91b8e0000000000000000000000000000000000a000002cf61a24a229000000000000000000000000000000002105220101a000008bbd0689680a00000000000000000000000000000000220101a000008bbd0689680a000000000000000000000000000000002380a0002307a000a000008bbd0689680a00000000000000000000000000000000210ea00000d9e9ac2d780300000000000000000000000000000000a000004f8c34e8140200000000000000000000000000000000a00000087e93371c0100000000000000000000000000000000a00080c6a47e8d0300000000000000000000000000000000000700a0000000000000000000000000000000000000000000000000a0000064a7b3b6e00d0000000000000000000000000000000022000022000022000005010000000000000005040000000000000005f000000000000000a00000eda49db83e06000000000000000000000000000000002107210201010100210201010100210201010100210201010100210201010100210201010100210201010100a01d0ba8331bd43f0000000000000000000000000000000000a0000000000000000000000000000000000000000000000000",
        programmatic_json: {
          kind: "Tuple",
          type_name: "LendingPoolState",
          field_name: undefined,
          fields: [
            {
              kind: "Reference",
              type_name: "GlobalSingleResourcePool",
              field_name: "pool",
              value:
                "component_rdx1cr87dx5laxnffdkyv4fsrwms3m62vexgye9x9xpxyrv63gzpgwt97d",
            },
            {
              kind: "Own",
              type_name: "Vault",
              field_name: "collaterals",
              value:
                "internal_vault_rdx1tpq436k7ztcrdc8jjpyaj8ntlnhc37yvgt4auctm3e0xluwe33ldj3",
            },
            {
              kind: "Own",
              type_name: "Vault",
              field_name: "reserve",
              value:
                "internal_vault_rdx1tpe8vnzvqmyra5gcg22njck5xdsz0ej4pmkgm42s597k6zhy2ppyfa",
            },
            {
              kind: "Reference",
              type_name: "ResourceAddress",
              field_name: "pool_res_address",
              value:
                "resource_rdx1th88qcj5syl9ghka2g9l7tw497vy5x6zaatyvgfkwcfe8n9jt2npww",
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "price",
              value: "468624.8634",
            },
            {
              kind: "I64",
              type_name: undefined,
              field_name: "price_updated_at",
              value: "1753399800",
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "interest_rate",
              value: "0.001596989940322465",
            },
            {
              kind: "I64",
              type_name: undefined,
              field_name: "interest_updated_at",
              value: "1753399800",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_loan",
              value: "0.057232669306963434434622093224457557",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_deposit",
              value: "3.179163146502810642673977398319862019",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_loan_unit",
              value: "0.018899178789189801752581276075873225",
            },
            {
              kind: "PreciseDecimal",
              type_name: undefined,
              field_name: "total_deposit_unit",
              value: "2.584433905641444631139178089936482995",
            },
            {
              kind: "Reference",
              type_name: "ComponentAddress",
              field_name: "price_feed_comp",
              value:
                "component_rdx1cr9alunsmm5c42275fh0rh3kvqfupdhlf84tnkawspq6as7cysqn98",
            },
            {
              kind: "Tuple",
              type_name: "InterestStrategy",
              field_name: "interest_strategy",
              fields: [
                {
                  kind: "Tuple",
                  type_name: "InterestStrategyBreakPoints",
                  field_name: "break_points",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: "r0",
                      value: "0",
                    },
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: "r1",
                      value: "0.04",
                    },
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: "r2",
                      value: "3",
                    },
                  ],
                },
              ],
            },
            {
              kind: "Tuple",
              type_name: "LiquidationThreshold",
              field_name: "liquidation_threshold",
              fields: [
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "identical_resource",
                  variant_id: "1",
                  variant_name: "Some",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: undefined,
                      value: "0.75",
                    },
                  ],
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "identical_asset_type",
                  variant_id: "1",
                  variant_name: "Some",
                  fields: [
                    {
                      kind: "Decimal",
                      type_name: undefined,
                      field_name: undefined,
                      value: "0.75",
                    },
                  ],
                },
                {
                  kind: "Map",
                  type_name: undefined,
                  field_name: "resource",
                  key_kind: "Reference",
                  key_type_name: "ResourceAddress",
                  value_kind: "Decimal",
                  value_type_name: undefined,
                  entries: [],
                },
                {
                  kind: "Map",
                  type_name: undefined,
                  field_name: "asset_type",
                  key_kind: "U8",
                  key_type_name: undefined,
                  value_kind: "Decimal",
                  value_type_name: undefined,
                  entries: [],
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "default_value",
                  value: "0.75",
                },
              ],
            },
            {
              kind: "Tuple",
              type_name: "PoolConfig",
              field_name: "pool_config",
              fields: [
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "protocol_interest_fee_rate",
                  value: "0.25",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "protocol_flashloan_fee_rate",
                  value: "0.15",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "protocol_liquidation_fee_rate",
                  value: "0.08",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "flashloan_fee_rate",
                  value: "0.001",
                },
                {
                  kind: "U8",
                  type_name: undefined,
                  field_name: "asset_type",
                  value: "0",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "liquidation_bonus_rate",
                  value: "0",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "loan_close_factor",
                  value: "1",
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "deposit_limit",
                  variant_id: "0",
                  variant_name: "None",
                  fields: [],
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "borrow_limit",
                  variant_id: "0",
                  variant_name: "None",
                  fields: [],
                },
                {
                  kind: "Enum",
                  type_name: "Option",
                  field_name: "utilization_limit",
                  variant_id: "0",
                  variant_name: "None",
                  fields: [],
                },
                {
                  kind: "I64",
                  type_name: undefined,
                  field_name: "interest_update_period",
                  value: "1",
                },
                {
                  kind: "I64",
                  type_name: undefined,
                  field_name: "price_update_period",
                  value: "4",
                },
                {
                  kind: "I64",
                  type_name: undefined,
                  field_name: "price_expiration_period",
                  value: "240",
                },
                {
                  kind: "Decimal",
                  type_name: undefined,
                  field_name: "optimal_usage",
                  value: "0.45",
                },
              ],
            },
            {
              kind: "Tuple",
              type_name: "OperatingStatus",
              field_name: "operating_status",
              fields: [
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_contribute_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_redeem_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_deposit_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_withdraw_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_borrow_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_repay_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
                {
                  kind: "Tuple",
                  type_name: "OperatingStatusValue",
                  field_name: "is_liquidate_enabled",
                  fields: [
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "enabled",
                      value: true,
                    },
                    {
                      kind: "Bool",
                      type_name: undefined,
                      field_name: "set_by_admin",
                      value: false,
                    },
                  ],
                },
              ],
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "pool_utilization",
              value: "0.017966136828627741",
            },
            {
              kind: "Decimal",
              type_name: undefined,
              field_name: "total_reserved_amount",
              value: "0",
            },
          ],
        },
      },
      last_updated_at_state_version: 337374938,
      is_locked: false,
    },
  ],
} as {
  key_value_store_address: string;
  ledger_state: LedgerState;
  entries: StateKeyValueStoreDataResponseItem[];
};
