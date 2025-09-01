import type { ActivityId } from 'data';
import { tradingVolume } from 'db/incentives';
import { sql } from 'drizzle-orm';
import { Effect } from 'effect';
import { DbService } from '../db/dbClient';

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
    dependencies: [DbService.Default],
    effect: Effect.gen(function* () {
      const db = yield* DbService;
      return Effect.fn(function* (input: AddTradingVolumeServiceInput) {
        // Implementation goes here
        return yield* db
          .insert(tradingVolume)
          .values(input)
          .onConflictDoUpdate({
            target: [tradingVolume.accountAddress, tradingVolume.timestamp],
            set: {
              data: sql`excluded.data`,
            },
          });
      });
    }),
  },
) {}
