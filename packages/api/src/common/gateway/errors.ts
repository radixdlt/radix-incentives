export class GatewayError extends Error {
  readonly _tag = "GatewayError";
  constructor(readonly error: unknown) {
    super(error instanceof Error ? error.message : String(error));
  }
}

export class EntityNotFoundError extends Error {
  readonly _tag = "EntityNotFoundError";
  constructor(readonly error?: unknown) {
    super(error instanceof Error ? error.message : String(error));
  }
}
