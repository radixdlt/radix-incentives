import s from 'sbor-ez-mode';

export const MarginPool = s.struct({
  positions: s.internalAddress(),
  base_tokens: s.internalAddress(),
  virtual_balance: s.decimal(),
  unrealized_pool_funding: s.decimal(),
  skew_abs_snap: s.decimal(),
  pnl_snap: s.decimal(),
});

export const EventAccountCreation = s.struct({
  account: s.address(),
  referral_id: s.option(s.nonFungibleLocalId()),
});

// Price limit for margin trading orders
export const PriceLimit = s.enum([
  { variant: 'None', schema: s.tuple([]) },
  { variant: 'Gte', schema: s.tuple([s.decimal()]) },
  { variant: 'Lte', schema: s.tuple([s.decimal()]) },
]);

export const EventMarginOrder = s.struct({
  account: s.address(),
  pair_id: s.string(),
  price: s.decimal(),
  price_limit: PriceLimit,
  amount_close: s.decimal(),
  amount_open: s.decimal(),
  pnl: s.decimal(),
  funding: s.decimal(),
  fee_pool: s.decimal(),
  fee_protocol: s.decimal(),
  fee_treasury: s.decimal(),
  fee_referral: s.decimal(),
  activated_requests: s.array(s.number()),
  cancelled_requests: s.array(s.number()),
});

export const EventLiquidate = s.struct({
  account: s.address(),
  position_prices: s.array(s.tuple([s.string(), s.decimal()])),
  collateral_prices: s.array(s.tuple([s.address(), s.decimal()])),
  account_value: s.decimal(),
  margin: s.decimal(),
  virtual_balance: s.decimal(),
  position_amounts: s.array(s.tuple([s.string(), s.decimal()])),
  positions_pnl: s.decimal(),
  collateral_amounts: s.array(s.tuple([s.address(), s.decimal()])),
  collateral_value: s.decimal(),
  collateral_value_discounted: s.decimal(),
  funding: s.decimal(),
  fee_pool: s.decimal(),
  fee_protocol: s.decimal(),
  fee_treasury: s.decimal(),
  fee_referral: s.decimal(),
  pool_loss: s.decimal(),
});

export const EventAutoDeleverage = s.struct({
  account: s.address(),
  pair_id: s.string(),
  price: s.decimal(),
  amount_close: s.decimal(),
  pnl: s.decimal(),
  funding: s.decimal(),
  fee_pool: s.decimal(),
  fee_protocol: s.decimal(),
  fee_treasury: s.decimal(),
  fee_referral: s.decimal(),
  pnl_percent: s.decimal(),
  threshold: s.decimal(),
});

export const EventSignalUpgrade = s.struct({
  new_exchange: s.address(),
});

export const EventAddCollateral = s.struct({
  account: s.address(),
  amounts: s.array(s.tuple([s.address(), s.decimal()])),
});

export const EventRemoveCollateral = s.struct({
  account: s.address(),
  target_account: s.address(),
  amounts: s.array(s.tuple([s.address(), s.decimal()])),
});

// Infer TypeScript types from SBOR schemas
export type EventAccountCreation = s.infer<typeof EventAccountCreation>;
export type EventMarginOrder = s.infer<typeof EventMarginOrder>;
export type EventLiquidate = s.infer<typeof EventLiquidate>;
export type EventAutoDeleverage = s.infer<typeof EventAutoDeleverage>;
export type EventSignalUpgrade = s.infer<typeof EventSignalUpgrade>;
export type EventAddCollateral = s.infer<typeof EventAddCollateral>;
export type EventRemoveCollateral = s.infer<typeof EventRemoveCollateral>;
