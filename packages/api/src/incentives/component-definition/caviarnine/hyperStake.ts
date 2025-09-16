import { Effect, Schema } from 'effect';
import { AssetSchema } from '../../../common/assets/schemas';
import type { ComponentEntityDetailsOutput } from '../getComponentEntityDetails';
import {
  CaviarNineLiteralSchema,
  ComponentDefinition,
  MetadataSchema,
  parseAssetFromResourceAddress,
  RadixDataTypeSchema,
} from '../schemas';

const ComponentDataSchema = Schema.transformOrFail(
  Schema.Struct({
    resource_x: RadixDataTypeSchema.ResourceAddress,
    resource_y: RadixDataTypeSchema.ResourceAddress,
    lp_resource: RadixDataTypeSchema.ResourceAddress,
    pool_component: RadixDataTypeSchema.PoolAddress,
  }),
  Schema.Struct({
    resource_x: AssetSchema,
    resource_y: AssetSchema,
    lp_resource: RadixDataTypeSchema.ResourceAddress,
    pool_component: RadixDataTypeSchema.PoolAddress,
  }),
  {
    decode: (value) =>
      Effect.gen(function* () {
        return {
          ...value,
          resource_x: yield* parseAssetFromResourceAddress(value.resource_x),
          resource_y: yield* parseAssetFromResourceAddress(value.resource_y),
        };
      }),
    encode: (value) =>
      Effect.gen(function* () {
        return {
          resource_x: value.resource_x.resourceAddress,
          resource_y: value.resource_y.resourceAddress,
          lp_resource: value.lp_resource,
          pool_component: value.pool_component,
        };
      }),
  },
);

const fromComponentEntityDetails = (
  input: ComponentEntityDetailsOutput[number],
) =>
  Effect.gen(function* () {
    const metadata = yield* Schema.Struct({
      resource_x: MetadataSchema.ResourceAddress,
      lp_resource: MetadataSchema.ResourceAddress,
      resource_y: MetadataSchema.ResourceAddress,
      pool_component: MetadataSchema.PoolAddress,
    }).pipe(Schema.decodeUnknown)(input.metadata);

    return yield* HyperStakeComponent.pipe(Schema.decodeUnknown)({
      ...input,
      data: yield* Schema.decode(ComponentDataSchema)(metadata),
    });
  });

export class HyperStakeComponent extends ComponentDefinition.extend<HyperStakeComponent>(
  'HyperStakeComponent',
)({
  dappId: CaviarNineLiteralSchema,
  blueprintName: Schema.Literal('HyperStake'),
  packageAddress: Schema.Literal(
    'package_rdx1pk7qn3gm9g7s6ss93xgvmytua5awt7ujqkpmcse93zn4dvfel7s8rh',
  ),
  data: Schema.Struct({
    resource_x: AssetSchema,
    lp_resource: RadixDataTypeSchema.ResourceAddress,
    resource_y: AssetSchema,
    pool_component: RadixDataTypeSchema.PoolAddress,
  }),
}) {
  static blueprintName = HyperStakeComponent.fields.blueprintName.literals[0];
  static packageAddresses = HyperStakeComponent.fields.packageAddress.literals;
  static matchPackageAddress = (input: string) =>
    input === HyperStakeComponent.fields.packageAddress.literals[0];
  static fromComponentEntityDetails = fromComponentEntityDetails;
}
