import crypto from 'node:crypto';
import { Data, Effect, Schedule } from 'effect';
import { RedisClientService } from './redisClient';

export class LockAcquisitionError extends Data.TaggedError(
  'LockAcquisitionError',
)<{
  message: string;
  lockKey: string;
}> {}

export class LockReleaseError extends Data.TaggedError('LockReleaseError')<{
  message: string;
  lockKey: string;
}> {}

type Lock = {
  key: string;
  value: string;
};

type AcquireOptions = {
  /** Lock key */
  key: string;
  /** Time-to-live in milliseconds (default: 30000) */
  ttlMs?: number;
};

type AcquireWithRetryOptions = AcquireOptions & {
  /** Maximum number of retry attempts (default: 5) */
  maxRetries?: number;
  /** Delay between retries in milliseconds (default: 200) */
  retryDelayMs?: number;
};

/**
 * Lua script to safely release a lock.
 * Only deletes the key if the value matches (ensures we own the lock).
 */
const RELEASE_LOCK_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
`;

export class RedisLock extends Effect.Service<RedisLock>()('RedisLock', {
  dependencies: [RedisClientService.Live],
  effect: Effect.gen(function* () {
    const redis = yield* RedisClientService;

    /**
     * Attempts to acquire a lock. Returns the lock if successful, null otherwise.
     */
    const tryAcquire = (
      options: AcquireOptions,
    ): Effect.Effect<Lock | null> => {
      const { key, ttlMs = 30000 } = options;
      const lockValue = crypto.randomUUID();

      return Effect.tryPromise(() =>
        redis.set(key, lockValue, 'PX', ttlMs, 'NX'),
      ).pipe(
        Effect.map((result) =>
          result === 'OK' ? { key, value: lockValue } : null,
        ),
        Effect.orElseSucceed(() => null),
      );
    };

    /**
     * Acquires a lock, retrying if necessary.
     * Throws LockAcquisitionError if lock cannot be acquired after retries.
     */
    const acquire = (
      options: AcquireWithRetryOptions,
    ): Effect.Effect<Lock, LockAcquisitionError> =>
      Effect.gen(function* () {
        const {
          maxRetries = 5,
          retryDelayMs = 200,
          ...acquireOptions
        } = options;

        const lock = yield* tryAcquire(acquireOptions).pipe(
          Effect.flatMap((lock) =>
            lock ? Effect.succeed(lock) : Effect.fail('not_acquired' as const),
          ),
          Effect.retry(
            Schedule.recurs(maxRetries).pipe(
              Schedule.addDelay(() => `${retryDelayMs} millis`),
            ),
          ),
          Effect.catchAll(() =>
            Effect.fail(
              new LockAcquisitionError({
                message: `Failed to acquire lock after ${maxRetries} retries`,
                lockKey: acquireOptions.key,
              }),
            ),
          ),
        );

        return lock;
      });

    /**
     * Releases a lock. Only releases if we own the lock (value matches).
     */
    const release = (lock: Lock): Effect.Effect<boolean, LockReleaseError> =>
      Effect.tryPromise({
        try: async () => {
          const result = await redis.eval(
            RELEASE_LOCK_SCRIPT,
            1,
            lock.key,
            lock.value,
          );
          return result === 1;
        },
        catch: (error) =>
          new LockReleaseError({
            message: error instanceof Error ? error.message : String(error),
            lockKey: lock.key,
          }),
      });

    /**
     * Executes an effect while holding a lock.
     * Automatically acquires the lock before and releases it after (even on error).
     */
    const withLock = <A, E, R>(
      options: AcquireWithRetryOptions,
      effect: Effect.Effect<A, E, R>,
    ): Effect.Effect<A, E | LockAcquisitionError, R> =>
      Effect.gen(function* () {
        const lock = yield* acquire(options);

        return yield* Effect.ensuring(
          effect,
          release(lock).pipe(Effect.ignore),
        );
      });

    return {
      tryAcquire,
      acquire,
      release,
      withLock,
    };
  }),
}) {}
