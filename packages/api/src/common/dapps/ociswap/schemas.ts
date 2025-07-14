import s from "sbor-ez-mode";

export const TickOutside = s.struct({
  index: s.number(),
  x_fee: s.decimal(),
  y_fee: s.decimal(),
  seconds: s.number(),
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

export const Node = s.struct({
  key: s.number(),
  value: s.tuple([]),
  left_child: s.option(s.number()),
  right_child: s.option(s.number()),
  parent: s.option(s.number()),
  next: s.option(s.number()),
  prev: s.option(s.number()),
  balance_factor: s.number(),
});

export const AvlTree = s.struct({
  root: s.option(s.number()),
  store: s.internalAddress(),
  store_cache: s.map({ key: s.number(), value: Node }),
});

export const HookCalls = s.struct({
  before_instantiate: s.tuple([s.string(), s.array(s.address())]),
  after_instantiate: s.tuple([s.string(), s.array(s.address())]),
  before_add_liquidity: s.tuple([s.string(), s.array(s.address())]),
  after_add_liquidity: s.tuple([s.string(), s.array(s.address())]),
  before_swap: s.tuple([s.string(), s.array(s.address())]),
  after_swap: s.tuple([s.string(), s.array(s.address())]),
  before_remove_liquidity: s.tuple([s.string(), s.array(s.address())]),
  after_remove_liquidity: s.tuple([s.string(), s.array(s.address())]),
});

export const PrecisionPool = s.struct({
  pool_address: s.address(),
  x_vault: s.internalAddress(),
  y_vault: s.internalAddress(),
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
  hooks: s.map({ key: s.tuple([s.address(), s.string()]), value: s.address() }),
  hook_calls: HookCalls,
  hook_badges: s.map({ key: s.address(), value: s.internalAddress() }),
});

export const LiquidityPosition = s.struct({
  liquidity: s.decimal(),
  left_bound: s.number(),
  right_bound: s.number(),
  shape_id: s.option(s.nonFungibleLocalId()),
  added_at: s.number(),
  x_fee_checkpoint: s.decimal(),
  y_fee_checkpoint: s.decimal(),
  x_total_fee_checkpoint: s.decimal(),
  y_total_fee_checkpoint: s.decimal(),
  seconds_inside_checkpoint: s.number(),
});

export type PrecisionPool = s.infer<typeof PrecisionPool>;
export type LiquidityPosition = s.infer<typeof LiquidityPosition>;

// Non-precision pool schemas

export const BasicPoolSwapEvent = s.struct({
  input_address: s.address(),
  input_amount: s.decimal(),
  output_address: s.address(),
  output_amount: s.decimal(),
  input_fee_lp: s.decimal(),
});

export type BasicPoolSwapEvent = s.infer<typeof BasicPoolSwapEvent>;

export const FlexPoolSwapEvent = s.struct({
  input_address: s.address(),
  input_amount: s.decimal(),
  input_gross_amount: s.decimal(),
  input_fee_lp: s.decimal(),
  input_fee_protocol: s.decimal(),
  output_address: s.address(),
  output_amount: s.decimal(),
  output_return_amount: s.decimal(),
  price_sqrt: s.decimal(),
});

export type FlexPoolSwapEvent = s.infer<typeof FlexPoolSwapEvent>;

export const SubObservations = s.struct({
  price_sqrt_sum: s.decimal(),
  price_sqrt_last: s.decimal(),
  last_updated: s.instant(),
  initialization: s.option(s.instant()),
});

export const Oracle = s.struct({
  observations: s.internalAddress(),
  last_observation_index: s.option(s.number()),
  observations_stored: s.number(),
  sub_observations: s.option(SubObservations),
  observations_limit: s.number(),
});

export const PrecisionPoolV2 = s.struct({
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
  hooks: s.map({ key: s.tuple([s.address(), s.string()]), value: s.address() }),
  hook_calls: HookCalls,
  hook_badges: s.map({ key: s.address(), value: s.internalAddress() }),
  oracle: Oracle,
});

export type PrecisionPoolV2 = s.infer<typeof PrecisionPoolV2>;
