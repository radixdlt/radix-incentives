import type { Token } from "db/incentives";

export const getPair = (token1: Token, token2: Token) => {
  // Sort tokens in ascending alphabetical order
  const [firstToken, secondToken] = [token1, token2].sort((a, b) =>
    a.localeCompare(b)
  );
  return `${firstToken}-${secondToken}`;
};
