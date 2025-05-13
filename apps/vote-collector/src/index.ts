import { Exit } from "effect";
import { createDependencyLayer } from "api/consultation";
import { db } from "db/consultation";
import { accounts } from "./accounts";

const { getVotingPowerAtStateVersion } = createDependencyLayer({
  dbClient: db,
});

const START_DATE = process.env.START_DATE;
const END_DATE = process.env.END_DATE;

if (!START_DATE || !END_DATE) {
  throw new Error("START_DATE and END_DATE must be set");
}

const main = async () => {
  const startDate = new Date(START_DATE);
  const endDate = new Date(END_DATE);

  // get addresses from DB
  const addresses = accounts.map((account) => account.account_address);

  console.log(`Getting voting power for ${addresses.length} addresses`);

  const result = await getVotingPowerAtStateVersion({
    addresses,
    startDate,
    endDate,
  });

  // if success store the results in DB and exit
  if (Exit.isSuccess(result)) {
    console.log(JSON.stringify(result.value, null, 2));
  }

  // if failure report the error and exit
  if (Exit.isFailure(result)) {
    console.log(JSON.stringify(result.cause, null, 2));
    process.exit(1);
  }
};

main();
