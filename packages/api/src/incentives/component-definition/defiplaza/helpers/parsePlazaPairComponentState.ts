import type { ProgrammaticScryptoSborValue } from '@radixdlt/babylon-gateway-api-sdk';
import { Effect, Schema } from 'effect';
import s from 'sbor-ez-mode';
import { AssetSchema } from '../../../../common/assets/schemas';
import { GetComponentEntityDetails } from '../../getComponentEntityDetails';
import {
  MetadataSchema,
  parseAssetFromResourceAddress,
  parseComponentStateSchema,
  RadixDataTypeSchema,
} from '../../schemas';

const PlazaPairComponentStateSchema = s.struct({
  base_address: s.address(),
  quote_address: s.address(),
  base_pool: s.address(),
  quote_pool: s.address(),
});

class PlazaPairComponentState extends Schema.Class<PlazaPairComponentState>(
  'PlazaPairComponentState',
)({
  quote_pool_unit: MetadataSchema.ResourceAddress,
  base_pool_unit: MetadataSchema.ResourceAddress,
  base_address: AssetSchema,
  quote_address: AssetSchema,
  base_pool: RadixDataTypeSchema.PoolAddress,
  quote_pool: RadixDataTypeSchema.PoolAddress,
}) {}

export const parsePlazaPairComponentState = (
  state: ProgrammaticScryptoSborValue,
) =>
  Effect.gen(function* () {
    const getComponentEntityDetails = yield* GetComponentEntityDetails;

    const { quote_pool, quote_address, base_pool, base_address } =
      yield* parseComponentStateSchema(state, PlazaPairComponentStateSchema);

    const detailResults = yield* getComponentEntityDetails({
      componentAddresses: [base_pool, quote_pool],
      at_ledger_state: {
        timestamp: new Date(),
      },
    });

    const quoteDetailResult = detailResults.find(
      (detail) => detail.componentAddress === quote_pool,
    );

    const baseDetailResult = detailResults.find(
      (detail) => detail.componentAddress === base_pool,
    );

    return yield* Schema.decodeUnknown(PlazaPairComponentState)({
      quote_pool_unit: quoteDetailResult?.metadata.pool_unit,
      base_pool_unit: baseDetailResult?.metadata.pool_unit,
      quote_address: yield* parseAssetFromResourceAddress(quote_address),
      base_address: yield* parseAssetFromResourceAddress(base_address),
      quote_pool,
      base_pool,
    });
  });
