import BigNumber from 'bignumber.js';
import {
  Array as A,
  Cache,
  Config,
  Duration,
  Effect,
  flow,
  Option,
  Record as R,
} from 'effect';
import { GetResourcePoolUnitsService } from '../../../../common/resource-pool/getResourcePoolUnits';
import {
  Amount,
  type FungibleResourceAddress,
  type PoolAddress,
  type StateVersion,
} from '../schemas';

export class PoolUnitHelper extends Effect.Service<PoolUnitHelper>()(
  'PoolUnitHelper',
  {
    dependencies: [GetResourcePoolUnitsService.Default],
    effect: Effect.gen(function* () {
      const POOL_UNIT_CACHE_CAPACITY = yield* Config.number(
        'POOL_UNIT_CACHE_CAPACITY',
      ).pipe(Config.withDefault(100));

      const POOL_UNIT_CACHE_TIME_TO_LIVE = yield* Config.duration(
        'POOL_UNIT_CACHE_TIME_TO_LIVE',
      ).pipe(Config.withDefault(Duration.minutes(15)));

      const getResourcePoolUnitsService = yield* GetResourcePoolUnitsService;

      const cache = yield* Cache.make({
        capacity: POOL_UNIT_CACHE_CAPACITY,
        timeToLive: POOL_UNIT_CACHE_TIME_TO_LIVE,
        lookup: (key: `${PoolAddress}:${StateVersion}`) =>
          Effect.gen(function* () {
            const [poolAddress, stateVersion] = key.split(':');

            const result = yield* getResourcePoolUnitsService({
              addresses: [poolAddress],
              at_ledger_state: { state_version: Number(stateVersion) },
            }).pipe(Effect.map(flow(A.head)));

            if (Option.isNone(result))
              return R.empty<FungibleResourceAddress, Amount>();

            return A.reduce(
              result.value.poolResources,
              R.empty<FungibleResourceAddress, Amount>(),
              (acc, resource) =>
                R.set(
                  acc,
                  resource.resourceAddress,
                  Amount(resource.poolUnitValue.toString()),
                ),
            );
          }),
      });

      const convertToAmount = (
        resources: Record<FungibleResourceAddress, Amount>,
        token: FungibleResourceAddress,
        lpToken: Amount,
      ) =>
        R.get(resources, token).pipe(
          Option.map((poolUnitValue) =>
            Amount(
              new BigNumber(poolUnitValue).multipliedBy(lpToken).toString(),
            ),
          ),
          Option.getOrElse(() => Amount('0')),
        );

      return {
        resolve: Effect.fn(function* (input: {
          poolAddress: PoolAddress;
          stateVersion: StateVersion;
          xToken: FungibleResourceAddress;
          yToken: FungibleResourceAddress;
          lpToken: Amount;
        }) {
          const poolUnitMap = yield* cache.get(
            `${input.poolAddress}:${input.stateVersion}`,
          );

          return {
            xTokenAmount: convertToAmount(
              poolUnitMap,
              input.xToken,
              input.lpToken,
            ),
            yTokenAmount: convertToAmount(
              poolUnitMap,
              input.yToken,
              input.lpToken,
            ),
          };
        }),
      };
    }),
  },
) {}
