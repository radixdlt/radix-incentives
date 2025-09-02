import type { ActivityId } from 'data';
import { tradingVolume } from 'db/incentives';
import { sql } from 'drizzle-orm';
import { Effect } from 'effect';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';

export type AddTradingVolumeServiceInput = {
  accountAddress: string;
  timestamp: Date;
  data: {
    activityId: ActivityId;
    usdValue: string;
  }[];
}[];

export class AddTradingVolumeService extends Effect.Service<AddTradingVolumeService>()(
  'AddTradingVolumeService',
  {
    dependencies: [dbClientLive],
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return Effect.fn(function* (input: AddTradingVolumeServiceInput) {
        return yield* Effect.tryPromise({
          try: () =>
            db
              .insert(tradingVolume)
              .values(input)
              .onConflictDoUpdate({
                target: [tradingVolume.accountAddress, tradingVolume.timestamp],
                set: {
                  data: sql`excluded.data`,
                },
              }),
          catch: (error) => new DbError(error),
        });
      });
    }),
  },
) {}
