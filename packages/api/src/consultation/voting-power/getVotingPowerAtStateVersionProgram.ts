import { Effect } from "effect";

import { GetVotingPowerAtStateVersionService } from "./getVotingPowerAtStateVersion";
import { getDatesBetweenIntervals } from "../../common/helpers/getDatesBetweenIntervals";

export type GetVotingPowerAtStateVersionProgramInput = {
  startDate: Date;
  endDate: Date;
  addresses: string[];
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
        const result = yield* getVotingPowerAtStateVersion({
          addresses: input.addresses,
          at_ledger_state: { timestamp: date },
        });

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
