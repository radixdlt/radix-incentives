import type { ProgrammaticScryptoSborValue } from '@radixdlt/babylon-gateway-api-sdk';
import BigNumber from 'bignumber.js';
import { ActivityId, Assets } from 'data';
import {
  Array as A,
  Data,
  Effect,
  HashMap,
  Option,
  pipe,
  Record as R,
} from 'effect';
import { reduce } from 'effect/Array';
import s from 'sbor-ez-mode';
import { GetEntityDetailsService } from '../../../../common/gateway';
import { GetUsdValueService } from '../../../token-price/getUsdValue';
import { AccountBalanceState } from '../accountBalanceState';
import { NftHelper } from '../helpers/parseSbor';
import {
  type AccountAddress,
  Amount,
  AmountUsd,
  FungibleResourceAddress,
  type NonFungibleId,
  type NonFungibleResourceAddress,
} from '../schemas';
import { WeftFinanceHelper } from './weftHelper';

class InvalidResourceError extends Data.TaggedError('InvalidResourceError')<{
  message: string;
}> {}

class InvalidNativeResourceKindError extends Data.TaggedError(
  'InvalidNativeResourceKindError',
)<{
  message: string;
}> {}

class InvalidClaimNftError extends Data.TaggedError('InvalidClaimNftError')<{
  message: string;
}> {}

export const claimNftSchema = s.struct({
  claim_amount: s.decimal(),
});

export const parseClaimNft = (sbor: ProgrammaticScryptoSborValue) =>
  Effect.gen(function* () {
    const result = claimNftSchema.safeParse(sbor);
    if (result.isErr()) {
      return yield* new InvalidClaimNftError({
        message: result.error.message,
      });
    }
    return result.value.claim_amount;
  });

export class StakedPosition extends Effect.Service<StakedPosition>()(
  'StakedPosition',
  {
    dependencies: [
      GetEntityDetailsService.Default,
      GetUsdValueService.Default,
      NftHelper.Default,
    ],
    effect: Effect.gen(function* () {
      const getEntityDetails = yield* GetEntityDetailsService;
      const getUsdValue = yield* GetUsdValueService;
      const nftHelper = yield* NftHelper;

      const createLsuToUsdConverter = (input: {
        addresses: FungibleResourceAddress[];
        stateVersion: number;
        timestamp: Date;
      }) =>
        getEntityDetails(
          input.addresses,
          { nativeResourceDetails: true },
          { state_version: input.stateVersion },
        ).pipe(
          Effect.flatMap(
            Effect.forEach((entityDetails) =>
              Effect.gen(function* () {
                if (entityDetails.details?.type !== 'FungibleResource') {
                  return yield* new InvalidResourceError({
                    message: `Expected a fungible resource, got ${entityDetails.details?.type}`,
                  });
                }
                if (
                  entityDetails.details.native_resource_details?.kind !==
                  'ValidatorLiquidStakeUnit'
                ) {
                  return yield* new InvalidNativeResourceKindError({
                    message: `Expected a validator liquid stake unit, got ${entityDetails.details.native_resource_details?.kind}`,
                  });
                }

                const [value] =
                  entityDetails.details.native_resource_details
                    .unit_redemption_value;

                const unit_redemption_value = value?.amount ?? '0';

                const unitRedemptionValue = new BigNumber(
                  unit_redemption_value,
                );

                const converter = (amount: Amount) =>
                  Effect.gen(function* () {
                    const xrdAmount = unitRedemptionValue.multipliedBy(amount);

                    const usdValue = yield* getUsdValue({
                      amount: xrdAmount,
                      resourceAddress: Assets.Fungible.XRD,
                      timestamp: input.timestamp,
                    });

                    return AmountUsd(usdValue.decimalPlaces(2).toString());
                  });

                return [
                  FungibleResourceAddress(entityDetails.address),
                  converter,
                ] satisfies [FungibleResourceAddress, typeof converter];
              }),
            ),
          ),
          Effect.map(HashMap.fromIterable),
        );

      const getAndParseUnstakingClaimNftData = (input: {
        resourceAddress: NonFungibleResourceAddress;
        nonFungibleIds: NonFungibleId[];
        stateVersion: number;
      }) =>
        nftHelper
          .getNftData({
            resourceAddress: input.resourceAddress,
            nonFungibleIds: input.nonFungibleIds,
            stateVersion: input.stateVersion,
            schema: claimNftSchema,
          })
          .pipe(
            Effect.map(
              reduce(new BigNumber(0), (acc, item) =>
                acc.plus(item.claim_amount),
              ),
            ),
          );

      // Reduce Weft V2 NFT collaterals to a total amount in USD
      const getUnstakingFromWeftV2NftCollaterals = (input: {
        nftCollaterals: Record<NonFungibleResourceAddress, NonFungibleId[]>;
        stateVersion: number;
        timestamp: Date;
      }) =>
        Effect.forEach(
          A.fromRecord(input.nftCollaterals),
          ([resourceAddress, nonFungibleIds]) =>
            getAndParseUnstakingClaimNftData({
              resourceAddress,
              nonFungibleIds,
              stateVersion: input.stateVersion,
            }),
        ).pipe(
          Effect.map(reduce(new BigNumber(0), (acc, item) => acc.plus(item))),
          Effect.flatMap((amount) =>
            getUsdValue({
              amount,
              resourceAddress: Assets.Fungible.XRD,
              timestamp: input.timestamp,
            }),
          ),
          Effect.map((usdValue) =>
            AmountUsd(usdValue.decimalPlaces(2).toString()),
          ),
        );

      return {
        fromState: (input: {
          addresses: AccountAddress[];
          stateVersion: number;
          timestamp: Date;
        }) =>
          Effect.gen(function* () {
            const weftFinanceHelper = yield* WeftFinanceHelper;
            const validatorsState = yield* AccountBalanceState.validatorsState;
            const claimNftResourceAddressSet = new Set(
              validatorsState.map(
                (validator) => validator.claimNftResourceAddress,
              ),
            );

            const lsuResourceAddresses = validatorsState.map((validator) =>
              FungibleResourceAddress(validator.lsuResourceAddress),
            );

            const getFungibleTokenBalance =
              yield* AccountBalanceState.createGetFungibleTokenBalanceFn;

            const getNftCollection =
              yield* AccountBalanceState.createGetNftCollectionFn;

            const lsuToUsdConverterMap = yield* createLsuToUsdConverter({
              addresses: lsuResourceAddresses,
              stateVersion: input.stateVersion,
              timestamp: input.timestamp,
            });

            const getLsuFromAccount = (address: AccountAddress) =>
              Effect.forEach(lsuResourceAddresses, (resourceAddress) =>
                getFungibleTokenBalance(address, resourceAddress).pipe(
                  Option.match({
                    onNone: () => Effect.succeed(AmountUsd('0')),
                    onSome: (amount) =>
                      lsuToUsdConverterMap.pipe(
                        HashMap.get(resourceAddress),
                        Effect.flatMap((converter) => converter(amount)),
                      ),
                  }),
                ),
              ).pipe(
                Effect.map(
                  reduce(new BigNumber(0), (acc, item) => acc.plus(item)),
                ),
                Effect.map((usdValue) => AmountUsd(usdValue.toString())),
              );

            const getLsuFromWeftV2Collaterals = (input: {
              fungibleCollaterals: Record<FungibleResourceAddress, Amount>;
            }) =>
              Effect.forEach(lsuResourceAddresses, (resourceAddress) =>
                R.get(input.fungibleCollaterals, resourceAddress).pipe(
                  Option.match({
                    onNone: () => Effect.succeed(AmountUsd('0')),
                    onSome: (amount) =>
                      lsuToUsdConverterMap.pipe(
                        HashMap.get(resourceAddress),
                        Effect.flatMap((converter) => converter(amount)),
                      ),
                  }),
                ),
              ).pipe(
                Effect.map((items) =>
                  pipe(
                    reduce(items, new BigNumber(0), (acc, item) =>
                      acc.plus(item),
                    ),
                    (usdValue) => AmountUsd(usdValue.toString()),
                  ),
                ),
              );

            // Users can use unstaking claims as collateral in Weft V2
            const getWeftV2Collaterals = (accountAddress: AccountAddress) =>
              weftFinanceHelper.getWeftV2CollateralsFromState(accountAddress);

            const getUnstakingClaimsFromAccount = (
              address: AccountAddress,
              resourceAddress: NonFungibleResourceAddress,
            ) =>
              getNftCollection(address, resourceAddress, claimNftSchema).pipe(
                Effect.map((item) =>
                  pipe(
                    A.reduce(item, new BigNumber(0), (acc, item) =>
                      acc.plus(item.claim_amount),
                    ),
                    (amount) => Amount(amount.toString()),
                  ),
                ),
              );

            const getUnstakingFromAccount = (address: AccountAddress) =>
              Effect.forEach(claimNftResourceAddressSet, (resourceAddress) =>
                getUnstakingClaimsFromAccount(address, resourceAddress),
              ).pipe(
                Effect.map(
                  A.reduce(new BigNumber(0), (acc, item) => acc.plus(item)),
                ),
                Effect.flatMap((amount) =>
                  getUsdValue({
                    amount,
                    resourceAddress: Assets.Fungible.XRD,
                    timestamp: input.timestamp,
                  }),
                ),
                Effect.map((usdValue) =>
                  AmountUsd(usdValue.decimalPlaces(2).toString()),
                ),
              );

            return yield* Effect.reduce(
              input.addresses,
              R.empty<AccountAddress, Record<string, AmountUsd>>(),
              (acc, accountAddress) =>
                Effect.gen(function* () {
                  const lsu = yield* getLsuFromAccount(accountAddress);

                  const unstaking =
                    yield* getUnstakingFromAccount(accountAddress);

                  const weftV2Collaterals =
                    yield* getWeftV2Collaterals(accountAddress);

                  const unstakingFromWeft =
                    yield* getUnstakingFromWeftV2NftCollaterals({
                      nftCollaterals: weftV2Collaterals.nftCollaterals,
                      stateVersion: input.stateVersion,
                      timestamp: input.timestamp,
                    });

                  const lsuFromWeftV2Collateral =
                    yield* getLsuFromWeftV2Collaterals({
                      fungibleCollaterals:
                        weftV2Collaterals.fungibleCollaterals,
                    });

                  return R.set(acc, accountAddress, {
                    [ActivityId.ho_stakedXrd]: lsu,
                    [ActivityId.ho_unstakedXrd]: unstaking,
                    [ActivityId.we_ho_unstakedXrd]: unstakingFromWeft,
                    [ActivityId.we_ho_stakedXrd]: lsuFromWeftV2Collateral,
                  });
                }),
            );
          }).pipe(Effect.provide(WeftFinanceHelper.Default)),
      };
    }),
  },
) {}
