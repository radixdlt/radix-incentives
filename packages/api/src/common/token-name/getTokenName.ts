import { Context, Effect, Layer } from "effect";
import { Assets } from "../assets/constants";
import { CaviarNineConstants } from "../dapps/caviarnine/constants";

export class UnknownTokenError extends Error {
  readonly _tag = "UnknownTokenError";
  constructor(readonly resourceAddress: string) {
    super(`Unknown token resource address: ${resourceAddress}`);
  }
}

// Centralized mapping from resource address to canonical token name
const tokenNameMap = {
  [Assets.Fungible.XRD]: "xrd",
  [Assets.Fungible.xUSDC]: "xusdc", 
  [Assets.Fungible.xUSDT]: "xusdt",
  [Assets.Fungible.wxBTC]: "xwbtc",
  [Assets.Fungible.xETH]: "xeth",
  [CaviarNineConstants.LSULP.resourceAddress]: "lsulp",
} as const;

export class TokenNameService extends Context.Tag("TokenNameService")<
  TokenNameService,
  (resourceAddress: string) => Effect.Effect<string, UnknownTokenError, never>
>() {}

export const TokenNameServiceLive = Layer.effect(
  TokenNameService,
  Effect.gen(function* () {
    return (resourceAddress: string) => {
      const tokenName = tokenNameMap[resourceAddress as keyof typeof tokenNameMap];
      
      if (tokenName) {
        return Effect.succeed(tokenName);
      }
      
      return Effect.fail(new UnknownTokenError(resourceAddress));
    };
  })
);