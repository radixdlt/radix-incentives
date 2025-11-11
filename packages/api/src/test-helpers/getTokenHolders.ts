import type {
  ResourceHoldersCollectionFungibleResourceItem,
  ResourceHoldersCollectionNonFungibleResourceItem,
} from '@radixdlt/babylon-gateway-api-sdk';
import { Effect } from 'effect';
import { GetResourceHoldersService } from '../common/gateway';
import { AccountAddress } from '../incentives/account-balance/v2/schemas';

export const getTokenHolders = (resourceAddress: string) =>
  Effect.gen(function* () {
    const getResourceHoldersService = yield* GetResourceHoldersService;
    return yield* getResourceHoldersService({
      resourceAddress,
    });
  }).pipe(Effect.provide(GetResourceHoldersService.Default));

export const getFungibleTokenHolders = (resourceAddress: string) =>
  getTokenHolders(resourceAddress).pipe(
    Effect.map((items) =>
      items
        .filter(
          (item): item is ResourceHoldersCollectionFungibleResourceItem =>
            item.holder_address.startsWith('account_') &&
            item.type === 'FungibleResource',
        )
        .slice(0, 10)
        .map((item) => ({
          address: AccountAddress(item.holder_address),
          amount: item.amount,
        })),
    ),
  );

export const getNonFungibleTokenHolders = (resourceAddress: string) =>
  getTokenHolders(resourceAddress).pipe(
    Effect.map((items) =>
      items
        .filter(
          (item): item is ResourceHoldersCollectionNonFungibleResourceItem =>
            item.holder_address.startsWith('account_') &&
            item.type === 'NonFungibleResource',
        )
        .slice(0, 10)
        .map((item) => AccountAddress(item.holder_address)),
    ),
  );
