import { layer } from '@effect/vitest';
import { Effect, Layer, Logger } from 'effect';
import { expect } from 'vitest';
import { DisableTestClock } from '../../test-helpers/disableTestClock';
import { RedisClientService } from './redisClient';
import { LockAcquisitionError, RedisLock } from './redisLock';

const TestLayer = RedisLock.DefaultWithoutDependencies.pipe(
  Layer.provide(RedisClientService.Test),
  Layer.provide(Logger.pretty),
);

layer(TestLayer)('RedisLock', (it) => {
  it.effect('tryAcquire - should acquire a lock when key does not exist', () =>
    Effect.gen(function* () {
      const redisLock = yield* RedisLock;
      const lock = yield* redisLock.tryAcquire({ key: 'test:lock:1' });
      expect(lock).not.toBeNull();
      expect(lock?.key).toBe('test:lock:1');
      expect(lock?.value).toBeDefined();
    }),
  );

  it.effect('tryAcquire - should return null when lock already exists', () =>
    Effect.gen(function* () {
      const redisLock = yield* RedisLock;

      const lock1 = yield* redisLock.tryAcquire({ key: 'test:lock:2' });
      expect(lock1).not.toBeNull();

      const lock2 = yield* redisLock.tryAcquire({ key: 'test:lock:2' });
      expect(lock2).toBeNull();
    }),
  );

  it.effect(
    'tryAcquire - should acquire lock after previous lock expires',
    () =>
      DisableTestClock(
        Effect.gen(function* () {
          const redisLock = yield* RedisLock;

          const lock1 = yield* redisLock.tryAcquire({
            key: 'test:lock:3',
            ttlMs: 100,
          });
          expect(lock1).not.toBeNull();

          // Wait for lock to expire
          yield* Effect.sleep('150 millis');

          const lock2 = yield* redisLock.tryAcquire({ key: 'test:lock:3' });
          expect(lock2).not.toBeNull();
        }),
      ),
  );

  it.effect('acquire - should acquire a lock when key does not exist', () =>
    Effect.gen(function* () {
      const redisLock = yield* RedisLock;
      const lock = yield* redisLock.acquire({
        key: 'test:lock:4',
        maxRetries: 0,
      });

      expect(lock.key).toBe('test:lock:4');
      expect(lock.value).toBeDefined();
    }),
  );

  it.effect(
    'acquire - should fail with LockAcquisitionError when lock cannot be acquired',
    () =>
      DisableTestClock(
        Effect.gen(function* () {
          const redisLock = yield* RedisLock;

          yield* redisLock.tryAcquire({ key: 'test:lock:5' });

          const result = yield* redisLock
            .acquire({
              key: 'test:lock:5',
              maxRetries: 2,
              retryDelayMs: 50,
            })
            .pipe(Effect.either);

          expect(result._tag).toBe('Left');
          if (result._tag === 'Left') {
            expect(result.left).toBeInstanceOf(LockAcquisitionError);
            expect(result.left.lockKey).toBe('test:lock:5');
          }
        }),
      ),
  );

  it.effect(
    'acquire - should succeed after retrying when lock becomes available',
    () =>
      DisableTestClock(
        Effect.gen(function* () {
          const redisLock = yield* RedisLock;

          // Acquire a short-lived lock
          const initialLock = yield* redisLock.tryAcquire({
            key: 'test:lock:6',
            ttlMs: 150,
          });
          expect(initialLock).not.toBeNull();

          // Try to acquire with retries - should succeed after TTL expires
          const lock = yield* redisLock.acquire({
            key: 'test:lock:6',
            maxRetries: 5,
            retryDelayMs: 100,
          });

          expect(lock.key).toBe('test:lock:6');
        }),
      ),
  );

  it.effect('release - should release a lock when we own it', () =>
    Effect.gen(function* () {
      const redisLock = yield* RedisLock;

      const lock = yield* redisLock.tryAcquire({ key: 'test:lock:7' });
      expect(lock).not.toBeNull();

      const released = yield* redisLock.release(lock!);
      expect(released).toBe(true);

      // Should be able to acquire again
      const newLock = yield* redisLock.tryAcquire({ key: 'test:lock:7' });
      expect(newLock).not.toBeNull();
    }),
  );

  it.effect('release - should not release a lock when we do not own it', () =>
    Effect.gen(function* () {
      const redisLock = yield* RedisLock;

      const lock = yield* redisLock.tryAcquire({ key: 'test:lock:8' });
      expect(lock).not.toBeNull();

      // Try to release with wrong value
      const released = yield* redisLock.release({
        key: 'test:lock:8',
        value: 'wrong-value',
      });
      expect(released).toBe(false);

      // Original lock should still exist
      const newLock = yield* redisLock.tryAcquire({ key: 'test:lock:8' });
      expect(newLock).toBeNull();
    }),
  );

  it.effect('release - should return false when lock does not exist', () =>
    Effect.gen(function* () {
      const redisLock = yield* RedisLock;

      const released = yield* redisLock.release({
        key: 'test:lock:nonexistent',
        value: 'some-value',
      });
      expect(released).toBe(false);
    }),
  );

  it.effect(
    'withLock - should execute effect while holding lock and release after',
    () =>
      Effect.gen(function* () {
        const redisLock = yield* RedisLock;
        let executed = false;

        yield* redisLock.withLock(
          { key: 'test:lock:9', maxRetries: 0 },
          Effect.sync(() => {
            executed = true;
          }),
        );

        expect(executed).toBe(true);

        // Lock should be released
        const newLock = yield* redisLock.tryAcquire({ key: 'test:lock:9' });
        expect(newLock).not.toBeNull();
      }),
  );

  it.effect('withLock - should release lock even when effect fails', () =>
    Effect.gen(function* () {
      const redisLock = yield* RedisLock;

      const result = yield* redisLock
        .withLock(
          { key: 'test:lock:10', maxRetries: 0 },
          Effect.fail(new Error('test error')),
        )
        .pipe(Effect.either);

      expect(result._tag).toBe('Left');

      // Lock should be released
      const newLock = yield* redisLock.tryAcquire({ key: 'test:lock:10' });
      expect(newLock).not.toBeNull();
    }),
  );

  it.effect(
    'withLock - should prevent concurrent execution with same lock key',
    () =>
      DisableTestClock(
        Effect.gen(function* () {
          const redisLock = yield* RedisLock;
          const executionOrder: number[] = [];

          const task1 = redisLock.withLock(
            { key: 'test:lock:11', maxRetries: 10, retryDelayMs: 50 },
            Effect.gen(function* () {
              executionOrder.push(1);
              yield* Effect.sleep('100 millis');
              executionOrder.push(2);
            }),
          );

          const task2 = redisLock.withLock(
            { key: 'test:lock:11', maxRetries: 10, retryDelayMs: 50 },
            Effect.gen(function* () {
              executionOrder.push(3);
              yield* Effect.sleep('100 millis');
              executionOrder.push(4);
            }),
          );

          yield* Effect.all([task1, task2], { concurrency: 'unbounded' });

          // Tasks should execute sequentially, not interleaved
          expect(executionOrder).toEqual([1, 2, 3, 4]);
        }),
      ),
  );
});
