import { Effect, Schema } from 'effect';
import { AssetSchema } from '../../../common/assets/schemas';
import { GetEntityDetailsService } from '../../../common/gateway/getEntityDetails';
import {
  fromFungibleResourcesVaultCollection,
  fungibleResourceBalanceSchema,
} from '../../../common/schemas/fungibleResource';
import {
  type ComponentEntityDetailsOutput,
  GetComponentEntityDetails,
} from '../getComponentEntityDetails';
import {
  ComponentDefinition,
  DefiPlazaLiteralSchema,
  RadixDataTypeSchema,
} from '../schemas';
import { parsePlazaPairComponentState } from './helpers/parsePlazaPairComponentState';

const fromComponentEntityDetails = (
  input: ComponentEntityDetailsOutput[number],
) =>
  Effect.gen(function* () {
    const getEntityDetails = yield* GetEntityDetailsService;
    const componentState = yield* parsePlazaPairComponentState(
      input.componentState,
    );

    const [baseEntityDetails] = yield* getEntityDetails(
      [componentState.base_pool],
      {},
      {
        timestamp: new Date(),
      },
    );

    const [quoteEntityDetails] = yield* getEntityDetails(
      [componentState.quote_pool],
      {},
      {
        timestamp: new Date(),
      },
    );

    const tvlBase = yield* Schema.decodeUnknown(
      fromFungibleResourcesVaultCollection,
    )(baseEntityDetails.fungible_resources);

    const tvlQuote = yield* Schema.decodeUnknown(
      fromFungibleResourcesVaultCollection,
    )(quoteEntityDetails.fungible_resources);

    const tvl = tvlBase.concat(tvlQuote);

    return yield* PlazaPairSchema.pipe(Schema.decodeUnknown)({
      ...input,
      data: {
        ...componentState,
        xToken: componentState.base_address,
        yToken: componentState.quote_address,
      },
      tvl,
      url: `https://radix.defiplaza.net/liquidity/add/${componentState.base_address.resourceAddress}?direction=base`,
    });
  }).pipe(
    Effect.provide(GetComponentEntityDetails.Default),
    Effect.provide(GetEntityDetailsService.Default),
  );

export class PlazaPairSchema extends ComponentDefinition.extend<PlazaPairSchema>(
  'PlazaPairSchema',
)({
  dappId: DefiPlazaLiteralSchema,
  packageAddress: Schema.Literal(
    'package_rdx1p4lnurhaffzjeg3gu0k27g06ngkvxvyuksczmk9k6gqvztfpks8r7l',
    'package_rdx1p4dhfl7qwthqqu6p2267m5nedlqnzdvfxdl6q7h8g85dflx8n06p93',
  ),
  blueprintName: Schema.Literal('PlazaPair'),
  data: Schema.Struct({
    quote_pool_unit: RadixDataTypeSchema.ResourceAddress,
    base_pool_unit: RadixDataTypeSchema.ResourceAddress,
    // base
    xToken: AssetSchema,
    // quote
    yToken: AssetSchema,
    quote_address: AssetSchema,
    base_pool: RadixDataTypeSchema.PoolAddress,
    quote_pool: RadixDataTypeSchema.PoolAddress,
  }),
  tvl: Schema.Array(fungibleResourceBalanceSchema),
  url: Schema.String,
}) {
  static packageAddresses = PlazaPairSchema.fields.packageAddress.literals;
  static matchPackageAddress = (input: string) =>
    input === PlazaPairSchema.fields.packageAddress.literals[0] ||
    input === PlazaPairSchema.fields.packageAddress.literals[1];
  static fromComponentEntityDetails = fromComponentEntityDetails;
  static blueprintName = PlazaPairSchema.fields.blueprintName.literals[0];
}
