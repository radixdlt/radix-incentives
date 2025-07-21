import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { votingPower } from "db/consultation";
import { sql } from "drizzle-orm";
import { chunker } from "../../common/helpers/chunker";

export class AddVotingPowerToDbService extends Effect.Service<AddVotingPowerToDbService>()(
  "AddVotingPowerToDbService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return {
        run: Effect.fn(function* (
          input: {
            accountAddress: string;
            votingPower: string;
            timestamp: Date;
            balances: Record<string, string>;
          }[]
        ) {
          // Split input into chunks of 10,000 rows
          const chunks = chunker(input, 10000);
          
          // Process each chunk sequentially
          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            yield* Effect.tryPromise({
              try: () =>
                db
                  .insert(votingPower)
                  .values(chunk)
                  .onConflictDoUpdate({
                    target: [votingPower.timestamp, votingPower.accountAddress],
                    set: {
                      votingPower:
                        sql`excluded.voting_power` as unknown as string,
                      balances: sql`excluded.balances` as unknown as object,
                    },
                  }),
              catch: (error) => new DbError(`Batch ${i + 1}/${chunks.length} failed: ${error}`),
            });
          }
        }),
      };
    }),
  }
) {}
