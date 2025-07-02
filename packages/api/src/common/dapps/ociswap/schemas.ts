import s from "sbor-ez-mode";

export const TickOutside = s.struct({
  index: s.number(),
  x_fee: s.decimal(),
  y_fee: s.decimal(),
  seconds: s.number()
});

export const SwapEvent = s.struct({
  input_address: s.address(),
  input_amount: s.decimal(),
  input_gross_amount: s.decimal(),
  input_fee_lp: s.decimal(),
  input_fee_protocol: s.decimal(),
  output_address: s.address(),
  output_amount: s.decimal(),
  output_return_amount: s.decimal(),
  price_sqrt: s.decimal(),
  active_liquidity: s.decimal(),
  active_tick: s.option(s.number()),
  global_x_fee_lp: s.decimal(),
  global_y_fee_lp: s.decimal(),
  crossed_ticks: s.array(TickOutside),
});

export type SwapEvent = s.infer<typeof SwapEvent>;