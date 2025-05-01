export class GatewayError {
  readonly _tag = "GatewayError";
  constructor(readonly error: unknown) {}
}
