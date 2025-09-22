import type {
  EntityMetadataCollection,
  MetadataTypedValue,
} from '@radixdlt/babylon-gateway-api-sdk';

export const transformMetadata = (metadata: EntityMetadataCollection) =>
  metadata.items.reduce<Record<string, MetadataTypedValue>>((acc, item) => {
    const key = item.key;
    const typedValue = item.value.typed;

    acc[key] = typedValue;

    return acc;
  }, {});
