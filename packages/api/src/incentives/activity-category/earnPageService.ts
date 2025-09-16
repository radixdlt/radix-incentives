import { dappsData } from 'data';
import { activityCategories, activityCategoryWeeks } from 'db/incentives';
import { and, eq } from 'drizzle-orm';
import { Effect } from 'effect';
import { z } from 'zod';
import { DbClientService, DbError } from '../db/dbClient';

export const EarnPageCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  multiplier: z.boolean(),
  seasonPointsPerWeek: z.number(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  dappLogos: z.array(
    z.object({
      name: z.string(),
      logoPath: z.string(),
      websiteUrl: z.string(),
    }),
  ),
});

export type EarnPageCategory = z.infer<typeof EarnPageCategorySchema>;

export class EarnPageService extends Effect.Service<EarnPageService>()(
  'EarnPageService',
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;

      return {
        getData: Effect.fn(function* (weekId: string) {
          // Single query to get all earn page data with joins
          const earnPageData = yield* Effect.tryPromise({
            try: () =>
              db
                .select({
                  id: activityCategories.id,
                  name: activityCategories.name,
                  description: activityCategories.description,
                  multiplier: activityCategories.multiplier,
                  icon: activityCategories.icon,
                  color: activityCategories.color,
                  dappIds: activityCategories.dappIds,
                  seasonPointsPerWeek: activityCategoryWeeks.pointsPool,
                })
                .from(activityCategories)
                .leftJoin(
                  activityCategoryWeeks,
                  and(
                    eq(
                      activityCategories.id,
                      activityCategoryWeeks.activityCategoryId,
                    ),
                    eq(activityCategoryWeeks.weekId, weekId),
                  ),
                )
                .where(eq(activityCategories.showOnEarnPage, true)),
            catch: (error) => new DbError(error),
          });

          // Create dapp lookup map from constants
          const dappMap = new Map(dappsData.map((dapp) => [dapp.id, dapp]));

          // Transform the data
          const result = earnPageData.map((category) => ({
            id: category.id,
            name: category.name,
            description: category.description,
            multiplier: category.multiplier,
            seasonPointsPerWeek: Number(category.seasonPointsPerWeek) || 0,
            icon: category.icon,
            color: category.color,
            dappLogos: (category.dappIds && Array.isArray(category.dappIds)
              ? category.dappIds
              : []
            )
              .map((dappId) => {
                const dapp = dappMap.get(dappId);
                return dapp
                  ? {
                      name: dapp.name,
                      logoPath: `/dapp-logos/${dappId}.png`,
                      websiteUrl: dapp.website,
                    }
                  : null;
              })
              .filter(Boolean) as EarnPageCategory['dappLogos'],
          }));

          // Sort categories: XRD Points Multiplier first, then alphabetically by name
          return result.sort((a, b) => {
            // XRD Points Multiplier should always be first
            if (a.id === 'maintainXrdBalance') return -1;
            if (b.id === 'maintainXrdBalance') return 1;

            // Sort remaining categories alphabetically by name
            return a.name.localeCompare(b.name);
          });
        }),
      };
    }),
  },
) {}

export const EarnPageServiceLive = EarnPageService.Default;
