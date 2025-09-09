import fs from 'node:fs';
import path from 'node:path';
import { CalculateSeasonPointsService } from 'api/incentives';
import {
  accountActivityPoints,
  accounts,
  activities,
  db,
  seasons,
  userSeasonPoints,
  weeks,
} from 'db/incentives';
import { desc, eq } from 'drizzle-orm';
import { Effect, Logger, LogLevel } from 'effect';
import { groupBy } from 'effect/Array';
import Papa from 'papaparse';

const outputDir = path.join(import.meta.dirname, '../output');

// Custom logger that outputs log messages to the console
const logger = Logger.make(({ logLevel, message }) => {
  const structuredMessage = Array.isArray(message) ? message[0] : null;

  if (logLevel.label === 'DEBUG' && structuredMessage?.writeToFile) {
    const data = structuredMessage.data;
    const name = structuredMessage.name;
    const _dirPath = structuredMessage.path;

    const csv = Papa.unparse(data, {
      quotes: false, //or array of booleans
      quoteChar: '"',
      escapeChar: '"',
      delimiter: ',',
      header: true,
      newline: '\r\n',
      skipEmptyLines: false, //other option is 'greedy', meaning skip delimiters, quotes, and whitespace.
      columns: null, //or array of strings
    });
    // // @ts-ignore

    fs.writeFileSync(path.join(outputDir, `${name}.csv`), csv);
  }

  globalThis.console.log(`[${logLevel.label}] ${message}`);
});

const loggerLayer = Logger.replace(Logger.defaultLogger, logger);

const runnable = Effect.gen(function* () {
  yield* Effect.log('Results written to file');

  yield* Effect.log('Running season points calculation');

  const calculateSeasonPointsServiceLive = CalculateSeasonPointsService.Default;

  const service = yield* Effect.provide(
    CalculateSeasonPointsService,
    calculateSeasonPointsServiceLive,
  );

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

  yield* service.run({
    weekId: week.id,
    force: true,
    markAsProcessed: false,
  });

  yield* Effect.log('Season points calculation complete');

  yield* Effect.log('Writing results to file');

  const userSeasonPointsResults = yield* Effect.tryPromise(() =>
    db
      .select()
      .from(userSeasonPoints)
      .where(eq(userSeasonPoints.weekId, week.id)),
  );

  const accountActivityPointsResults = yield* Effect.tryPromise(() =>
    db
      .select({
        userId: accounts.userId,
        weekId: accountActivityPoints.weekId,
        activityId: accountActivityPoints.activityId,
        activityPoints: accountActivityPoints.activityPoints,
        accountAddress: accounts.address,
        activityCategory: activities.category,
      })
      .from(accountActivityPoints)
      .where(eq(accountActivityPoints.weekId, week.id))
      .innerJoin(
        accounts,
        eq(accountActivityPoints.accountAddress, accounts.address),
      )
      .innerJoin(
        activities,
        eq(accountActivityPoints.activityId, activities.id),
      ),
  );

  const groupedByUserId = groupBy(
    accountActivityPointsResults,
    (item) => item.userId,
  );

  const _withActivityPoints = userSeasonPointsResults.map(
    ({ userId, points }) => ({
      userId,
      seasonPoints: points,
      activityPoints: groupedByUserId[userId]?.map(({ accountAddress }) => {
        const groupByActivityCategory = Object.entries(
          groupBy(groupedByUserId[userId], (item) => item.activityCategory),
        ).map(([activityCategory, items]) => ({
          activityCategory,
          activities: items.map((item) => ({
            activityId: item.activityId,
            activityPoints: item.activityPoints,
            accountAddress: item.accountAddress,
          })),
        }));

        return {
          accountAddress,
          categories: groupByActivityCategory,
        };
      }),
    }),
  );

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // fs.writeFileSync(
  //   path.join(outputDir, 'results.json'),
  //   JSON.stringify(withActivityPoints, null, 2),
  // );

  yield* Effect.log('Results written to file');
});

await Effect.runPromise(
  runnable.pipe(
    Effect.provide(Logger.pretty),
    Logger.withMinimumLogLevel(LogLevel.Debug),
    Effect.provide(loggerLayer),
  ),
);
