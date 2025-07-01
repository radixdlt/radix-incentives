import { Effect } from "effect";
import BigNumber from "bignumber.js";
import type { AccountBalanceGroupedByAddressAndActivityId } from "../account-balance/accountBalance";

type AccountAddress = string;
type ActivityId = string;

export type AccountActivityPointsMap = Record<
  AccountAddress,
  Record<ActivityId, BigNumber>
>;

export type TWACalculationType = "USDValue" | "USDValueDurationMultiplied";

export const calculateTWA = ({
  items: grouped,
  week,
  calculationType = "USDValueDurationMultiplied",
}: {
  items: AccountBalanceGroupedByAddressAndActivityId[];
  week: { endDate: Date };
  calculationType?: TWACalculationType;
}) =>
  Effect.gen(function* () {
    const resultWithTwa: Record<
      AccountAddress,
      Record<ActivityId, BigNumber>
    > = {};

    // Iterate over the array of account records
    for (const accountRecord of grouped) {
      const { accountAddress, activities } = accountRecord;
      resultWithTwa[accountAddress] = {};

      // Iterate over activities for this account
      for (const activityRecord of activities) {
        const { activityId, items } = activityRecord;

        const itemsSortedByTimestamp = items.sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        );

        if (!itemsSortedByTimestamp || itemsSortedByTimestamp.length === 0)
          continue;

        let { totalWeightedValue, totalDurationInMilliseconds } =
          itemsSortedByTimestamp.slice(0, -1).reduce(
            (acc, currentItem, index) => {
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              const nextItem = itemsSortedByTimestamp[index + 1]!;
              const currentUsdValue = new BigNumber(currentItem.usdValue);
              const duration =
                nextItem.timestamp.getTime() - currentItem.timestamp.getTime();

              return {
                totalWeightedValue: acc.totalWeightedValue.plus(
                  currentUsdValue.multipliedBy(duration)
                ),
                totalDurationInMilliseconds:
                  acc.totalDurationInMilliseconds.plus(duration),
              };
            },
            {
              totalWeightedValue: new BigNumber(0),
              totalDurationInMilliseconds: new BigNumber(0),
            }
          );

        // Handle the last item - assume it holds until the end date
        if (itemsSortedByTimestamp.length > 0) {
          const lastItem = itemsSortedByTimestamp.at(-1);

          if (!lastItem) continue;

          const lastUsdValue = new BigNumber(lastItem.usdValue);
          const lastDuration =
            week.endDate.getTime() - lastItem.timestamp.getTime();

          if (lastDuration > 0) {
            totalWeightedValue = totalWeightedValue.plus(
              lastUsdValue.multipliedBy(lastDuration)
            );
            totalDurationInMilliseconds =
              totalDurationInMilliseconds.plus(lastDuration);
          }
        }

        const timeWeightedAverageUsdValue = totalDurationInMilliseconds.gt(0)
          ? totalWeightedValue.div(totalDurationInMilliseconds)
          : new BigNumber(0);

        const totalDurationInMinutes = totalDurationInMilliseconds.div(
          1000 * 60
        );

        // Calculate result based on calculation type
        resultWithTwa[accountAddress][activityId] =
          calculationType === "USDValue"
            ? timeWeightedAverageUsdValue.decimalPlaces(2)
            : timeWeightedAverageUsdValue
                .multipliedBy(totalDurationInMinutes)
                .decimalPlaces(0);
      }
    }

    return resultWithTwa;
  });
