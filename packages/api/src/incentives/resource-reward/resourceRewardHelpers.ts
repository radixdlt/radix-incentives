import { resourceRewardClaims } from 'db/incentives';
import { and, eq, inArray } from 'drizzle-orm';
import { Effect } from 'effect';
import {
  GetLedgerStateService,
  GetNonFungibleBalanceService,
} from '../../common/gateway';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';

export class ResourceRewardHelpers extends Effect.Service<ResourceRewardHelpers>()(
  'ResourceRewardHelpers',
  {
    dependencies: [
      GetNonFungibleBalanceService.Default,
      GetLedgerStateService.Default,
      dbClientLive,
    ],
    effect: Effect.gen(function* () {
      const getNonFungibleBalanceService = yield* GetNonFungibleBalanceService;
      const getLedgerStateService = yield* GetLedgerStateService;
      const db = yield* DbClientService;

      const getResourceRewardClaims = (input: {
        resourceManager: string;
        localIds: string[];
        weekId: string;
      }) =>
        Effect.gen(function* () {
          return yield* Effect.tryPromise({
            try: () =>
              db
                .select()
                .from(resourceRewardClaims)
                .where(
                  and(
                    inArray(resourceRewardClaims.localId, input.localIds),
                    eq(
                      resourceRewardClaims.resourceManager,
                      input.resourceManager,
                    ),
                    eq(resourceRewardClaims.weekId, input.weekId),
                  ),
                ),
            catch: (error) => new DbError(error),
          });
        });

      const getNfHoldingByResourceManagers = (input: {
        resourceManagers: string[];
        accountAddresses: string[];
        timestamp: Date;
      }) =>
        Effect.gen(function* () {
          // Convert timestamp to state_version upfront for pagination support
          const ledgerState = yield* getLedgerStateService({
            at_ledger_state: {
              timestamp: input.timestamp,
            },
          });

          const result = yield* getNonFungibleBalanceService({
            addresses: input.accountAddresses,
            at_ledger_state: {
              state_version: ledgerState.state_version,
            },
            resourceAddresses: input.resourceManagers,
          });

          const output = result.items
            .flatMap((item) =>
              item.nonFungibleResources.flatMap((resource) => ({
                resourceManager: resource.resourceAddress,
                nfIds: resource.items
                  .filter((item) => !item.isBurned)
                  .map((item) => item.id),
              })),
            )
            .filter((item) => item.nfIds.length > 0)
            .reduce<
              Record<string, { resourceManager: string; nfIds: string[] }>
            >((acc, curr) => {
              const item = acc[curr.resourceManager] ?? {
                resourceManager: curr.resourceManager,
                nfIds: [],
              };

              acc[curr.resourceManager] = {
                ...item,
                nfIds: [...item.nfIds, ...curr.nfIds],
              };
              return acc;
            }, {});

          return Object.values(output);
        });

      return {
        getResourceRewardClaims,
        getNfHoldingByResourceManagers,
      };
    }),
  },
) {}
