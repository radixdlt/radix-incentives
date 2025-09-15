import { Effect } from 'effect';
import { z } from 'zod';
import { ActivityCategoryWeekService } from '../activity-category-week/activityCategoryWeek';
import { DappService } from '../dapp/dapp';
import { WeekService } from '../week/week';
import { ActivityCategoryService } from './activityCategory';

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
      const activityCategoryService = yield* ActivityCategoryService;
      const dappService = yield* DappService;
      const weekService = yield* WeekService;
      const activityCategoryWeekService = yield* ActivityCategoryWeekService;

      return {
        getData: Effect.fn(function* () {
          // Get current week
          const currentWeek = yield* weekService.getByDate(new Date());

          // Get activity categories for earn page
          const categories = yield* activityCategoryService.listForEarnPage();

          // Get all dapps
          const dapps = yield* dappService.list();

          // Get SP/week data for current week
          const categoryWeeks = yield* activityCategoryWeekService.getByWeekId({
            weekId: currentWeek.id,
          });

          // Create lookup maps
          const dappMap = new Map(dapps.map((dapp) => [dapp.id, dapp]));
          const categoryWeekMap = new Map(
            categoryWeeks.map((cw) => [cw.categoryId as string, cw.pointsPool]),
          );

          // Transform and combine the data
          const result = categories.map((category) => ({
            id: category.id,
            name: category.name,
            description: category.description,
            multiplier: category.multiplier,
            seasonPointsPerWeek: categoryWeekMap.get(category.id) || 0,
            icon: category.icon,
            color: category.color,
            dappLogos: (category.dappIds || [])
              .map((dappId) => {
                const dapp = dappMap.get(dappId as string);
                return dapp
                  ? {
                      name: dapp.name,
                      logoPath: `/dapp-logos/${dappId as string}.png`,
                      websiteUrl: dapp.website,
                    }
                  : null;
              })
              .filter(Boolean) as EarnPageCategory['dappLogos'],
          }));

          // Sort categories: XRD Points Multiplier first, then maintain original order
          return result.sort((a, b) => {
            // XRD Points Multiplier should always be first
            if (a.id === 'maintainXrdBalance') return -1;
            if (b.id === 'maintainXrdBalance') return 1;

            return 0;
          });
        }),
      };
    }),
  },
) {}

export const EarnPageServiceLive = EarnPageService.Default;
