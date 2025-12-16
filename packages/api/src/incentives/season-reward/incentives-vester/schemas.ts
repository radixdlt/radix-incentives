import s from 'sbor-ez-mode';
// Generated TypeScript schema for Scrypto SBOR types of package address: package_rdx1phe8ngw6fjahenrg9l5z548ve7u7z60a0pq98vkh6p2wf253xd6uh0

export const IncentivesVesterSchema = s.struct({
  locker: s.address(),
  pool: s.address(),
  lp_tokens_vault: s.internalAddress(),
  locked_tokens_vault: s.internalAddress(),
  total_tokens_to_vest: s.decimal(),
  vested_tokens: s.decimal(),
  vest_start: s.option(s.instant()),
  vest_end: s.option(s.instant()),
  vest_duration_days: s.number(),
  pre_claim_duration_seconds: s.number(),
  initial_vested_fraction: s.decimal(),
});
