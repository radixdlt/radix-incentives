import { seasons, weeks } from 'db/incentives';
import { Effect } from 'effect';
import { DbClientService, dbClientLive } from '../incentives/db/dbClient';

// Get Monday of current week (at 00:00:00 UTC)
function getMondayOfWeekUTC(date = new Date()) {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  d.setUTCDate(diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// Get Sunday midnight of current week (at 23:59:59.999 UTC)
function getSundayOfWeekUTC(date = new Date()) {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? 0 : 7);
  d.setUTCDate(diff);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

export const createWeek = ({
  seasonId,
  startDate = getMondayOfWeekUTC(),
  endDate = getSundayOfWeekUTC(),
}: {
  seasonId: string;
  startDate?: Date;
  endDate?: Date;
}) =>
  Effect.gen(function* () {
    const db = yield* DbClientService;

    const [week] = yield* Effect.promise(() =>
      db
        .insert(weeks)
        .values({
          seasonId,
          startDate,
          endDate,
        })
        .returning(),
    );
    return week;
  });

export const createSeasonAndWeek = (input?: {
  startDate?: Date;
  endDate?: Date;
  name?: string;
  status?: 'active' | 'upcoming' | 'completed';
}) =>
  Effect.gen(function* () {
    const defaultInput = {
      startDate: getMondayOfWeekUTC(),
      endDate: getSundayOfWeekUTC(),
      name: 'Season 1',
      status: 'active' as const,
    };
    const {
      startDate = defaultInput.startDate,
      endDate = defaultInput.endDate,
      name = defaultInput.name,
      status = defaultInput.status,
    } = input ?? defaultInput;

    const db = yield* DbClientService;

    const [season] = yield* Effect.promise(() =>
      db.insert(seasons).values({ name, status }).returning(),
    );

    const week = yield* createWeek({ seasonId: season.id, startDate, endDate });

    return {
      week,
      season,
    };
  }).pipe(Effect.provide(dbClientLive));
