import { SeasonPointsMultiplierWorkerService } from 'api/incentives';
import { db, weeks } from 'db/incentives';
import { desc } from 'drizzle-orm';
import { Effect } from 'effect';

const program = Effect.gen(function* () {
  const multiplierService = yield* SeasonPointsMultiplierWorkerService;

  const userIds = yield* Effect.tryPromise(() =>
    db.query.users.findMany({}).then((result) => result.map((r) => r.id)),
  );

  const week = yield* Effect.tryPromise(() =>
    db.query.weeks.findFirst({
      orderBy: [desc(weeks.startDate)],
    }),
  );

  if (!week) {
    return yield* Effect.fail('Week not found');
  }

  const multiplier = yield* multiplierService({
    weekId: week.id,
    userIds: userIds,
  });
  return multiplier;
}).pipe(Effect.provide(SeasonPointsMultiplierWorkerService.Default));

await Effect.runPromise(program);
