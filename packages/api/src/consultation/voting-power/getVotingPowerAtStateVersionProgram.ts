import { Effect } from "effect";

import { GetVotingPowerAtStateVersionService } from "./getVotingPowerAtStateVersion";
import { getDatesBetweenIntervals } from "../../common/helpers/getDatesBetweenIntervals";
import { insertResult } from "./insertResults"; // or inject as a service


export type VotingPowerAccountInput = {
  account_address: string;
  selected_option: string;
  rola_proof: {
    curve: string;
    publicKey: string;
    signature: string;
  };
  timestamp: string; // or Date if you want to parse it
};

export type GetVotingPowerAtStateVersionProgramInput = {
  startDate: Date;
  endDate: Date;
  addresses: VotingPowerAccountInput[];
};

export const getVotingPowerAtStateVersionProgram = (
  input: GetVotingPowerAtStateVersionProgramInput
) =>
  Effect.gen(function* () {
    const getVotingPowerAtStateVersion =
      yield* GetVotingPowerAtStateVersionService;

    const dates = getDatesBetweenIntervals(
      input.startDate,
      input.endDate,
      (date) => {
        date.setHours(date.getHours() + 1);
      }
    );

    const votingPower = yield* Effect.forEach(dates, (date) => {
      return Effect.gen(function* () {
        yield* Effect.log(`getting voting power for ${date.toISOString()}`);
        const addresses = input.addresses.map((address) => address.account_address);
        const result = yield* getVotingPowerAtStateVersion({
          addresses: addresses,
          state: { timestamp: date },
        });

        // For each record, insert immediately
        yield* Effect.forEach(result, (item) => {
          try {
            const account = input.addresses.find(acc => acc.account_address === item.address);
            return insertResult({
              accountAddress: item.address,
              votingPower: item.votingPower.toString(),
              balances: item.balances,
              timestamp: date,
              selected_option: account ? account.selected_option : "",
              rola_proof: account ? JSON.stringify(account.rola_proof) : "",
            });
          } catch (e) {
            console.error("Insert failed for", item.address, e);
            throw e;
          }
        });

        console.log("Results inserted for", date.toISOString());
        return result.map((item) => ({
          accountAddress: item.address,
          votingPower: item.votingPower.toString(),
          balances: item.balances,
          timestamp: date,
        }));
      });
    });

    return votingPower;
  });
