import { Effect } from "effect";
import { flatTokenNameMap } from "data";

export class UnknownTokenError extends Error {
  readonly _tag = "UnknownTokenError";
  constructor(readonly resourceAddress: string) {
    super(`Unknown token resource address: ${resourceAddress}`);
  }
}

export class GetTokenNameService extends Effect.Service<GetTokenNameService>()(
  "GetTokenNameService",
  {
    effect: Effect.gen(function* () {
      return Effect.fn(function* (resourceAddress: string) {
        const tokenName =
          flatTokenNameMap[resourceAddress as keyof typeof flatTokenNameMap];

        if (tokenName) {
          return Effect.succeed(tokenName);
        }

        return Effect.fail(new UnknownTokenError(resourceAddress));
      });
    }),
  }
) {}

export const GetTokenNameLive = GetTokenNameService.Default;
