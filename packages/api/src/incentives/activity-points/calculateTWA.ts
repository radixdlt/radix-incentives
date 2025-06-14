import { Effect } from "effect";
import type { GetWeekAccountBalancesOutput } from "./getWeekAccountBalances";
import BigNumber from "bignumber.js";

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
  items: GetWeekAccountBalancesOutput;
  week: { endDate: Date };
  calculationType?: TWACalculationType;
}) =>
  Effect.gen(function* () {
    const resultWithTwa: Record<
      AccountAddress,
      Record<ActivityId, BigNumber>
    > = {};

    for (const accountAddress in grouped) {
      resultWithTwa[accountAddress] = {};

      for (const activityId in grouped[accountAddress]) {
        const itemsSortedByTimestamp = grouped?.[accountAddress]?.[
          activityId
        ]?.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

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
        resultWithTwa[accountAddress][activityId] = calculationType === "USDValue"
          ? timeWeightedAverageUsdValue.decimalPlaces(0)
          : timeWeightedAverageUsdValue.multipliedBy(totalDurationInMinutes).decimalPlaces(0);
      }
    }

    return resultWithTwa;
  });
