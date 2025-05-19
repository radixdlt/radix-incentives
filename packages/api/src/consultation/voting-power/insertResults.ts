// insertResult.ts
import { Effect } from "effect";
import { LocalDbClientService } from "./localDbClientLayer";

export type VotingPowerRecord = {
  accountAddress: string;
  votingPower: string;
  balances: any;
  timestamp: Date;
  selected_option: string;
  rola_proof: string; 
};

export const insertResult = (record: VotingPowerRecord) =>
  Effect.gen(function* () {

    const client = yield* LocalDbClientService;
    const insertQuery = `
   INSERT INTO voting_power_results (account_address, voting_power, balances, timestamp, selected_option, rola_proof)
   VALUES ($1, $2, $3, $4, $5, $6)
   ON CONFLICT (account_address, timestamp) DO UPDATE
   SET voting_power = EXCLUDED.voting_power,
       balances = EXCLUDED.balances,
       selected_option = EXCLUDED.selected_option,
       rola_proof = EXCLUDED.rola_proof;
    `;
    yield* Effect.promise(() =>
      client.query(insertQuery, [
        record.accountAddress,
        record.votingPower,
        JSON.stringify(record.balances),
        record.timestamp,
        record.selected_option,
        record.rola_proof,
      ])
    );
    return record; // or void
  });