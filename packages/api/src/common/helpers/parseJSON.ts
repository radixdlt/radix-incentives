import { Effect } from 'effect';

export class ParseJSONError {
  readonly _tag = 'ParseJSONError';
  constructor(readonly error: unknown) {}
}

// biome-ignore lint/suspicious/noExplicitAny: Generic type parameter allows flexible JSON parsing
export const parseJSON = <T = any>(text: string) =>
  Effect.try({
    try: (): T => JSON.parse(text),
    catch: (e) => new ParseJSONError(e),
  });
