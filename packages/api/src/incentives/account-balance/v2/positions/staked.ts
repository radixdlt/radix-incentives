import type { ProgrammaticScryptoSborValue } from '@radixdlt/babylon-gateway-api-sdk';
import BigNumber from 'bignumber.js';
import { Assets } from 'data';
import { Data, Effect, HashMap, Option } from 'effect';
import { flatten, reduce } from 'effect/Array';
import s from 'sbor-ez-mode';
import { GetEntityDetailsService } from '../../../../common/gateway';
import { GetUsdValueService } from '../../../token-price/getUsdValue';
import { AccountBalanceState } from '../accountBalanceState';
import {
  type AccountAddress,
  type Amount,
  AmountUsd,
  FungibleResourceAddress,
} from '../schemas';
import { PositionKey } from './types';

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

const parseClaimNft = (sbor: ProgrammaticScryptoSborValue) =>
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
    dependencies: [GetEntityDetailsService.Default, GetUsdValueService.Default],
    effect: Effect.gen(function* () {
      const getEntityDetails = yield* GetEntityDetailsService;
      const getUsdValue = yield* GetUsdValueService;

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

      return {
        fromState: Effect.fn(function* (input: {
          addresses: AccountAddress[];
          stateVersion: number;
          timestamp: Date;
        }) {
          const validatorsState = yield* AccountBalanceState.validatorsState;
          const getFungibleTokenBalance =
            yield* AccountBalanceState.createGetFungibleTokenBalanceFn;

          const getNftCollection =
            yield* AccountBalanceState.createGetNftCollectionFn;

          const claimNftResourceAddressSet = new Set(
            validatorsState.map(
              (validator) => validator.claimNftResourceAddress,
            ),
          );

          const lsuResourceAddresses = validatorsState.map((validator) =>
            FungibleResourceAddress(validator.lsuResourceAddress),
          );

          const lsuToUsdConverterMap = yield* createLsuToUsdConverter({
            addresses: lsuResourceAddresses,
            stateVersion: input.stateVersion,
            timestamp: input.timestamp,
          });

          const getLsuValue = (address: AccountAddress) =>
            Effect.forEach(lsuResourceAddresses, (resourceAddress) =>
              Effect.gen(function* () {
                const amount = yield* getFungibleTokenBalance(
                  address,
                  resourceAddress,
                );

                return yield* lsuToUsdConverterMap.pipe(
                  HashMap.get(resourceAddress),
                  Effect.flatMap((converter) => converter(amount)),
                );
              }),
            ).pipe(
              Effect.map(
                reduce(new BigNumber(0), (acc, item) => acc.plus(item)),
              ),
              Effect.map((usdValue) => AmountUsd(usdValue.toString())),
            );

          const getUnstakedValue = (address: AccountAddress) =>
            Effect.forEach(claimNftResourceAddressSet, (resourceAddress) =>
              Effect.gen(function* () {
                return yield* getNftCollection(address, resourceAddress).pipe(
                  Option.match({
                    onNone: () => Effect.succeed([] as string[]),
                    onSome: Effect.forEach((item) =>
                      Effect.gen(function* () {
                        if (!item.sbor) return '0';
                        const claimAmount = yield* parseClaimNft(item.sbor);
                        return claimAmount;
                      }),
                    ),
                  }),
                );
              }),
            ).pipe(
              Effect.map(flatten),
              Effect.map(
                reduce(new BigNumber(0), (acc, item) => acc.plus(item)),
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
            {} as Record<
              AccountAddress,
              {
                [PositionKey.lsu]: AmountUsd;
                [PositionKey.unstaked]: AmountUsd;
              }
            >,
            (acc, address) =>
              Effect.gen(function* () {
                return {
                  ...acc,
                  [address]: {
                    [PositionKey.lsu]: yield* getLsuValue(address),
                    [PositionKey.unstaked]: yield* getUnstakedValue(address),
                  },
                };
              }),
          );
        }),
      };
    }),
  },
) {}
