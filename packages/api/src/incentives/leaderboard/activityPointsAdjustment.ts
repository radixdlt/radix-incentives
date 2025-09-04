import { activities } from 'db/incentives';
import { inArray } from 'drizzle-orm';
import { Effect } from 'effect';
import { ActivityWeekService } from '../activity-week/activityWeek';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';
import { ActivityDisplayService } from './activityDisplay';

/**
 * Service responsible for calculating activity point adjustments and breakdowns
 */
export class ActivityPointsAdjustmentService extends Effect.Service<ActivityPointsAdjustmentService>()(
  'ActivityPointsAdjustmentService',
  {
    dependencies: [
      dbClientLive,
      ActivityWeekService.Default,
      ActivityDisplayService.Default,
    ],
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      const activityWeekService = yield* ActivityWeekService;
      const activityDisplayService = yield* ActivityDisplayService;

      return {
        /**
         * Calculate activity breakdown with zero-multiplier adjustments
         */
        calculateActivityBreakdown: Effect.fn(function* (params: {
          userEntry: { activityBreakdown: unknown };
          activityIds: string[];
          weekId: string;
          userId: string;
        }) {
          const { userEntry, activityIds, weekId } = params;

          // Parse activity breakdown from cached JSONB, should be Record<string, number>
          const activityBreakdown =
            typeof userEntry.activityBreakdown === 'object' &&
            userEntry.activityBreakdown !== null
              ? (userEntry.activityBreakdown as Record<string, number>)
              : {};

          // Early return if no breakdown data
          if (Object.keys(activityBreakdown).length === 0) {
            return {
              activityBreakdownData: [],
              zeroMultiplierPointsToSubtract: 0,
            };
          }

          // Get activity week multipliers for this specific week
          const multiplierMap = yield* activityWeekService
            .getMultipliersMap(weekId)
            .pipe(
              Effect.catchAll((error) =>
                Effect.gen(function* () {
                  yield* Effect.logError(
                    'Failed to fetch activity week multipliers',
                    error,
                  );
                  return {} as Record<string, number>;
                }),
              ),
            );

          // Get activity names from database
          const breakdown = yield* Effect.tryPromise({
            try: () =>
              db
                .select({
                  activityId: activities.id,
                  activityName: activities.name,
                })
                .from(activities)
                .where(inArray(activities.id, activityIds)),
            catch: (error) => new DbError(error),
          });

          // Create activity name mapping using display service
          const activityNameMap: Record<string, string> = {};
          for (const activity of breakdown) {
            const displayName =
              yield* activityDisplayService.generateActivityDisplayName({
                activityId: activity.activityId,
                activityName: activity.activityName,
              });
            activityNameMap[activity.activityId] = displayName;
          }

          let zeroMultiplierPointsToSubtract = 0;

          // Calculate points to subtract from zero-multiplier activities and filter breakdown
          const activityBreakdownData = Object.entries(activityBreakdown)
            .filter(([activityId, points]) => {
              const multiplier = multiplierMap[activityId] ?? 0; // Default to 0 if not found

              if (multiplier === 0) {
                // Add these points to the amount we'll subtract from total
                zeroMultiplierPointsToSubtract += points;
                return false; // Don't show this activity in the breakdown
              }

              return points > 0; // Only show activities with points and non-zero multiplier
            })
            .map(([activityId, points]) => ({
              activityId,
              activityName: activityNameMap[activityId] || activityId,
              points: points.toFixed(6),
            }))
            .sort(
              (a, b) =>
                Number.parseFloat(b.points) - Number.parseFloat(a.points),
            );

          return { activityBreakdownData, zeroMultiplierPointsToSubtract };
        }),

        /**
         * Calculate adjusted total points by subtracting zero-multiplier points
         */
        calculateAdjustedTotalPoints: Effect.fn(function* (params: {
          originalTotal: string;
          zeroMultiplierPointsToSubtract: number;
        }) {
          const { originalTotal, zeroMultiplierPointsToSubtract } = params;
          const original = Number.parseFloat(originalTotal);
          const adjusted = original - zeroMultiplierPointsToSubtract;
          return adjusted.toFixed(6);
        }),
      };
    }),
  },
) {}
