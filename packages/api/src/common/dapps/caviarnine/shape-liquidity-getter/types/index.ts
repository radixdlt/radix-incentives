/**
 * Input parameters for calculating redemption value of a single NFT
 */
export interface RedemptionValueInput {
  componentAddress: string;
  nftId: string;
  stateVersion: number;
  priceBounds?: [number, number]; // [lowerMultiplier, upperMultiplier]
  middlePrice?: number; // Optional override for current price
}

/**
 * Input parameters for calculating redemption values of multiple NFTs
 */
export interface RedemptionValuesInput {
  componentAddress: string;
  nftIds: string[];
  stateVersion: number;
  priceBounds?: [number, number]; // [lowerMultiplier, upperMultiplier]
  middlePrice?: number; // Optional override for current price
}

/**
 * Output structure for redemption value calculation
 */
export interface RedemptionValueOutput {
  xToken: string;
  yToken: string;
  isActive: boolean;
}

/**
 * Output structure for multiple redemption value calculations
 */
export interface RedemptionValuesOutput {
  [nftId: string]: RedemptionValueOutput;
}
