import { type ActivityId, matchActivityId } from "data";
import { Data, Effect } from "effect";

class ActivityNotSupportedError extends Data.TaggedError(
  "ActivityNotSupportedError"
)<{
  message: string;
}> {}

export const determineLpActivityId = Effect.fn(function* (
  dapp: string,
  tokenPair: string
) {
  const lpActivityId = `${dapp}_lp_${tokenPair}` as ActivityId;
  const nativeLpActivityId = `${dapp}_nativeLp_${tokenPair}` as ActivityId;

  const isLpActivity = matchActivityId(lpActivityId);
  const isNativeLpActivity = matchActivityId(nativeLpActivityId);

  if (!isLpActivity && !isNativeLpActivity) {
    return yield* Effect.fail(
      new ActivityNotSupportedError({
        message: `${tokenPair} is not a valid token pair`,
      })
    );
  }

  return isLpActivity
    ? { activityId: lpActivityId, isNativeLp: false }
    : { activityId: nativeLpActivityId, isNativeLp: true };
});
