import { BigNumber } from 'bignumber.js';
import { componentAddressActivityDataMap } from 'data';
import { Effect, Schema } from 'effect';
import { QuantaSwapComponent } from '../component-definition/caviarnine/quantaSwap';
import { GetComponentEntityDetails } from '../component-definition/getComponentEntityDetails';
import { RadixDataTypeSchema } from '../component-definition/schemas';
import { GetUsdValueService } from '../token-price/getUsdValue';

const shapeLiquidityComponents = Effect.promise(() =>
  fetch(
    'https://api-core.caviarnine.com/v1.0/stats/product/shapeliquidity',
  ).then((res) => res.json()),
).pipe(
  Effect.flatMap((data) =>
    Schema.decodeUnknown(
      Schema.Struct({
        components: Schema.Array(RadixDataTypeSchema.ComponentAddress),
      }),
    )(data),
  ),
  Effect.map((data) => [...data.components]),
);

export class TVLService extends Effect.Service<TVLService>()('TVLService', {
  dependencies: [GetComponentEntityDetails.Default, GetUsdValueService.Default],
  effect: Effect.gen(function* () {
    const getComponentEntityDetails = yield* GetComponentEntityDetails;
    const getUsdValue = yield* GetUsdValueService;

    return {
      shapeLiquidityComponents: Effect.fn(function* () {
        const componentAddresses = yield* shapeLiquidityComponents;

        const timestamp = new Date();

        const componentEntityDetails = yield* getComponentEntityDetails({
          componentAddresses,
          at_ledger_state: {
            timestamp,
          },
        });

        const quantaSwapComponents = yield* Effect.forEach(
          componentEntityDetails,
          Effect.fnUntraced(function* (componentEntityDetail) {
            const result =
              yield* QuantaSwapComponent.fromComponentEntityDetails(
                componentEntityDetail,
              );

            const tvl = yield* Effect.forEach(
              result.tvl,
              Effect.fnUntraced(function* (item) {
                const amount = new BigNumber(item.amount);
                const usdValue = yield* getUsdValue({
                  amount: new BigNumber(item.amount),
                  resourceAddress: item.resourceAddress.resourceAddress,
                  timestamp,
                }).pipe(
                  Effect.catchTags({
                    InvalidResourceAddressError: () =>
                      Effect.succeed(new BigNumber(0)),
                    MissingPriceError: () => Effect.succeed(new BigNumber(0)),
                  }),
                );
                return {
                  ...item,
                  amount,
                  usdValue,
                };
              }),
            );

            const tvlUsd = tvl.reduce(
              (acc, item) => acc.plus(item.usdValue),
              new BigNumber(0),
            );

            const exists =
              componentAddressActivityDataMap[result.componentAddress];

            return {
              ...result,
              tvlUsd,
              tvl,
              exists: !!exists,
            };
          }),
          { concurrency: 25 },
        );

        // Price data might be missing in the price service
        // const filteredComponents = quantaSwapComponents.filter((item) =>
        //   item.tvlUsd.gt(1),
        // );

        const sortedComponents = quantaSwapComponents.sort((a, b) => {
          const result = a.tvlUsd.negated().comparedTo(b.tvlUsd.negated());
          return result ?? 0;
        });

        return sortedComponents;
      }),
    };
  }),
}) {}
