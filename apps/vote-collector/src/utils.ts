import { Effect, Schema } from "effect"
import { Client } from 'pg'

class DatabaseError {
    readonly _tag: 'DatabaseError'
}
class ParseError {
    readonly _tag: 'ParseError'
}

const VotingPowerRecord = Schema.Struct({
    accountAddress: Schema.String,
    votingPower: Schema.Number,
    balances: Schema.Unknown, // Changed from Schema.Json to Schema.Unknown
    timestamp: Schema.Date,
})

const parseVotingPowerRecord = Schema.decodeUnknown(VotingPowerRecord)

// type QueryVotingPower = {
//     _tag: 'QueryVotingPower',
//     fetchResults: Effect.Effect<typeof VotingPowerRecord[], DatabaseError>
// }

export const queryVotingPower = () =>
  Effect.gen(function* () {
    const client = new Client({
      connectionString:
        process.env.DATABASE_URL ||
        "postgresql://postgres:password@localhost:5432/radix-incentives",
    });
    yield* Effect.tryPromise({
      try: async () => {
        await client.connect();
      },
      catch: () => new DatabaseError(),
    });

    let rows: any[] = [];
   
      const result = yield* Effect.tryPromise({
        try: async () => await client.query("SELECT * FROM voting_power_results"),
        catch: () => new DatabaseError(),
      });
      rows = result.rows;
   
      yield* Effect.tryPromise({
        try: async () => {
          await client.end();
        },
        catch: () => undefined, // ignore close errors
      });
    

    // For each row, return an Effect that decodes it to VotingPowerRecord or fails with ParseError
    const effects = rows.map((row) =>
      Effect.try({
        try: () => parseVotingPowerRecord(row),
        catch: () => new ParseError(),
      })
    );
    return effects;
  });