import s from "sbor-ez-mode";

export const MarginPool = s.struct({
  positions: s.internalAddress(),
  base_tokens: s.internalAddress(),
  virtual_balance: s.decimal(),
  unrealized_pool_funding: s.decimal(),
  skew_abs_snap: s.decimal(),
  pnl_snap: s.decimal(),
});