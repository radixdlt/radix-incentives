import { workerRuntime } from 'api/incentives/snapshot/v2/runtime';
import { Cause, Effect, Exit } from 'effect';

export const handleExit = (exit: Exit.Exit<any, any>) => {
  Exit.match(exit, {
    onSuccess: (value) => value,
    onFailure: (cause) => {
      workerRuntime.runSync(Effect.logError(cause));
      if (Cause.isFailType(cause)) {
        const enhancedError = new Error(cause.error._tag);
        enhancedError.stack = Cause.pretty(cause);
        enhancedError.cause = cause.error._tag;
        throw enhancedError;
      }

      const enhancedError = new Error(cause._tag ?? 'unhandled error');
      enhancedError.cause = cause._tag;
      enhancedError.stack = Cause.pretty(cause);
      throw enhancedError;
    },
  });
};
