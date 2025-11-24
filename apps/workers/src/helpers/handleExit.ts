import { Cause, Exit } from 'effect';

export const handleExit = (exit: Exit.Exit<any, any>) => {
  Exit.match(exit, {
    onSuccess: (value) => value,
    onFailure: (cause) => {
      if (Cause.isFailType(cause)) {
        const enhancedError = new Error(cause.error._tag);
        enhancedError.stack = Cause.pretty(cause);
        enhancedError.cause = cause.error._tag;
        throw enhancedError;
      }

      const enhancedError = new Error('unhandled error');
      enhancedError.cause = cause._tag;
      enhancedError.stack = Cause.pretty(cause);
      throw enhancedError;
    },
  });
};
