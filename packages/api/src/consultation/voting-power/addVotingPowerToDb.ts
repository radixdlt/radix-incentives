import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { votingPower } from "db/consultation";
import { sql } from "drizzle-orm";

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
          yield* Effect.tryPromise({
            try: () =>
              db
                .insert(votingPower)
                .values(input)
                .onConflictDoUpdate({
                  target: [votingPower.timestamp, votingPower.accountAddress],
                  set: {
                    votingPower:
                      sql`excluded.voting_power` as unknown as string,
                    balances: sql`excluded.balances` as unknown as object,
                  },
                }),
            catch: (error) => new DbError(error),
          });
        }),
      };
    }),
  }
) {}
