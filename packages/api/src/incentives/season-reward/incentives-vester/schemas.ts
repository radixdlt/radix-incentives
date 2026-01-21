import s from 'sbor-ez-mode';
// Generated TypeScript schema for Scrypto SBOR types of package address: package_rdx1phe8ngw6fjahenrg9l5z548ve7u7z60a0pq98vkh6p2wf253xd6uh0

export const UninitializedVestingConfig = s.struct({
  vest_duration_seconds: s.number(),
  pre_claim_duration_seconds: s.number(),
  initial_vested_fraction: s.decimal(),
});

export const InitializedVestingConfig = s.struct({
  vest_start: s.instant(),
  vest_end: s.instant(),
  initial_vested_fraction: s.decimal(),
});

export const VestingConfiguration = s.enum([
  { variant: 'Uninitialized', schema: UninitializedVestingConfig },
  { variant: 'Initialized', schema: InitializedVestingConfig },
]);

export const ResolvedVestingState = s.struct({
  vesting_configuration: VestingConfiguration,
  total_tokens_to_vest: s.decimal(),
  vested_tokens: s.decimal(),
  locked_tokens_vault: s.internalAddress(),
  pool: s.address(),
});

export const VestingState = s.tuple([ResolvedVestingState]);

export const IncentivesVester = s.struct({
  state: VestingState,
  locker: s.address(),
  lp_tokens_vault: s.internalAddress(),
});

export const AccountLockerWrapper = s.struct({
  locker: s.address(),
});
