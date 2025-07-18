import s from "sbor-ez-mode";

// Generated TypeScript schema for Scrypto SBOR types of package address: package_rdx1phwak2lr7nczzl6rxzvtnjwszmvxqycp9h8pckcmy6uwdcucnjeu0p
// Generated by: https://www.8arms1goal.com/sbor-ez-mode-ez-mode

export const OperatingStatusValue = s.struct({
  enabled: s.number(),
  set_by_admin: s.number(),
});

export const OperatingStatus = s.struct({
  is_contribute_enabled: OperatingStatusValue,
  is_redeem_enabled: OperatingStatusValue,
  is_deposit_enabled: OperatingStatusValue,
  is_withdraw_enabled: OperatingStatusValue,
  is_borrow_enabled: OperatingStatusValue,
  is_repay_enabled: OperatingStatusValue,
  is_liquidate_enabled: OperatingStatusValue,
});

export const CDPUpdatedEvenType = s.enum([
  { variant: "AddCollateral", schema: s.tuple([]) },
  { variant: "RemoveCollateral", schema: s.tuple([]) },
  { variant: "Borrow", schema: s.tuple([]) },
  { variant: "Repay", schema: s.tuple([]) },
  { variant: "Liquidate", schema: s.tuple([]) },
]);

export const LendingPoolUpdatedEventType = s.enum([
  { variant: "DepositState", schema: s.tuple([]) },
  { variant: "LoanState", schema: s.tuple([]) },
  { variant: "CollateralState", schema: s.tuple([]) },
  { variant: "Interest", schema: s.tuple([]) },
  { variant: "Price", schema: s.tuple([]) },
]);

export const CDPUpdatedEvent = s.struct({
  cdp_id: s.nonFungibleLocalId(),
  event_type: CDPUpdatedEvenType,
});

export type CDPUpdatedEvent = s.infer<typeof CDPUpdatedEvent>;

export type CDPLiquidableEvent = s.infer<typeof CDPLiquidableEvent>;

export type LendingPoolUpdatedEvent = s.infer<typeof LendingPoolUpdatedEvent>;

export const MarketConfig = s.struct({
  max_cdp_position: s.number(),
  max_liquidable_value: s.decimal(),
  liquidation_dex_swap_rate: s.decimal(),
});

export const NonFungibleGlobalId = s.struct({
  resource_address: s.address(),
  local_id: s.nonFungibleLocalId(),
});

export const ResourceOrNonFungible = s.enum([
  { variant: "NonFungible", schema: s.tuple([NonFungibleGlobalId]) },
  { variant: "Resource", schema: s.tuple([NonFungibleGlobalId]) },
]);

export const ProofRule = s.enum([
  { variant: "Require", schema: s.tuple([ResourceOrNonFungible]) },
  { variant: "AmountOf", schema: s.tuple([ResourceOrNonFungible]) },
  { variant: "CountOf", schema: s.tuple([ResourceOrNonFungible]) },
  { variant: "AllOf", schema: s.tuple([ResourceOrNonFungible]) },
  { variant: "AnyOf", schema: s.tuple([ResourceOrNonFungible]) },
]);

export const AccessRuleNode = s.enum([
  { variant: "ProofRule", schema: s.tuple([ProofRule]) },
  { variant: "AnyOf", schema: s.tuple([ProofRule]) },
  { variant: "AllOf", schema: s.tuple([ProofRule]) },
]);

export const AccessRule = s.enum([
  { variant: "AllowAll", schema: s.tuple([]) },
  { variant: "DenyAll", schema: s.tuple([]) },
  { variant: "Protected", schema: s.tuple([]) },
]);

export const LendingMarket = s.struct({
  admin_rule: AccessRule,
  cdp_res_manager: s.address(),
  cdp_counter: s.number(),
  liquidator_counter: s.number(),
  market_component_address: s.address(),
  pool_unit_refs: s.map({ key: s.address(), value: s.address() }),
  reverse_pool_unit_refs: s.map({ key: s.address(), value: s.address() }),
  listed_assets: s.array(s.address()),
  pool_states: s.internalAddress(),
  transient_res_manager: s.address(),
  liquidator_badge_manager: s.address(),
  operating_status: OperatingStatus,
  market_config: MarketConfig,
});

export const LendingPoolUpdatedEvent = s.struct({
  pool_res_address: s.address(),
  event_type: LendingPoolUpdatedEventType,
  amount: s.decimal(),
});

export const CDPType = s.enum([{ variant: "Standard", schema: s.tuple([]) }]);

export const CollaterizedDebtPositionData = s.struct({
  key_image_url: s.string(),
  name: s.string(),
  description: s.string(),
  minted_at: s.number(),
  updated_at: s.number(),
  cdp_type: CDPType,
  collaterals: s.map({ key: s.address(), value: s.decimal() }),
  loans: s.map({ key: s.address(), value: s.decimal() }),
  liquidable: s.option(s.decimal()),
});

export type CollaterizedDebtPositionData = s.infer<
  typeof CollaterizedDebtPositionData
>;

export const CDPLiquidable = s.struct({
  cdp_data: CollaterizedDebtPositionData,
  cdp_id: s.nonFungibleLocalId(),
});

export const CDPLiquidableEvent = s.struct({
  cdps: s.array(CDPLiquidable),
});

export const LendingPoolState = s.struct({
  pool: s.address(),
  collaterals: s.internalAddress(),
  reserve: s.internalAddress(),
  pool_res_address: s.address(),
  price: s.decimal(),
  price_updated_at: s.number(),
  interest_rate: s.decimal(),
  interest_updated_at: s.number(),
  total_loan: s.decimal(),
  total_deposit: s.decimal(),
  total_loan_unit: s.decimal(),
  total_deposit_unit: s.decimal(),
  price_feed_comp: s.address(),
  interest_strategy: s.struct({
    break_points: s.struct({
      r0: s.decimal(),
      r1: s.decimal(),
      r2: s.decimal(),
    }),
  }),
  liquidation_threshold: s.struct({
    identical_resource: s.option(s.decimal()),
    identical_asset_type: s.option(s.decimal()),
    resource: s.map({ key: s.address(), value: s.decimal() }),
    asset_type: s.map({ key: s.number(), value: s.decimal() }),
    default_value: s.decimal(),
  }),
  pool_config: s.struct({
    protocol_interest_fee_rate: s.decimal(),
    protocol_flashloan_fee_rate: s.decimal(),
    protocol_liquidation_fee_rate: s.decimal(),
    flashloan_fee_rate: s.decimal(),
    asset_type: s.number(),
    liquidation_bonus_rate: s.decimal(),
    loan_close_factor: s.decimal(),
    deposit_limit: s.option(s.decimal()),
    borrow_limit: s.option(s.decimal()),
    utilization_limit: s.option(s.decimal()),
    interest_update_period: s.number(),
    price_update_period: s.number(),
    price_expiration_period: s.number(),
    optimal_usage: s.decimal(),
  }),
  operating_status: s.struct({
    is_contribute_enabled: s.struct({
      enabled: s.bool(),
      set_by_admin: s.bool(),
    }),
    is_redeem_enabled: s.struct({
      enabled: s.bool(),
      set_by_admin: s.bool(),
    }),
    is_deposit_enabled: s.struct({
      enabled: s.bool(),
      set_by_admin: s.bool(),
    }),
    is_withdraw_enabled: s.struct({
      enabled: s.bool(),
      set_by_admin: s.bool(),
    }),
    is_borrow_enabled: s.struct({
      enabled: s.bool(),
      set_by_admin: s.bool(),
    }),
    is_repay_enabled: s.struct({
      enabled: s.bool(),
      set_by_admin: s.bool(),
    }),
    is_liquidate_enabled: s.struct({
      enabled: s.bool(),
      set_by_admin: s.bool(),
    }),
  }),
  pool_utilization: s.decimal(),
  total_reserved_amount: s.decimal(),
});

// Schema for safely parsing pool states key-value store keys
export const PoolStatesKeyValueStoreKeySchema = s.address();
