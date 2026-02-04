/**
 * Build the transaction manifest for claiming tokens from an account locker
 * This is used when a claim transaction deposited tokens to the locker
 * (e.g., when the user has third-party deposits disabled)
 */
export const buildClaimFromLockerManifest = (params: {
  lockerAddress: string;
  accountAddress: string;
  resourceAddress: string;
  amount: string;
}) => {
  const { lockerAddress, accountAddress, resourceAddress, amount } = params;

  return `
CALL_METHOD
  Address("${lockerAddress}")
  "claim"
  Address("${accountAddress}")
  Address("${resourceAddress}")
  Decimal("${amount}")
;

CALL_METHOD
  Address("${accountAddress}")
  "deposit_batch"
  Expression("ENTIRE_WORKTOP")
;
`;
};
