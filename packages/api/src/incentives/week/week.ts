import { seasons, weeks } from 'db/incentives';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { Data, Effect } from 'effect';
import { z } from 'zod';
import { ActivityCategoryWeekService } from '../activity-category-week/activityCategoryWeek';
import { ActivityWeekService } from '../activity-week/activityWeek';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';

class WeekNotFoundError extends Data.TaggedError('WeekNotFoundError')<{
  message: string;
}> {}

export const CreateWeekSchema = z.object({
  seasonId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
});

export type CreateWeekInput = z.infer<typeof CreateWeekSchema>;

export class WeekService extends Effect.Service<WeekService>()('WeekService', {
  dependencies: [
    dbClientLive,
    ActivityWeekService.Default,
    ActivityCategoryWeekService.Default,
  ],
  effect: Effect.gen(function* () {
    const db = yield* DbClientService;
    const activityWeekService = yield* ActivityWeekService;
    const activityCategoryWeekService = yield* ActivityCategoryWeekService;

    return {
      getByDate: Effect.fn(function* (date: Date) {
        const week = yield* Effect.tryPromise({
          try: () =>
            db.query.weeks.findFirst({
              where: and(lte(weeks.startDate, date), gte(weeks.endDate, date)),
            }),
          catch: (error) => new DbError(error),
        });

        if (!week) {
          return yield* Effect.fail(
            new WeekNotFoundError({
              message: `No week found for date ${date.toISOString()}`,
            }),
          );
        }

        return week;
      }),
      getById: Effect.fn(function* (id: string) {
        const week = yield* Effect.tryPromise({
          try: () => db.query.weeks.findFirst({ where: eq(weeks.id, id) }),
          catch: (error) => new DbError(error),
        });

        if (!week) {
          return yield* Effect.fail(
            new WeekNotFoundError({ message: `Week ${id} not found` }),
          );
        }

        return week;
      }),
      create: Effect.fn(function* (input: CreateWeekInput) {
        const lastWeekId = yield* Effect.tryPromise({
          try: () =>
            db.query.weeks
              .findMany({
                where: and(eq(weeks.seasonId, input.seasonId)),
                orderBy: [desc(weeks.startDate)],
              })
              .then((weeks) => weeks[0]?.id),
          catch: (error) => new DbError(error),
        });

        const newWeek = yield* Effect.tryPromise({
          try: () =>
            db
              .insert(weeks)
              .values(input)
              .returning()
              .then(([week]) => week),
          catch: (error) => new DbError(error),
        });

        if (!newWeek) {
          return yield* Effect.fail(
            new DbError(new Error('Failed to create week')),
          );
        }

        yield* Effect.log(
          `Cloning activities from ${lastWeekId ?? 'none'} to ${newWeek.id}`,
        );

        yield* Effect.all([
          activityCategoryWeekService.cloneByWeekId({
            fromWeekId: lastWeekId,
            toWeekId: newWeek.id,
          }),
          activityWeekService.cloneByWeekId({
            fromWeekId: lastWeekId,
            toWeekId: newWeek.id,
          }),
        ]);
      }),
      list: Effect.fn(function* (input: { seasonId?: string }) {
        const now = new Date();
        const query = db
          .select({
            id: weeks.id,
            seasonId: weeks.seasonId,
            startDate: weeks.startDate,
            endDate: weeks.endDate,
            seasonName: seasons.name,
          })
          .from(weeks)
          .innerJoin(seasons, eq(weeks.seasonId, seasons.id))
          .where(
            and(
              // Only show weeks that have started (using UTC time)
              lte(weeks.startDate, now),
              // Add seasonId filter if provided
              input.seasonId ? eq(weeks.seasonId, input.seasonId) : undefined,
            ),
          );

        return yield* Effect.tryPromise({
          try: () => query.orderBy(desc(weeks.startDate)),
          catch: (error) => new DbError(error),
        });
      }),
      getUnprocessedWeeks: Effect.fn(function* () {
        const result = yield* Effect.tryPromise({
          try: () =>
            db
              .execute(sql`
            WITH account_count AS (
                select w.id as week_id, w.start_date, w.end_date, count(*) as cnt
                from account a
                inner join week w on a.created_at < w.end_date
                where w.processed = false
                  and w.end_date < NOW()
                group by w.id, w.start_date, w.end_date
            ),
            balance_count AS (
                select w.id as week_id, w.start_date, w.end_date, COUNT(DISTINCT (DATE_TRUNC('hour', timestamp), account_address)) as cnt
                from account_balances ab
                inner join week w on ab.timestamp >= DATE_TRUNC('hour', w.end_date)
                  and ab.timestamp < DATE_TRUNC('hour', w.end_date) + INTERVAL '1 hour'
                where w.processed = false
                  and w.end_date < NOW()
                group by w.id, w.start_date, w.end_date
            )
            select 
                COALESCE(ac.week_id, bc.week_id) as week_id,
                COALESCE(ac.start_date, bc.start_date) as start_date,
                COALESCE(ac.end_date, bc.end_date) as end_date,
                COALESCE(ac.cnt, 0) = COALESCE(bc.cnt, 0) as counts_match,
                COALESCE(ac.cnt, 0) as account_count,
                COALESCE(bc.cnt, 0) as balance_count
            from account_count ac
            full outer join balance_count bc on ac.week_id = bc.week_id
            order by week_id;`)
              .then((result) =>
                Array.from(result.values()).map(
                  (row) =>
                    ({
                      weekId: row.week_id,
                      startDate: row.start_date,
                      endDate: row.end_date,
                      accountCount: row.account_count,
                      balanceCount: row.balance_count,
                      countsMatch: row.counts_match,
                    }) as {
                      weekId: string;
                      startDate: Date;
                      endDate: Date;
                      accountCount: number;
                      balanceCount: number;
                      countsMatch: boolean;
                    },
                ),
              ),
          catch: (error) => new DbError(error),
        });

        return result;
      }),
    };
  }),
}) {}
