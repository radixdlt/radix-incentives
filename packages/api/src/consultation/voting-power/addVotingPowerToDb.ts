import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { votingPower } from "db/consultation";
import { sql } from "drizzle-orm";

export class AddVotingPowerToDbService extends Context.Tag(
  "AddVotingPowerToDbService"
)<
  AddVotingPowerToDbService,
  (
    input: {
      accountAddress: string;
      votingPower: string;
      timestamp: Date;
      balances: Record<string, string>;
    }[]
  ) => Effect.Effect<void, DbError, DbClientService>
>() {}

export const AddVotingPowerToDbLive = Layer.effect(
  AddVotingPowerToDbService,
  Effect.gen(function* () {
    const db = yield* DbClientService;
    return (input) => {
      return Effect.gen(function* () {
        yield* Effect.tryPromise({
          try: () =>
            db
              .insert(votingPower)
              .values(input)
              .onConflictDoUpdate({
                target: [votingPower.timestamp, votingPower.accountAddress],
                set: {
                  votingPower: sql`excluded.voting_power` as unknown as string,
                  balances: sql`excluded.balances` as unknown as object,
                },
              }),
          catch: (error) => new DbError(error),
        });
      });
    };
  })
);
