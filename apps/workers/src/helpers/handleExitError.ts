import type { Exit } from 'effect';

export const handleExitError = (
  result: Exit.Failure<unknown, { _tag: string; message: string }>,
) => {
  if (result.cause._tag === 'Fail') {
    const enhancedError = new Error(result.cause.error._tag);
    enhancedError.stack = `${JSON.stringify(result.cause.error, null, 2)}`;
    enhancedError.cause = result.cause.error._tag;
    throw enhancedError;
  }

  if (result.cause._tag === 'Die') {
    const enhancedError = new Error('unhandled error');
    enhancedError.stack = `${JSON.stringify(result.cause.defect, null, 2)}`;
    enhancedError.cause = 'unhandled error';
    if (
      result.cause.defect !== null &&
      typeof result.cause.defect === 'object' &&
      'stack' in result.cause.defect
    ) {
      enhancedError.stack = `${result.cause.defect.stack}`;
    } else {
      enhancedError.stack = JSON.stringify(result.cause.defect, null, 2);
    }
    throw enhancedError;
  }

  throw new Error(JSON.stringify(result.cause, null, 2));
};
