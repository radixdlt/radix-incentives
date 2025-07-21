import { Context, Effect, Layer } from "effect";
import { flatTokenNameMap } from "data";

export class UnknownTokenError extends Error {
  readonly _tag = "UnknownTokenError";
  constructor(readonly resourceAddress: string) {
    super(`Unknown token resource address: ${resourceAddress}`);
  }
}

export class TokenNameService extends Context.Tag("TokenNameService")<
  TokenNameService,
  (resourceAddress: string) => Effect.Effect<string, UnknownTokenError>
>() {}

export const TokenNameServiceLive = Layer.effect(
  TokenNameService,
  Effect.gen(function* () {
    return (resourceAddress: string) => {
      const tokenName =
        flatTokenNameMap[resourceAddress as keyof typeof flatTokenNameMap];

      if (tokenName) {
        return Effect.succeed(tokenName);
      }

      return Effect.fail(new UnknownTokenError(resourceAddress));
    };
  })
);
