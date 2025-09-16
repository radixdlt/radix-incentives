import type {
  EntityMetadataCollection,
  MetadataTypedValue,
  ProgrammaticScryptoSborValue,
} from '@radixdlt/babylon-gateway-api-sdk';
import { Data, Effect } from 'effect';
import {
  type AtLedgerState,
  GetEntityDetailsService,
} from '../../common/gateway';

class InvalidEntityAddressError extends Data.TaggedError(
  'InvalidEntityAddressError',
)<{
  message: string;
  address: string;
}> {}

class PackageAddressNotFoundError extends Data.TaggedError(
  'PackageAddressNotFoundError',
)<{
  message: string;
  address: string;
}> {}

class InvalidComponentStateError extends Data.TaggedError(
  'InvalidComponentStateError',
)<{
  message: string;
  address: string;
  package_address: string;
  error?: unknown;
}> {}

export type ComponentEntityDetailsOutput = Effect.Effect.Success<
  Awaited<ReturnType<(typeof GetComponentEntityDetails)['Service']>>
>;

export class GetComponentEntityDetails extends Effect.Service<GetComponentEntityDetails>()(
  'GetComponentEntityDetails',
  {
    dependencies: [GetEntityDetailsService.Default],
    effect: Effect.gen(function* () {
      const getEntityDetailsService = yield* GetEntityDetailsService;

      // Transform metadata to a plain object
      const transformMetadata = (metadata: EntityMetadataCollection) =>
        metadata.items.reduce<Record<string, MetadataTypedValue>>(
          (acc, item) => {
            const key = item.key;
            const typedValue = item.value.typed;

            acc[key] = typedValue;

            return acc;
          },
          {},
        );

      return Effect.fn(function* (input: {
        componentAddresses: string[];
        at_ledger_state: AtLedgerState;
      }) {
        const entityDetails = yield* getEntityDetailsService(
          input.componentAddresses,
          {},
          input.at_ledger_state,
        );

        return yield* Effect.forEach(
          entityDetails,
          Effect.fnUntraced(function* (entityDetail) {
            const details = entityDetail.details;
            if (details?.type !== 'Component') {
              return yield* Effect.fail(
                new InvalidEntityAddressError({
                  message: 'Entity is not a component',
                  address: entityDetail.address,
                }),
              );
            }

            const package_address = details.package_address;

            if (!package_address) {
              return yield* Effect.fail(
                new PackageAddressNotFoundError({
                  message: 'Package address not found for component',
                  address: entityDetail.address,
                }),
              );
            }

            if (!details.state) {
              return yield* Effect.fail(
                new InvalidComponentStateError({
                  message: 'Component state not found',
                  address: entityDetail.address,
                  package_address,
                }),
              );
            }

            const state = details.state as ProgrammaticScryptoSborValue;

            const metadata = transformMetadata(entityDetail.metadata);

            return {
              packageAddress: package_address,
              componentAddress: entityDetail.address,
              blueprintName: details.blueprint_name,
              metadata,
              componentState: state,
            };
          }),
        );
      });
    }),
  },
) {}
