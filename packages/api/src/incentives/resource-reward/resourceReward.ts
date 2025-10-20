import { resourceRewardClaims, resourceRewardDefinitions } from 'db/incentives';
import { and, count, eq, sql, sum } from 'drizzle-orm';
import { Data, Effect, Schema } from 'effect';
import {
  GetEntityDetailsService,
  GetFungibleBalanceService,
  GetNonFungibleBalanceService,
} from '../../common/gateway';
import { transformMetadata } from '../../common/helpers/transformMetadata';
import {
  MetadataSchema,
  RadixDataTypeSchema,
} from '../component-definition/schemas';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';
import { SeasonService } from '../season/season';
import { UserService } from '../user/user';
import { WeekService } from '../week/week';

class MetadataNotFoundError extends Data.TaggedError('MetadataNotFoundError')<{
  message: string;
}> {}

class UserDoesNotHoldResourceError extends Data.TaggedError(
  'UserDoesNotHoldResourceError',
)<{
  message: string;
}> {}

import { ResourceRewardHelpers } from './resourceRewardHelpers';

export class ResourceRewardDefinition extends Schema.Class<ResourceRewardDefinition>(
  'ResourceRewardDefinition',
)({
  address: RadixDataTypeSchema.ResourceAddress,
  points: Schema.Number,
  weeklyLimit: Schema.NullishOr(Schema.Number),
  url: Schema.NullishOr(Schema.String),
}) {}

class ResourceRewardClaim extends Schema.Class<ResourceRewardClaim>(
  'ResourceRewardClaim',
)({
  resourceManager: RadixDataTypeSchema.ResourceAddress,
  localId: Schema.String,
  userId: Schema.UUID,
  weekId: Schema.UUID,
  seasonId: Schema.UUID,
  claimedAt: Schema.Date,
}) {}

const CreateResourceClaimInput = ResourceRewardClaim.pipe(
  Schema.omit('claimedAt', 'localId'),
);

type CreateResourceClaimInput = Schema.Schema.Type<
  typeof CreateResourceClaimInput
>;

class ResourceNotFoundError extends Data.TaggedError('ResourceNotFoundError')<{
  message: string;
}> {}

class InvalidResourceTypeError extends Data.TaggedError(
  'InvalidResourceTypeError',
)<{
  message: string;
}> {}

class SeasonNotActiveError extends Data.TaggedError('SeasonNotActiveError')<{
  message: string;
}> {}

export class ResourceRewardService extends Effect.Service<ResourceRewardService>()(
  'ResourceRewardService',
  {
    dependencies: [
      dbClientLive,
      UserService.Default,
      GetEntityDetailsService.Default,
      GetNonFungibleBalanceService.Default,
      GetFungibleBalanceService.Default,
      SeasonService.Default,
      WeekService.Default,
      ResourceRewardHelpers.Default,
    ],
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      const userService = yield* UserService;
      const getEntityDetailsService = yield* GetEntityDetailsService;
      const seasonService = yield* SeasonService;
      const weekService = yield* WeekService;
      const resourceRewardHelpers = yield* ResourceRewardHelpers;

      const decodeMetadata = (input: unknown) =>
        Schema.Struct({
          name: MetadataSchema.String,
          icon_url: MetadataSchema.Url,
        }).pipe(Schema.decodeUnknown)(input);

      const getEntityDetails = Effect.fnUntraced(function* (address: string) {
        return yield* getEntityDetailsService(
          [address],
          {},
          {
            // use 1 minute ago to gateway 400 error
            timestamp: new Date(Date.now() - 60 * 1000),
          },
        ).pipe(Effect.map((res) => res[0]));
      });

      const getResourceRewardDefinitionsFromDb = Effect.fnUntraced(
        function* (input?: { address: string }) {
          const items = yield* Effect.tryPromise({
            try: () =>
              db
                .select()
                .from(resourceRewardDefinitions)
                .where(
                  input
                    ? eq(resourceRewardDefinitions.address, input.address)
                    : undefined,
                ),
            catch: (error) => new DbError(error),
          });

          return yield* Effect.forEach(items, (item) =>
            Effect.gen(function* () {
              const decoded = yield* Schema.decodeUnknown(
                ResourceRewardDefinition,
              )(item);
              return decoded;
            }),
          );
        },
      );

      const addResourceRewardDefinitionToDb = Effect.fnUntraced(function* (
        input: ResourceRewardDefinition,
      ) {
        const encodedResourceReward = yield* Schema.encodeUnknown(
          ResourceRewardDefinition,
        )(input);

        return yield* Effect.tryPromise({
          try: () =>
            db.insert(resourceRewardDefinitions).values(encodedResourceReward),
          catch: (error) => new DbError(error),
        });
      });

      const getResourceRewardClaimsByUserId = Effect.fnUntraced(
        function* (input: { userId: string; weekId?: string }) {
          const andCondition = and(
            eq(resourceRewardClaims.userId, input.userId),
            input.weekId
              ? eq(resourceRewardClaims.weekId, input.weekId)
              : undefined,
          );
          return yield* Effect.tryPromise({
            try: () =>
              db.select().from(resourceRewardClaims).where(andCondition),
            catch: (error) => new DbError(error),
          });
        },
      );

      return {
        createResourceRewardDefinition: Effect.fnUntraced(function* (
          input: ResourceRewardDefinition,
        ) {
          const newResourceReward = yield* Schema.decodeUnknown(
            ResourceRewardDefinition,
          )(input);

          const entityDetails = yield* getEntityDetails(
            newResourceReward.address,
          );

          if (entityDetails?.details?.type !== 'NonFungibleResource') {
            return yield* Effect.fail(
              new InvalidResourceTypeError({
                message: `Resource with address ${newResourceReward.address} is not a non-fungible resource`,
              }),
            );
          }

          const metadata = transformMetadata(entityDetails?.metadata);

          yield* decodeMetadata(metadata);

          return yield* addResourceRewardDefinitionToDb(newResourceReward);
        }),
        createResourceRewardClaim: Effect.fnUntraced(function* (
          input: CreateResourceClaimInput,
        ) {
          const timestamp = new Date(Date.now() - 60 * 1000);
          const newResourceClaim = yield* Schema.decodeUnknown(
            CreateResourceClaimInput,
          )(input);

          const [accountAddresses, season, week, resourceRewardDefinition] =
            yield* Effect.all([
              userService.userHasRegisteredAccounts({
                userId: newResourceClaim.userId,
              }),
              seasonService.getByWeekId(newResourceClaim.weekId),
              weekService.getByDate(timestamp),
              getResourceRewardDefinitionsFromDb({
                address: newResourceClaim.resourceManager,
              }).pipe(Effect.map((res) => res[0])),
            ]);

          if (season.status !== 'active') {
            return yield* Effect.fail(
              new SeasonNotActiveError({
                message: `Season is not active`,
              }),
            );
          }

          if (!resourceRewardDefinition) {
            return yield* Effect.fail(
              new ResourceNotFoundError({
                message: `Resource with address ${newResourceClaim.resourceManager} not found`,
              }),
            );
          }

          const nfIds = yield* resourceRewardHelpers
            .getNfHoldingByResourceManagers({
              accountAddresses,
              resourceManagers: [newResourceClaim.resourceManager],
              timestamp,
            })
            .pipe(Effect.map((res) => res[0]?.nfIds ?? []));

          if (nfIds.length === 0) {
            return yield* Effect.fail(
              new UserDoesNotHoldResourceError({
                message: `User does not hold resource with address ${newResourceClaim.resourceManager}`,
              }),
            );
          }

          const existingResourceRewardClaim =
            yield* resourceRewardHelpers.getResourceRewardClaims({
              resourceManager: newResourceClaim.resourceManager,
              localIds: nfIds,
              weekId: week.id,
            });

          const newResourceRewardClaims = nfIds
            .filter(
              (nfId) =>
                !existingResourceRewardClaim.some(
                  (claim) => claim.localId === nfId,
                ),
            )
            .map((nfId) => ({
              userId: newResourceClaim.userId,
              weekId: week.id,
              seasonId: season.id,
              resourceManager: newResourceClaim.resourceManager,
              localId: nfId,
            }));

          const itemsToInsert = [
            ...existingResourceRewardClaim.map((item) => ({
              ...item,
              userId: newResourceClaim.userId,
              claimedAt: new Date(),
            })),
            ...newResourceRewardClaims,
          ];

          yield* Effect.tryPromise({
            try: () =>
              db
                .insert(resourceRewardClaims)
                .values(itemsToInsert)
                .onConflictDoUpdate({
                  target: [resourceRewardClaims.id],
                  set: {
                    userId: sql`excluded.user_id`,
                    claimedAt: sql`excluded.claimed_at`,
                  },
                }),
            catch: (error) => new DbError(error),
          });
        }),
        listResourceRewardDefinitions: Effect.fnUntraced(function* () {
          const result = yield* getResourceRewardDefinitionsFromDb();

          const entityDetailsMap = yield* Effect.all(
            result.map((resource) => getEntityDetails(resource.address)),
          ).pipe(
            Effect.flatMap((entityDetails) =>
              Effect.forEach(entityDetails, (entityDetail) => {
                return Effect.gen(function* () {
                  if (!entityDetail) {
                    return yield* Effect.fail(
                      new MetadataNotFoundError({
                        message: `Metadata not found for resource`,
                      }),
                    );
                  }
                  const metadata = transformMetadata(entityDetail?.metadata);

                  const decodedMetadata = yield* Schema.Struct({
                    name: MetadataSchema.String,
                    icon_url: MetadataSchema.Url,
                  }).pipe(Schema.decodeUnknown)(metadata);

                  return {
                    address: entityDetail.address,
                    name: decodedMetadata.name,
                    iconUrl: decodedMetadata.icon_url,
                  };
                });
              }),
            ),
            Effect.map((res) =>
              res.reduce<
                Record<
                  string,
                  { address: string; name: string; iconUrl: string }
                >
              >((acc, curr) => {
                acc[curr.address] = curr;
                return acc;
              }, {}),
            ),
          );

          return result.map((resource) => ({
            ...resource,
            ...entityDetailsMap[resource.address],
          }));
        }),
        getAggregatedResourceRewardClaimsByWeekId: Effect.fnUntraced(
          function* (input: { weekId: string }) {
            return yield* Effect.tryPromise({
              try: () => {
                // aggregate points by user id and resource address, apply weekly limit if set
                const subquery = db
                  .select({
                    points: sql<string>`CASE 
                      WHEN ${resourceRewardDefinitions.weeklyLimit} IS NOT NULL 
                        AND ${count()} > ${resourceRewardDefinitions.weeklyLimit}
                      THEN ${resourceRewardDefinitions.weeklyLimit} * ${resourceRewardDefinitions.points}
                      ELSE ${count()} * ${resourceRewardDefinitions.points}
                    END`.as('points'),
                    userId: resourceRewardClaims.userId,
                  })
                  .from(resourceRewardClaims)
                  .innerJoin(
                    resourceRewardDefinitions,
                    eq(
                      resourceRewardClaims.resourceManager,
                      resourceRewardDefinitions.address,
                    ),
                  )
                  .where(eq(resourceRewardClaims.weekId, input.weekId))
                  .groupBy(
                    resourceRewardClaims.userId,
                    resourceRewardDefinitions.address,
                    resourceRewardDefinitions.points,
                    resourceRewardDefinitions.weeklyLimit,
                  )
                  .as('subquery');

                // aggregate points by user id
                return db
                  .select({
                    userId: subquery.userId,
                    points: sum(subquery.points),
                  })
                  .from(subquery)
                  .groupBy(subquery.userId);
              },
              catch: (error) => new DbError(error),
            });
          },
        ),
        getResourceRewardClaimsByUserId: Effect.fnUntraced(function* ({
          userId,
          weekId,
        }: {
          userId: string;
          weekId: string;
        }) {
          const [claims, accountAddresses, resourceManagers, week] =
            yield* Effect.all(
              [
                getResourceRewardClaimsByUserId({
                  userId,
                  weekId,
                }),
                userService
                  .getAccountsByUserId({
                    userId,
                  })
                  .pipe(Effect.map((res) => res.map((item) => item.address))),
                getResourceRewardDefinitionsFromDb().pipe(
                  Effect.map((res) => res.map((item) => item.address)),
                ),
                weekService.getById(weekId),
              ],
              { concurrency: 'unbounded' },
            );

          const currentDate = new Date(Date.now() - 60 * 1000);

          const nfHoldings =
            yield* resourceRewardHelpers.getNfHoldingByResourceManagers({
              resourceManagers,
              accountAddresses,
              timestamp:
                currentDate > week.endDate ? week.endDate : currentDate,
            });

          return {
            claims: claims.map((item) => ({
              resourceManager: item.resourceManager,
              localId: item.localId,
              claimedAt: item.claimedAt,
            })),
            nfHoldings,
          };
        }),
        updateResourceRewardDefinition: Effect.fnUntraced(function* (
          input: ResourceRewardDefinition,
        ) {
          const resourceReward = yield* Schema.decodeUnknown(
            ResourceRewardDefinition,
          )(input);

          const existing = yield* getResourceRewardDefinitionsFromDb({
            address: resourceReward.address,
          }).pipe(Effect.map((res) => res[0]));

          if (!existing) {
            return yield* Effect.fail(
              new ResourceNotFoundError({
                message: `Resource with address ${resourceReward.address} not found`,
              }),
            );
          }

          const encodedResourceReward = yield* Schema.encodeUnknown(
            ResourceRewardDefinition,
          )(resourceReward);

          return yield* Effect.tryPromise({
            try: () =>
              db
                .update(resourceRewardDefinitions)
                .set(encodedResourceReward)
                .where(
                  eq(resourceRewardDefinitions.address, resourceReward.address),
                ),
            catch: (error) => new DbError(error),
          });
        }),
        deleteResourceRewardDefinition: Effect.fnUntraced(function* (input: {
          address: string;
        }) {
          const existing = yield* getResourceRewardDefinitionsFromDb({
            address: input.address,
          }).pipe(Effect.map((res) => res[0]));

          if (!existing) {
            return yield* Effect.fail(
              new ResourceNotFoundError({
                message: `Resource with address ${input.address} not found`,
              }),
            );
          }

          return yield* Effect.tryPromise({
            try: () =>
              db
                .delete(resourceRewardDefinitions)
                .where(eq(resourceRewardDefinitions.address, input.address)),
            catch: (error) => new DbError(error),
          });
        }),
      };
    }),
  },
) {}
