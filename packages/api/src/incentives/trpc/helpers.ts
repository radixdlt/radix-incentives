import { TRPCError } from '@trpc/server';
import { Data, Effect, Exit } from 'effect';

export class ResponseError extends Data.TaggedError('ResponseError')<{
  code: TRPCError['code'];
  message?: string;
}> {}

export const resolveExit = <A, E>(exit: Exit.Exit<A, E>) =>
  Exit.match(exit, {
    onSuccess: (value) => value,
    onFailure: (cause) => {
      if (
        cause._tag === 'Fail' &&
        cause.error !== null &&
        typeof cause.error === 'object' &&
        '_tag' in cause.error
      ) {
        const message =
          'message' in cause.error && typeof cause.error.message === 'string'
            ? cause.error.message
            : undefined;

        if (
          cause.error._tag === 'ResponseError' &&
          'code' in cause.error &&
          typeof cause.error.code === 'string'
        ) {
          throw new TRPCError({
            code: cause.error.code as TRPCError['code'],
            message,
          });
        }
      }

      console.error(cause);

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      });
    },
  });

export const resolveEffect = <A, E, R extends never>(
  effect: Effect.Effect<A, E, R>,
) => Effect.runPromiseExit(effect).then(resolveExit);
