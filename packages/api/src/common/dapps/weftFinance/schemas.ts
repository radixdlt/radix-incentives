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

// EfficiencyMode enum
export const EfficiencyMode = s.enum([
  { variant: "None", schema: s.tuple([]) },
  { variant: "EfficiencyGroup", schema: s.tuple([s.number()]) }, // u16 as number
  { variant: "IdenticalResource", schema: s.tuple([]) },
]);

// CollateralConfigVersion struct
export const CollateralConfigVersion = s.struct({
  entry_version: s.number(), // u64
  efficiency_mode: EfficiencyMode,
});

// CollateralInfo struct
export const CollateralInfo = s.struct({
  amount: s.decimal(),
  config_version: CollateralConfigVersion,
});

// NFTCollateralInfo struct
export const NFTCollateralInfo = s.struct({
  nft_ids: s.array(s.nonFungibleLocalId()),
  config_version: s.map({ key: s.address(), value: CollateralConfigVersion }),
});

// LoanInfo struct
export const LoanInfo = s.struct({
  units: s.decimal(),
  config_version: s.number(), // u64
});

// CDPData struct
export const CDPData = s.struct({
  minted_at: s.number(), // Instant
  updated_at: s.number(), // Instant
  key_image_url: s.string(),
  name: s.string(),
  description: s.string(),
  loans: s.map({ key: s.address(), value: LoanInfo }),
  collaterals: s.map({ key: s.address(), value: CollateralInfo }),
  nft_collaterals: s.map({ key: s.address(), value: NFTCollateralInfo }),
});
