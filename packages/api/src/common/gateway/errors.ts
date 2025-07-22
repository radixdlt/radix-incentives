import { Data } from "effect";

export class GatewayError extends Data.TaggedError("GatewayError")<{
  error: unknown;
}> {}
