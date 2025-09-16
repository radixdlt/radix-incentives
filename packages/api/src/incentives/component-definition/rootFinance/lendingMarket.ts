import { Assets } from 'data';
import { Effect, Schema } from 'effect';
import type { ComponentEntityDetailsOutput } from '../getComponentEntityDetails';
import {
  ComponentDefinition,
  parseAssetFromResourceAddress,
  RootFinanceLiteralSchema,
} from '../schemas';

const fromComponentEntityDetails = (
  input: ComponentEntityDetailsOutput[number],
) =>
  Effect.gen(function* () {
    return yield* LendingMarketComponent.pipe(Schema.decodeUnknown)(input);
  });

export class LendingMarketComponent extends ComponentDefinition.extend<LendingMarketComponent>(
  'RootFinanceLendingMarketComponent',
)({
  dappId: RootFinanceLiteralSchema,
  blueprintName: Schema.Literal('LendingMarket'),
  packageAddress: Schema.Literal(
    'package_rdx1phwak2lr7nczzl6rxzvtnjwszmvxqycp9h8pckcmy6uwdcucnjeu0p',
  ),
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
