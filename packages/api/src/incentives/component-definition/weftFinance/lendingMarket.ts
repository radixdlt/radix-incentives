import { Assets } from 'data';
import { Effect, Schema } from 'effect';
import type { ComponentEntityDetailsOutput } from '../getComponentEntityDetails';
import {
  ComponentDefinition,
  MetadataSchema,
  parseAssetFromResourceAddress,
  RadixDataTypeSchema,
  WeftFinanceLiteralSchema,
} from '../schemas';

const fromComponentEntityDetails = (
  input: ComponentEntityDetailsOutput[number],
) =>
  Effect.gen(function* () {
    const data = yield* Schema.Struct({
      lending_pool: MetadataSchema.ComponentAddress,
      cdp: MetadataSchema.ResourceAddress,
    }).pipe(Schema.decodeUnknown)(input.metadata);

    return yield* LendingMarketComponent.pipe(Schema.decodeUnknown)({
      ...input,
      data,
    });
  });

export class LendingMarketComponent extends ComponentDefinition.extend<LendingMarketComponent>(
  'WeftFinanceLendingMarketComponent',
)({
  dappId: WeftFinanceLiteralSchema,
  blueprintName: Schema.Literal('LendingMarket'),
  packageAddress: Schema.Literal(
    'package_rdx1pktdrmwan4mcugates06wwcvspn4y0hsapm9zkyg4clh0sf8qn7c6t',
  ),
  data: Schema.Struct({
    lending_pool: RadixDataTypeSchema.ComponentAddress,
    cdp: RadixDataTypeSchema.ResourceAddress,
  }),
}) {
  static blueprintName =
    LendingMarketComponent.fields.blueprintName.literals[0];
  static packageAddresses =
    LendingMarketComponent.fields.packageAddress.literals;
  static matchPackageAddress = (input: string) =>
    input === LendingMarketComponent.fields.packageAddress.literals[0];
  static fromComponentEntityDetails = fromComponentEntityDetails;

  static supportedAssets = Effect.forEach(
    [
      Assets.Fungible.XRD,
      Assets.Fungible.LSULP,
      Assets.Fungible.xUSDC,
      Assets.Fungible.xUSDT,
      Assets.Fungible.wxBTC,
      Assets.Fungible.xETH,
      Assets.Fungible.hUSDC,
      Assets.Fungible.hUSDT,
      Assets.Fungible.hwBTC,
      Assets.Fungible.hETH,
    ],
    Effect.fnUntraced(function* (resourceAddress) {
      return yield* parseAssetFromResourceAddress(resourceAddress);
    }),
  );
}
