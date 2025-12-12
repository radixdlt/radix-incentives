import { Layer } from 'effect';
import { RedisClientServiceTest } from './redisClient.test-layer';
import { RedisLock } from './redisLock';

export const RedisLockTest = RedisLock.DefaultWithoutDependencies.pipe(
  Layer.provide(RedisClientServiceTest),
);
