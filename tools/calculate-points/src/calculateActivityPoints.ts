import { db, seasons, weeks } from 'db/incentives';
import { desc, eq } from 'drizzle-orm';
import { Effect, Logger } from 'effect';
import { CalculateActivityPointsService } from '../../../packages/api/src/incentives/activity-points/calculateActivityPoints';

const runnable = Effect.gen(function* () {
  yield* Effect.log('Running season points calculation');

  const calculateActivityPointsService = yield* CalculateActivityPointsService;

  const seasonId = yield* Effect.tryPromise(() =>
    db.query.seasons
      .findFirst({
        where: eq(seasons.status, 'active'),
      })
      .then((result) => result?.id),
  );

  const week = yield* Effect.tryPromise(() =>
    db.query.weeks.findFirst({
      orderBy: [desc(weeks.startDate)],
    }),
  );

  if (!week) {
    return yield* Effect.fail('Week not found');
  }

  const activityCategoryWeeks = yield* Effect.tryPromise(() =>
    db.query.activityCategoryWeeks.findMany(),
  );

  if (!seasonId) {
    return yield* Effect.fail('Season not found');
  }

  if (activityCategoryWeeks.length === 0) {
    return yield* Effect.fail('Activity category weeks not found');
  }

  const addresses = yield* Effect.tryPromise(() =>
    db.query.accounts
      .findMany({})
      .then((result) => result.map((r) => r.address)),
  );

  yield* calculateActivityPointsService({
    weekId: week.id,
    addresses,
    useWeekEndDate: true,
  });

  yield* Effect.log('Season points calculation complete');
}).pipe(Effect.provide(CalculateActivityPointsService.Default));

await Effect.runPromise(runnable.pipe(Effect.provide(Logger.pretty)));
