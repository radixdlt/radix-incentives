import s from "sbor-ez-mode";

export const ServiceManager = s.struct({
  entries: s.internalAddress(),
});

export const UpdateSetInput_105 = s.enum([
  { variant: "Add", schema: s.tuple([s.number()]) },
  { variant: "Remove", schema: s.tuple([s.number()]) },
]);

export const UpdateCollateralResourceConfigInput = s.enum([
  { variant: "CollateralConfigId", schema: s.tuple([s.number()]) },
  { variant: "IsolationGroupId", schema: s.tuple([s.number()]) },
  { variant: "EfficiencyGroupIds", schema: s.tuple([s.number()]) },
]);

export const UpdateLoanResourceConfigInput = s.enum([
  { variant: "LoanConfigId", schema: s.tuple([s.number()]) },
  { variant: "ExcludedIsolationGroupIds", schema: s.tuple([s.number()]) },
  { variant: "EfficiencyGroupId", schema: s.tuple([s.number()]) },
]);

export const CollateralResourceConfig = s.struct({
  collateral_config_id: s.number(),
  isolation_group_id: s.option(s.number()),
  efficiency_group_ids: s.array(s.number()),
});

export const LoanResourceConfig = s.struct({
  loan_config_id: s.number(),
  excluded_isolation_group_ids: s.array(s.number()),
  efficiency_group_id: s.option(s.number()),
});

export const PriceFeedComponentSignature = s.enum([
  { variant: "PriceAndTimestamp", schema: s.tuple([]) },
  { variant: "TimestampAndPrice", schema: s.tuple([]) },
  { variant: "OptionPriceAndTimestamp", schema: s.tuple([]) },
  { variant: "OptionTimestampAndPrice", schema: s.tuple([]) },
]);

export const LendingPoolProxy = s.struct({
  lending_pool: s.address(),
  client_badge: s.internalAddress(),
  loan_unit_ratio_cache: s.internalAddress(),
  deposit_unit_ratio_cache: s.internalAddress(),
});

export const UpdateIsolationGroupInput = s.enum([
  { variant: "Description", schema: s.tuple([s.string()]) },
]);

export const UpdateEfficiencyGroupInput = s.enum([
  { variant: "Description", schema: s.tuple([s.string()]) },
  { variant: "CollateralConfigId", schema: s.tuple([s.string()]) },
]);

export const EfficiencyGroup = s.struct({
  description: s.string(),
  collateral_config_id: s.number(),
});

export const IsolationGroup = s.struct({
  description: s.string(),
});

export const PriceFeedComponentInfo = s.struct({
  component_address: s.address(),
  method_name: s.string(),
  method_signature: PriceFeedComponentSignature,
});

export const StatusChangeType = s.enum([
  { variant: "AdminSetAndLock", schema: s.tuple([]) },
  { variant: "AdminSetAndUnlock", schema: s.tuple([]) },
  { variant: "ModeratorSet", schema: s.tuple([]) },
]);

export const CollateralService = s.enum([
  { variant: "Add", schema: s.tuple([]) },
  { variant: "Remove", schema: s.tuple([]) },
  { variant: "FlashOperation", schema: s.tuple([]) },
  { variant: "RemoveForLiquidation", schema: s.tuple([]) },
]);

export const LoanService = s.enum([
  { variant: "Borrow", schema: s.tuple([]) },
  { variant: "Repay", schema: s.tuple([]) },
  { variant: "RepayForRefinance", schema: s.tuple([]) },
  { variant: "RepayForLiquidation", schema: s.tuple([]) },
  { variant: "RepayForNFTLiquidation", schema: s.tuple([]) },
]);

export const OperatingStatus = s.struct({
  enabled: s.number(),
  locked: s.number(),
});

export const ServiceStatus = s.tuple([
  s.map({ key: s.tuple([]), value: OperatingStatus }),
]);

export const MarketService = s.enum([
  { variant: "CreateCDP", schema: s.tuple([]) },
  { variant: "UpdateCDP", schema: s.tuple([]) },
  { variant: "BurnCDP", schema: s.tuple([]) },
]);

export const ConfigurationManager_138 = s.struct({
  track_history: s.number(),
  get_config_error_message: s.string(),
  default_expiration_time: s.option(s.number()),
  version_count: s.number(),
  entry_count: s.number(),
  entries: s.internalAddress(),
  phantom_data: s.option(s.array(UpdateEfficiencyGroupInput)),
});

export const ConfigurationManager_136 = s.struct({
  track_history: s.number(),
  get_config_error_message: s.string(),
  default_expiration_time: s.option(s.number()),
  version_count: s.number(),
  entry_count: s.number(),
  entries: s.internalAddress(),
  phantom_data: s.option(s.array(UpdateIsolationGroupInput)),
});

export const PriceCacheMode = s.enum([
  { variant: "Hash", schema: s.tuple([]) },
  { variant: "Debounce", schema: s.tuple([]) },
]);

export const CollateralConfigVersionExpired = s.tuple([s.number()]);

export const LoanConfigVersionExpired = s.tuple([s.number()]);

export const MarketProtocolFeeConfig = s.struct({
  protocol_cdp_creation_fee: s.decimal(),
  protocol_liquidation_bonus_fee_rate: s.decimal(),
});

export const UpdateCollateralConfigInput = s.enum([
  { variant: "Description", schema: s.tuple([s.string()]) },
  { variant: "LoanToValueRatio", schema: s.tuple([s.string()]) },
  { variant: "LiquidationThresholdSpread", schema: s.tuple([s.string()]) },
  { variant: "LiquidationBonusRate", schema: s.tuple([s.string()]) },
]);

export const ConfigurationManager_134 = s.struct({
  track_history: s.number(),
  get_config_error_message: s.string(),
  default_expiration_time: s.option(s.number()),
  version_count: s.number(),
  entry_count: s.number(),
  entries: s.internalAddress(),
  phantom_data: s.option(s.array(UpdateCollateralConfigInput)),
});

export const UpdateLoanConfigInput = s.enum([
  { variant: "Description", schema: s.tuple([s.string()]) },
  { variant: "LoanValueFactor", schema: s.tuple([s.string()]) },
  { variant: "LoanCloseFactor", schema: s.tuple([s.string()]) },
]);

export const ConfigurationManager_132 = s.struct({
  track_history: s.number(),
  get_config_error_message: s.string(),
  default_expiration_time: s.option(s.number()),
  version_count: s.number(),
  entry_count: s.number(),
  entries: s.internalAddress(),
  phantom_data: s.option(s.array(UpdateLoanConfigInput)),
});

export const MarketConfig = s.struct({
  cdp_max_positions: s.number(),
  cdp_with_nft_collateral_max_positions: s.number(),
  price_expiration_period: s.number(),
  price_cache_mode: s.tuple([]),
  default_efficiency_config_id: s.option(s.number()),
  max_claim_nft_value: s.option(s.decimal()),
});

export const UpdateMarketConfigInput = s.enum([
  { variant: "CdpMaxPositions", schema: s.tuple([s.number()]) },
  {
    variant: "CdpWithNftCollateralMaxPositions",
    schema: s.tuple([s.number()]),
  },
  { variant: "PriceExpirationPeriod", schema: s.tuple([s.number()]) },
  { variant: "PriceCacheMode", schema: s.tuple([s.number()]) },
  { variant: "DefaultEfficiencyConfigId", schema: s.tuple([s.number()]) },
  { variant: "MaxClaimNftValue", schema: s.tuple([s.number()]) },
]);

export const CollateralConfig = s.struct({
  description: s.string(),
  loan_to_value_ratio: s.decimal(),
  liquidation_threshold_spread: s.decimal(),
  liquidation_bonus_rate: s.decimal(),
});

export const LoanConfig = s.struct({
  description: s.string(),
  loan_value_factor: s.decimal(),
  loan_close_factor: s.decimal(),
});

export const UpdatePriceFeedInput = s.enum([
  { variant: "Description", schema: s.tuple([s.string()]) },
  { variant: "PriceFeedType", schema: s.tuple([s.string()]) },
]);

export const ConfigurationManager_130 = s.struct({
  track_history: s.number(),
  get_config_error_message: s.string(),
  default_expiration_time: s.option(s.number()),
  version_count: s.number(),
  entry_count: s.number(),
  entries: s.internalAddress(),
  phantom_data: s.option(s.array(UpdatePriceFeedInput)),
});

export const PriceFeedType = s.enum([
  { variant: "FixedPrice", schema: s.tuple([s.decimal()]) },
  { variant: "PriceFeedComponent", schema: s.tuple([s.decimal()]) },
]);

export const PriceFeed = s.struct({
  description: s.string(),
  price_feed_type: PriceFeedType,
});

export const UpdateMarketProtocolFeeConfigInput = s.enum([
  { variant: "ProtocolCdpCreationFee", schema: s.tuple([s.decimal()]) },
  {
    variant: "ProtocolLiquidationBonusFeeRate",
    schema: s.tuple([s.decimal()]),
  },
]);

export const FeeUpdateEvent = s.tuple([
  s.array(UpdateMarketProtocolFeeConfigInput),
]);

export const LendingMarket = s.struct({
  lending_pool_proxy: LendingPoolProxy,
  cdp_res_manager: s.address(),
  transient_res_manager: s.address(),
  cdp_counter: s.number(),
  config: MarketConfig,
  fee_config: MarketProtocolFeeConfig,
  market_service_status: ServiceStatus,
  loan_service_manager: ServiceManager,
  collateral_service_manager: ServiceManager,
  price_feed_manager: ConfigurationManager_130,
  loan_config_manager: ConfigurationManager_132,
  collateral_config_manager: ConfigurationManager_134,
  isolation_group_manager: ConfigurationManager_136,
  efficiency_group_manager: ConfigurationManager_138,
  resource_configs: s.internalAddress(),
  nft_collateral_resource_configs: s.internalAddress(),
  price_cache: s.internalAddress(),
  resource_type_cache: s.internalAddress(),
  nft_resource_type_cache: s.internalAddress(),
  nft_valuation_cache: s.internalAddress(),
  collateral_assets: s.internalAddress(),
  nft_collateral_assets: s.internalAddress(),
  cdp_creation_fees: s.internalAddress(),
  liquidation_fees: s.internalAddress(),
  nft_liquidation_fees: s.internalAddress(),
});

export const UpdateSetInput_113 = s.enum([
  { variant: "Add", schema: s.tuple([s.address()]) },
  { variant: "Remove", schema: s.tuple([s.address()]) },
]);

export const UpdateNFTCollateralConfigInput = s.enum([
  { variant: "ValuatorComponent", schema: s.tuple([s.address()]) },
  { variant: "ValuatorMethod", schema: s.tuple([s.address()]) },
  { variant: "UnderlyingResources", schema: s.tuple([s.address()]) },
  { variant: "MaxCollateralValue", schema: s.tuple([s.address()]) },
]);

export const MarketUpdateConfigItemInput = s.enum([
  {
    variant: "UpdateMarketConfig",
    schema: s.tuple([s.array(UpdateMarketConfigInput)]),
  },
  {
    variant: "UpdatePriceFeed",
    schema: s.tuple([s.array(UpdateMarketConfigInput)]),
  },
  {
    variant: "UpdateLoanConfig",
    schema: s.tuple([s.array(UpdateMarketConfigInput)]),
  },
  {
    variant: "UpdateDefaultLoanConfigExpiryPeriod",
    schema: s.tuple([s.array(UpdateMarketConfigInput)]),
  },
  {
    variant: "MarkLoanConfigExpired",
    schema: s.tuple([s.array(UpdateMarketConfigInput)]),
  },
  {
    variant: "UpdateCollateralConfig",
    schema: s.tuple([s.array(UpdateMarketConfigInput)]),
  },
  {
    variant: "UpdateDefaultCollateralConfigExpiryPeriod",
    schema: s.tuple([s.array(UpdateMarketConfigInput)]),
  },
  {
    variant: "MarkCollateralConfigExpired",
    schema: s.tuple([s.array(UpdateMarketConfigInput)]),
  },
  {
    variant: "UpdateEfficiencyGroup",
    schema: s.tuple([s.array(UpdateMarketConfigInput)]),
  },
  {
    variant: "UpdateIsolationGroup",
    schema: s.tuple([s.array(UpdateMarketConfigInput)]),
  },
  {
    variant: "UpdatePriceFeedId",
    schema: s.tuple([s.array(UpdateMarketConfigInput)]),
  },
  {
    variant: "UpdateLoanResourceConfig",
    schema: s.tuple([s.array(UpdateMarketConfigInput)]),
  },
  {
    variant: "UpdateCollateralResourceConfig",
    schema: s.tuple([s.array(UpdateMarketConfigInput)]),
  },
  {
    variant: "UpdateNFTCollateralConfig",
    schema: s.tuple([s.array(UpdateMarketConfigInput)]),
  },
]);

export const ConfigItemUpdateEvent = s.tuple([MarketUpdateConfigItemInput]);

export const NFTCollateralConfig = s.struct({
  valuator_component: s.address(),
  valuator_method: s.string(),
  underlying_resources: s.array(s.address()),
  max_collateral_value: s.option(s.decimal()),
});

export const RegisterNFTCollateralResourceInput = s.struct({
  res_address: s.address(),
  config: NFTCollateralConfig,
});

export const RegisterCollateralResourceInput = s.struct({
  res_address: s.address(),
  price_feed_id: s.number(),
  res_config: CollateralResourceConfig,
});

export const RegisterLoanResourceInput = s.struct({
  res_address: s.address(),
  price_feed_id: s.number(),
  res_config: LoanResourceConfig,
});

export const MarketCreateConfigItemInput = s.enum([
  { variant: "PriceFeed", schema: s.tuple([PriceFeed]) },
  { variant: "LoanConfig", schema: s.tuple([PriceFeed]) },
  { variant: "CollateralConfig", schema: s.tuple([PriceFeed]) },
  { variant: "IsolationGroupe", schema: s.tuple([PriceFeed]) },
  { variant: "EfficiencyGroup", schema: s.tuple([PriceFeed]) },
  { variant: "RegisterLoanResource", schema: s.tuple([PriceFeed]) },
  { variant: "RegisterCollateralResource", schema: s.tuple([PriceFeed]) },
  { variant: "RegisterNFTCollateralResource", schema: s.tuple([PriceFeed]) },
]);

export const ConfigItemCreationEvent = s.tuple([MarketCreateConfigItemInput]);

export const CollateralServiceKey = s.enum([
  { variant: "GlobalResource", schema: s.tuple([]) },
  { variant: "GlobalNFT", schema: s.tuple([]) },
  { variant: "GlobalLSU", schema: s.tuple([]) },
  { variant: "GlobalClaimNFT", schema: s.tuple([]) },
  { variant: "Resource", schema: s.tuple([]) },
  { variant: "NFT", schema: s.tuple([]) },
]);

export const LoanServiceKey = s.enum([
  { variant: "Global", schema: s.tuple([]) },
  { variant: "Resource", schema: s.tuple([]) },
]);

export const MarketUpdateServiceStatusInput = s.enum([
  {
    variant: "MarketServiceStatus",
    schema: s.tuple([s.map({ key: MarketService, value: s.number() })]),
  },
  {
    variant: "LoanServiceStatus",
    schema: s.tuple([s.map({ key: MarketService, value: s.number() })]),
  },
  {
    variant: "CollateralServiceStatus",
    schema: s.tuple([s.map({ key: MarketService, value: s.number() })]),
  },
]);

export const ServiceStatusUpdateEvent = s.tuple([
  s.tuple([MarketUpdateServiceStatusInput, StatusChangeType]),
]);

export const FeeEventData = s.struct({
  res_address: s.address(),
  fee_amount: s.decimal(),
  protocol_fee_amount: s.decimal(),
});

export const CDPCreationFeeEvent = s.tuple([FeeEventData]);

export const LiquidationBonusFeeEvent = s.tuple([FeeEventData]);

export const NFTLiquidationFeeEvent = s.tuple([FeeEventData]);

export const FeeCollectionEvent = s.tuple([
  s.tuple([s.address(), s.decimal()]),
]);

export const CDPNFTCollateralCompensation = s.struct({
  cdp_id: s.nonFungibleLocalId(),
  compensation_amount: s.decimal(),
});

export const CDPEventNFTData = s.struct({
  cdp_id: s.nonFungibleLocalId(),
  res_address: s.address(),
  nft_id: s.nonFungibleLocalId(),
  underlying_resources: s.map({ key: s.address(), value: s.decimal() }),
});

export const CDPRemoveNFTCollateralForLiquidation = s.tuple([CDPEventNFTData]);

export const FlashAddNFTCollateralEvent = s.tuple([CDPEventNFTData]);

export const FlashRemoveNFTCollateralEvent = s.tuple([CDPEventNFTData]);

export const RemoveNFTCollateralEvent = s.tuple([CDPEventNFTData]);

export const AddNFTCollateralEvent = s.tuple([CDPEventNFTData]);

export const CDPEventData = s.struct({
  cdp_id: s.nonFungibleLocalId(),
  res_address: s.address(),
  amount: s.decimal(),
});

export const AddCollateralEvent = s.tuple([CDPEventData]);

export const BorrowEvent = s.tuple([CDPEventData]);

export const CDPRepayForNFTLiquidationEvent = s.tuple([CDPEventData]);

export const RemoveCollateralEvent = s.tuple([CDPEventData]);

export const FlashRemoveCollateralEvent = s.tuple([CDPEventData]);

export const CDPRepayForLiquidationEvent = s.tuple([CDPEventData]);

export const RepayEvent = s.tuple([CDPEventData]);

export const FlashAddCollateralEvent = s.tuple([CDPEventData]);

export const CDPRepayForRefinanceEvent = s.tuple([CDPEventData]);

export const CDPRemoveCollateralForLiquidation = s.tuple([CDPEventData]);

export type AddCollateralEvent = s.infer<typeof AddCollateralEvent>;
export type BorrowEvent = s.infer<typeof BorrowEvent>;
export type RepayEvent = s.infer<typeof RepayEvent>;
export type RemoveCollateralEvent = s.infer<typeof RemoveCollateralEvent>;
export type RemoveNFTCollateralEvent = s.infer<typeof RemoveNFTCollateralEvent>;
export type AddNFTCollateralEvent = s.infer<typeof AddNFTCollateralEvent>;
export type CDPRepayForNFTLiquidationEvent = s.infer<
  typeof CDPRepayForNFTLiquidationEvent
>;
export type CDPRepayForLiquidationEvent = s.infer<
  typeof CDPRepayForLiquidationEvent
>;
export type CDPRepayForRefinanceEvent = s.infer<
  typeof CDPRepayForRefinanceEvent
>;
export type CDPRemoveCollateralForLiquidation = s.infer<
  typeof CDPRemoveCollateralForLiquidation
>;
export type FlashAddCollateralEvent = s.infer<typeof FlashAddCollateralEvent>;
export type FlashRemoveCollateralEvent = s.infer<
  typeof FlashRemoveCollateralEvent
>;
export type CDPCreationFeeEvent = s.infer<typeof CDPCreationFeeEvent>;
