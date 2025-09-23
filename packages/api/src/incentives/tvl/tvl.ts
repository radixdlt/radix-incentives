import { BigNumber } from 'bignumber.js';
import { componentAddressActivityDataMap } from 'data';
import { Data, Effect, Schema } from 'effect';
import { AssetSchema } from '../../common/assets/schemas';
import { ComponentRepo } from '../component-definition/componentRepo';
import { RadixDataTypeSchema } from '../component-definition/schemas';
import { GetUsdValueService } from '../token-price/getUsdValue';

const getShapeLiquidityComponents = Effect.promise(() =>
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

const getSimplePoolsComponents = Effect.promise(() =>
  fetch('https://api-core.caviarnine.com/v1.0/stats/product/simplepools').then(
    (res) => res.json(),
  ),
).pipe(
  Effect.flatMap((data) =>
    Schema.decodeUnknown(
      Schema.Struct({
        summary: Schema.Struct({
          components: Schema.Array(RadixDataTypeSchema.ComponentAddress),
        }),
      }),
    )(data),
  ),
  Effect.map((data) => [...data.summary.components]),
);

const getOciswapComponents = Effect.promise(() =>
  fetch(
    'https://api.ociswap.com/pools?cursor=0&limit=100&order=rank&direction=asc',
  ).then((res) => res.json()),
).pipe(
  Effect.flatMap((data) =>
    Schema.decodeUnknown(
      Schema.Struct({
        data: Schema.Array(
          Schema.Struct({
            address: RadixDataTypeSchema.ComponentAddress,
          }),
        ),
      }),
    )(data),
  ),
  Effect.map((data) => [...data.data.flatMap((item) => item.address)]),
);

const getDefiPlazaComponents = Effect.promise(() =>
  fetch('https://radix.defiplaza.net/api/pairs').then((res) => res.json()),
).pipe(
  Effect.flatMap((data) =>
    Schema.decodeUnknown(
      Schema.Struct({
        data: Schema.Array(
          Schema.Struct({
            address: RadixDataTypeSchema.ComponentAddress,
          }),
        ),
      }),
    )(data),
  ),
  Effect.map((data) => [...data.data.flatMap((item) => item.address)]),
);

export class TvlSchema extends Schema.Class<TvlSchema>('TvlSchema')({
  dex: Schema.String,
  blueprintName: Schema.String,
  componentAddress: RadixDataTypeSchema.ComponentAddress,
  xToken: AssetSchema,
  yToken: AssetSchema,
  inCampaign: Schema.Boolean,
  tvl: Schema.String,
  url: Schema.String,
}) {}

class ComponentDefinitionError extends Data.TaggedError(
  'ComponentDefinitionError',
)<{
  message: string;
}> {}

export class TVLService extends Effect.Service<TVLService>()('TVLService', {
  dependencies: [GetUsdValueService.Default, ComponentRepo.Default],
  effect: Effect.gen(function* () {
    const getUsdValue = yield* GetUsdValueService;
    const componentRepo = yield* ComponentRepo;

    return {
      dexComponentsTvl: Effect.fn(function* () {
        const shapeLiquidityComponents = yield* getShapeLiquidityComponents;
        const simplePoolsComponents = yield* getSimplePoolsComponents;
        const ociswapComponents = yield* getOciswapComponents;
        const defiPlazaComponents = yield* getDefiPlazaComponents;

        const timestamp = new Date();

        const components = yield* componentRepo.getByComponentAddresses([
          ...ociswapComponents,
          ...shapeLiquidityComponents,
          ...defiPlazaComponents,
          ...simplePoolsComponents,
        ]);

        const items = yield* Effect.forEach(
          components,
          Effect.fnUntraced(function* (componentDefinition) {
            if (!('tvl' in componentDefinition)) {
              return yield* Effect.fail(
                new ComponentDefinitionError({
                  message: `Component definition does not have tvl property: ${componentDefinition.componentAddress} (${componentDefinition.blueprintName})`,
                }),
              );
            }

            const tvl = yield* Effect.forEach(
              componentDefinition.tvl,
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

            if (tvl.length === 0) {
              return yield* Effect.fail(
                new ComponentDefinitionError({
                  message: `Component definition does not have tvl property: ${componentDefinition.componentAddress} (${componentDefinition.blueprintName})`,
                }),
              );
            }

            const tvlUsd = tvl.reduce(
              (acc, item) => acc.plus(item.usdValue),
              new BigNumber(0),
            );

            const exists =
              componentAddressActivityDataMap[
                componentDefinition.componentAddress
              ];

            return new TvlSchema({
              dex: componentDefinition.dappId,
              blueprintName: componentDefinition.blueprintName,
              componentAddress: componentDefinition.componentAddress,
              xToken: componentDefinition.data.xToken,
              yToken: componentDefinition.data.yToken,
              inCampaign: !!exists,
              tvl: tvlUsd.toString(),
              url: componentDefinition.url,
            });
          }),
          { concurrency: 25 },
        );

        return items;
      }),
    };
  }),
}) {}
