// insertResult.ts
import { Effect } from "effect";
import { LocalDbClientService } from "./localDbClientLayer";

export type VotingPowerRecord = {
  accountAddress: string;
  votingPower: string;
  balances: any;
  timestamp: Date;
};

export const insertResult = (record: VotingPowerRecord) =>
  Effect.gen(function* () {
    const client = yield* LocalDbClientService;
    const insertQuery = `
      INSERT INTO voting_power_results (account_address, voting_power, balances, timestamp)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (account_address, timestamp) DO UPDATE
      SET voting_power = EXCLUDED.voting_power,
          balances = EXCLUDED.balances;
    `;
    yield* Effect.promise(() =>
      client.query(insertQuery, [
        record.accountAddress,
        record.votingPower,
        JSON.stringify(record.balances),
        record.timestamp,
      ])
    );
    return record; // or void
  });