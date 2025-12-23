import BigNumber from 'bignumber.js';

export const formatAmount = (value: string) => {
  const bn = new BigNumber(value);
  if (bn.gte(1_000_000)) {
    return `${bn.dividedBy(1_000_000).toFixed(2)}M`;
  }
  if (bn.gte(1_000)) {
    return `${bn.dividedBy(1_000).toFixed(2)}K`;
  }
  return bn.toFixed(2);
};
