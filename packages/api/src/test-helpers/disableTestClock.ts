import { Duration, Effect, Fiber, Option, TestClock } from 'effect';

const resolveFiber = <A, E>(fiber: Fiber.RuntimeFiber<A, E>) =>
  Effect.gen(function* () {
    while (Option.isNone(yield* Fiber.poll(fiber))) {
      yield* Effect.promise(
        async () => new Promise((resolve) => setTimeout(resolve, 1000)),
      );
      yield* TestClock.adjust(Duration.seconds(1));
    }
    return yield* Fiber.join(fiber);
  });

export const DisableTestClock = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  Effect.gen(function* () {
    const fiber = yield* effect.pipe(Effect.fork);
    return yield* resolveFiber(fiber);
  });
