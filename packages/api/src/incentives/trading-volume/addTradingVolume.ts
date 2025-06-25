import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import type { ActivityId } from "db/incentives";
import { tradingVolume } from "db/incentives";
import { sql } from "drizzle-orm";

export type AddTradingVolumeServiceInput = {
  accountAddress: string;
  timestamp: Date;
  data: {
    activityId: ActivityId;
    usdValue: string;
  }[];
}[];

export class AddTradingVolumeService extends Context.Tag(
  "AddTradingVolumeService"
)<
  AddTradingVolumeService,
  (input: AddTradingVolumeServiceInput) => Effect.Effect<void, DbError>
>() {}

export const AddTradingVolumeLive = Layer.effect(
  AddTradingVolumeService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) => {
      return Effect.gen(function* () {
        if (input.length === 0) return;

        const result = yield* Effect.tryPromise({
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

        return result;
      });
    };
  })
);
