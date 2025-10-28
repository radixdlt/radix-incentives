import s from 'sbor-ez-mode';

export const CdpStatus = s.enum([
  { variant: 'Healthy', schema: s.tuple([]) },
  { variant: 'Liquidated', schema: s.tuple([]) },
  { variant: 'Redeemed', schema: s.tuple([]) },
  { variant: 'Closed', schema: s.tuple([]) },
  { variant: 'Marked', schema: s.tuple([]) },
]);

export const CdpNftData = s.struct({
  key_image_url: s.string(),
  collateral_address: s.address(),
  collateral_amount: s.decimal(),
  pool_debt: s.decimal(),
  collateral_fusd_ratio: s.decimal(),
  interest: s.decimal(),
  last_interest_change: s.instant(),
  status: CdpStatus,
  privileged_borrower: s.option(s.nonFungibleLocalId()),
});

export type CdpNftData = s.infer<typeof CdpNftData>;

export const PanicModeEvent = s.enum([
  { variant: 'Initiation', schema: s.tuple([]) },
  { variant: 'Activation', schema: s.tuple([]) },
  { variant: 'TooLateActivation', schema: s.tuple([]) },
]);

export const EventMarkCdp = s.struct({
  cdp_id: s.nonFungibleLocalId(),
});

export const EventCloseCdp = s.struct({
  cdp_id: s.nonFungibleLocalId(),
});

export const EventLiquidateCdp = s.struct({
  cdp_id: s.nonFungibleLocalId(),
});

export const PanicModeChangeEvent = s.struct({
  cdp_id: s.nonFungibleLocalId(),
  activation_time: s.instant(),
  change: PanicModeEvent,
});

export const PayoutFetchRewardsEvent = s.struct({
  amount: s.decimal(),
});

export const PayoutClaimEvent = s.struct({
  amount: s.decimal(),
});

export const PayoutRequirementUpdateEvent = s.struct({
  new_requirement: s.decimal(),
  burn: s.number(),
});

export const PanicModeLiquidationEvent = s.struct({
  cdp_id: s.nonFungibleLocalId(),
  stablecoin_paid: s.decimal(),
  collateral_received: s.decimal(),
});

export const StabilityPoolContributionEvent = s.struct({
  collateral: s.address(),
  contribution_amount: s.decimal(),
  pool_tokens_received: s.decimal(),
});

export const StabilityPoolBuyEvent = s.struct({
  collateral: s.address(),
  fusd_paid: s.decimal(),
  collateral_received: s.decimal(),
  effective_price: s.decimal(),
});

export const StabilityPoolWithdrawalEvent = s.struct({
  collateral: s.address(),
  pool_tokens_burned: s.decimal(),
  fusd_received: s.decimal(),
  collateral_received: s.decimal(),
});

export const EventAddCollateral = s.struct({
  address: s.address(),
  mcr: s.decimal(),
  usd_price: s.decimal(),
});

export const EventChangeCollateral = s.struct({
  address: s.address(),
  new_mcr: s.option(s.decimal()),
  new_usd_price: s.option(s.decimal()),
});

export const EventAddPoolCollateral = s.struct({
  address: s.address(),
  parent_address: s.address(),
});

export const EventChargeInterest = s.struct({
  collateral_address: s.address(),
  start: s.option(s.decimal()),
  end: s.option(s.decimal()),
  interest_for_irredeemables: s.decimal(),
  fusd_minted: s.decimal(),
  total_charged: s.decimal(),
});

export const EventRedeemCdp = s.struct({
  cdp: CdpNftData,
  cdp_id: s.nonFungibleLocalId(),
  fully_redeemed: s.number(),
});

export const EventNewCdp = s.struct({
  cdp: CdpNftData,
  cdp_id: s.nonFungibleLocalId(),
});

export const EventUpdateCdp = s.struct({
  cdp: CdpNftData,
  cdp_id: s.nonFungibleLocalId(),
});

export type EventUpdateCdp = s.infer<typeof EventUpdateCdp>;
export type EventNewCdp = s.infer<typeof EventNewCdp>;
export type EventRedeemCdp = s.infer<typeof EventRedeemCdp>;
export type EventCloseCdp = s.infer<typeof EventCloseCdp>;
export type EventLiquidateCdp = s.infer<typeof EventLiquidateCdp>;
export type EventMarkCdp = s.infer<typeof EventMarkCdp>;
export type StabilityPoolContributionEvent = s.infer<
  typeof StabilityPoolContributionEvent
>;
export type StabilityPoolBuyEvent = s.infer<typeof StabilityPoolBuyEvent>;
export type StabilityPoolWithdrawalEvent = s.infer<
  typeof StabilityPoolWithdrawalEvent
>;
