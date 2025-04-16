import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";
import { Context, Effect } from "effect";
import { Layer } from "effect";

const generateSessionToken = (): string => {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
};

export class GenerateSessionTokenService extends Context.Tag(
  "GenerateSessionTokenService"
)<GenerateSessionTokenService, () => string>() {}

export const GenerateSessionTokenLive = Layer.effect(
  GenerateSessionTokenService,
  Effect.succeed(generateSessionToken)
);
