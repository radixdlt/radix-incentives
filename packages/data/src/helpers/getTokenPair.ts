import type { TokenPair, Token } from "../types";

/**
 * Sort tokens in ascending alphabetical order
 * @param token1 - The first token
 * @param token2 - The second token
 * @returns The token pair
 */
export const getTokenPair = (token1: string, token2: string) => {
  const [firstToken, secondToken] = [token1, token2].sort((a, b) =>
    a.localeCompare(b)
  );
  return `${firstToken}-${secondToken}`;
};
