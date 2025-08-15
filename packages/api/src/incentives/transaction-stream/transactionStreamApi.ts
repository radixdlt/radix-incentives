import { Config, Data, Effect } from 'effect';
import { z } from 'zod';
import { FetchService } from '../../common';
import { GetLedgerStateService } from '../../common/gateway';

class RequestError extends Data.TaggedError('RequestError')<{
  error: unknown;
}> {}

class ErrorResponse extends Data.TaggedError('ErrorResponse')<{
  status: number;
  message: string;
}> {}

class ValidationError extends Data.TaggedError('ValidationError')<{
  message: string;
}> {}

type StateVersionResponse = {
  message: string;
  stateVersion: number;
};

type StateResponse = {
  message: string;
  state: 'PAUSED' | 'RUNNING';
};

export type SetStateVersionInput = {
  timestamp: Date;
};

export const SetStateInputSchema = z.object({
  state: z.enum(['START', 'PAUSE']),
});

export type SetStateInput = z.infer<typeof SetStateInputSchema>;

export class TransactionStreamApiService extends Effect.Service<TransactionStreamApiService>()(
  'TransactionStreamApiService',
  {
    dependencies: [FetchService.Default, GetLedgerStateService.Default],
    effect: Effect.gen(function* () {
      const fetchImp = yield* FetchService;
      const getLedgerState = yield* GetLedgerStateService;

      return {
        setState: Effect.fn(function* (input: SetStateInput) {
          const validatedInput = SetStateInputSchema.safeParse(input);

          if (!validatedInput.success) {
            return yield* Effect.fail(
              new ValidationError({
                message: validatedInput.error.message,
              }),
            );
          }

          const streamerApiBaseUrl = yield* Config.string(
            'STREAMER_API_BASE_URL',
          );

          const response = yield* Effect.tryPromise({
            try: () =>
              fetchImp(`${streamerApiBaseUrl}/state`, {
                method: 'POST',
                body: JSON.stringify(input),
              }),
            catch: (error) => new RequestError({ error }),
          });

          if (!response.ok) {
            const text = yield* Effect.tryPromise(() => response.text());

            return yield* Effect.fail(
              new ErrorResponse({
                status: response.status,
                message: text,
              }),
            );
          }

          const json = yield* Effect.tryPromise(() => response.json());

          return json as StateResponse;
        }),
        setStateVersion: Effect.fn(function* (input: { timestamp: Date }) {
          const streamerApiBaseUrl = yield* Config.string(
            'STREAMER_API_BASE_URL',
          );

          const result = yield* getLedgerState({
            at_ledger_state: {
              timestamp: input.timestamp,
            },
          });

          const stateVersion = result.state_version;

          const response = yield* Effect.tryPromise({
            try: () =>
              fetchImp(`${streamerApiBaseUrl}/state-version`, {
                method: 'POST',
                body: JSON.stringify({ stateVersion }),
              }),
            catch: (error) => new RequestError({ error }),
          });

          if (!response.ok) {
            const text = yield* Effect.tryPromise(() => response.text());

            return yield* Effect.fail(
              new ErrorResponse({
                status: response.status,
                message: text,
              }),
            );
          }

          const json = yield* Effect.tryPromise(() => response.json());

          return json as StateVersionResponse;
        }),
      };
    }),
  },
) {}
