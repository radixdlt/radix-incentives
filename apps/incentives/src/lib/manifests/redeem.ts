/**
 * Build the transaction manifest for redeeming LP tokens from a vesting pool
 */
export const buildRedeemManifest = (params: {
  accountAddress: string;
  poolAddress: string;
  lpTokenAddress: string;
  amount: string;
}) => {
  const { accountAddress, poolAddress, lpTokenAddress, amount } = params;

  return `
CALL_METHOD
  Address("${accountAddress}")
  "withdraw"
  Address("${lpTokenAddress}")
  Decimal("${amount}")
;

TAKE_ALL_FROM_WORKTOP
  Address("${lpTokenAddress}")
  Bucket("lp_tokens")
;

CALL_METHOD
  Address("${poolAddress}")
  "redeem"
  Bucket("lp_tokens")
;

CALL_METHOD
  Address("${accountAddress}")
  "deposit_batch"
  Expression("ENTIRE_WORKTOP")
;
`;
};
