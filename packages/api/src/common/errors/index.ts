import type { z } from "zod";

export class InvalidInputError<T = unknown> {
  readonly _tag = "InvalidInputError";
  constructor(readonly error: z.ZodError<T>) {}
}
