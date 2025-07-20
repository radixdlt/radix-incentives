import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";
import { Effect } from "effect";

const generateSessionToken = (): string => {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);

  return token;
};

export class GenerateSessionTokenService extends Effect.Service<GenerateSessionTokenService>()(
  "GenerateSessionTokenService",
  {
    effect: Effect.gen(function* () {
      return {
        run: Effect.fn(function* () {
          return generateSessionToken();
        }),
      };
    }),
  }
) {}
