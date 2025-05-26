import s from "sbor-ez-mode";

export const ContributionStateSchema = s.struct({
  divisibility: s.number(),
  total: s.decimal(),
  total_units: s.decimal(),
  unit_ratio: s.decimal(),
});

export const LendingPoolSchema = s.struct({
  deposit_state: ContributionStateSchema,
  deposit_unit_res_address: s.address(),
});

// Generated TypeScript schema for Scrypto SBOR types of package address: package_rdx1pkwtcymnlaffvdlrdygmut7gd74ecjkn5t6qu6k679y2a350c2yfda
export const SingleResourcePool = s.struct({
  liquidity: s.internalAddress(),
  external_liquidity_amount: s.decimal(),
  pool_unit_res_manager: s.address(),
  unit_to_asset_ratio: s.decimal(),
});
