import { milestones } from 'db/incentives';
import { and, eq } from 'drizzle-orm';
import { Effect } from 'effect';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';
import { DexVolumeService } from './dexVolumeService';
import { TransactionCountService } from './transactionCountService';
import { TvlService } from './tvlService';

type MilestoneRecord = typeof milestones.$inferSelect;

interface FormattedMilestone {
  target: number;
  reward: number;
  achieved: boolean;
}

interface MilestoneCategory {
  current: number;
  milestones: FormattedMilestone[];
}

export interface GroupedMilestones {
  tvl: MilestoneCategory;
  transactions: MilestoneCategory;
  dex_volume: MilestoneCategory;
  wallet_downloads: MilestoneCategory;
}

export type MilestoneType =
  | 'tvl'
  | 'transactions'
  | 'dex_volume'
  | 'wallet_downloads';

export interface CreateMilestoneInput {
  seasonId: string;
  type: MilestoneType;
  goal: string;
  rewardXrd: string;
}

export interface UpdateMilestoneInput {
  seasonId: string;
  type: MilestoneType;
  goal: string;
  newGoal?: string;
  rewardXrd?: string;
  currentValue?: string;
  isAchieved?: boolean;
}

export interface DeleteMilestoneInput {
  seasonId: string;
  type: MilestoneType;
  goal: string;
}

/**
 * Service for managing milestone progress tracking
 */
export class MilestoneService extends Effect.Service<MilestoneService>()(
  'MilestoneService',
  {
    dependencies: [
      dbClientLive,
      TvlService.Default,
      TransactionCountService.Default,
      DexVolumeService.Default,
    ],
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      const tvlService = yield* TvlService;
      const transactionCountService = yield* TransactionCountService;
      const dexVolumeService = yield* DexVolumeService;

      const checkStalenessForMilestones = Effect.fn(function* (
        milestones: MilestoneRecord[],
      ) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return milestones.some((milestone) => {
          const lastUpdated = new Date(milestone.lastUpdated);
          return lastUpdated < oneHourAgo;
        });
      });

      const updateTvlMilestones = Effect.fn(function* (
        seasonId: string,
        tvlMilestones: MilestoneRecord[],
      ) {
        const tvlData = yield* tvlService.getLatestRadixTvl;

        for (const milestone of tvlMilestones) {
          const currentValue = parseFloat(tvlData.value.toString());
          const goalValue = parseFloat(milestone.goal);
          const shouldBeAchieved = currentValue >= goalValue;
          const wasAlreadyAchieved = milestone.isAchieved;

          // For TVL milestones: once achieved, they stay achieved (sticky behavior)
          const newIsAchieved = shouldBeAchieved || wasAlreadyAchieved;

          yield* Effect.tryPromise({
            try: () =>
              db
                .update(milestones)
                .set({
                  currentValue: tvlData.value.toString(),
                  isAchieved: newIsAchieved,
                  lastUpdated: new Date(),
                })
                .where(
                  and(
                    eq(milestones.seasonId, seasonId),
                    eq(milestones.type, 'tvl'),
                    eq(milestones.goal, milestone.goal),
                  ),
                ),
            catch: (error) => new DbError(error),
          });
        }
      });

      const updateTransactionMilestones = Effect.fn(function* (
        seasonId: string,
        transactionMilestones: MilestoneRecord[],
      ) {
        // First update the transaction_count table with latest data
        yield* transactionCountService.updateTransactionCount();

        // Calculate average weekly transactions for this season
        const averageWeeklyTransactions =
          yield* transactionCountService.calculateAverageWeeklyTransactionsForSeason(
            seasonId,
          );

        // Update transaction milestones with new value (not sticky)
        for (const milestone of transactionMilestones) {
          const currentValue = averageWeeklyTransactions;
          const goalValue = parseFloat(milestone.goal);
          const isAchieved = currentValue >= goalValue;

          yield* Effect.tryPromise({
            try: () =>
              db
                .update(milestones)
                .set({
                  currentValue: averageWeeklyTransactions.toString(),
                  isAchieved: isAchieved,
                  lastUpdated: new Date(),
                })
                .where(
                  and(
                    eq(milestones.seasonId, seasonId),
                    eq(milestones.type, 'transactions'),
                    eq(milestones.goal, milestone.goal),
                  ),
                ),
            catch: (error) => new DbError(error),
          });
        }
      });

      const updateDexVolumeMilestones = Effect.fn(function* (
        seasonId: string,
        dexVolumeMilestones: MilestoneRecord[],
      ) {
        // Calculate total DEX volume since September 8, 2025
        const dexVolumeData = yield* dexVolumeService.getCurrentDexVolume();

        // Update DEX volume milestones with new value (not sticky)
        for (const milestone of dexVolumeMilestones) {
          const currentValue = dexVolumeData.totalVolume;
          const goalValue = parseFloat(milestone.goal);
          const isAchieved = currentValue >= goalValue;

          yield* Effect.tryPromise({
            try: () =>
              db
                .update(milestones)
                .set({
                  currentValue: dexVolumeData.totalVolume.toString(),
                  isAchieved: isAchieved,
                  lastUpdated: new Date(),
                })
                .where(
                  and(
                    eq(milestones.seasonId, seasonId),
                    eq(milestones.type, 'dex_volume'),
                    eq(milestones.goal, milestone.goal),
                  ),
                ),
            catch: (error) => new DbError(error),
          });
        }
      });

      const formatMilestonesForFrontend = Effect.fn(function* (
        milestonesToUse: MilestoneRecord[],
      ) {
        const groupedMilestones: GroupedMilestones = {
          tvl: {
            current: 0,
            milestones: [],
          },
          transactions: {
            current: 0,
            milestones: [],
          },
          dex_volume: {
            current: 0,
            milestones: [],
          },
          wallet_downloads: {
            current: 0,
            milestones: [],
          },
        };

        for (const milestone of milestonesToUse) {
          const currentValue = parseFloat(milestone.currentValue);
          const target = parseFloat(milestone.goal);
          const rewardXrd = parseFloat(milestone.rewardXrd);
          const milestoneType =
            milestone.type as keyof typeof groupedMilestones;

          if (groupedMilestones[milestoneType]) {
            // Update current value to the highest among milestones of this type
            groupedMilestones[milestoneType].current = Math.max(
              groupedMilestones[milestoneType].current,
              currentValue,
            );

            groupedMilestones[milestoneType].milestones.push({
              target,
              reward: rewardXrd,
              achieved: milestone.isAchieved,
            });
          }
        }

        // Sort milestones by target value
        for (const type of Object.keys(groupedMilestones) as Array<
          keyof typeof groupedMilestones
        >) {
          groupedMilestones[type].milestones.sort(
            (a, b) => a.target - b.target,
          );
        }

        return groupedMilestones;
      });

      return {
        /**
         * Create a new milestone
         */
        createMilestone: Effect.fn(function* (input: CreateMilestoneInput) {
          const result = yield* Effect.tryPromise({
            try: () =>
              db
                .insert(milestones)
                .values({
                  seasonId: input.seasonId,
                  type: input.type,
                  goal: input.goal,
                  rewardXrd: input.rewardXrd,
                })
                .returning(),
            catch: (error) => new DbError(error),
          });

          return result[0];
        }),

        /**
         * Get milestone progress data formatted for frontend components
         */
        getMilestoneProgress: Effect.fn(function* (seasonId: string) {
          // Get current milestones
          const allMilestones = yield* Effect.tryPromise({
            try: () =>
              db
                .select()
                .from(milestones)
                .where(eq(milestones.seasonId, seasonId))
                .orderBy(milestones.type, milestones.goal),
            catch: (error) => new DbError(error),
          });

          // Group milestones by type for staleness checking
          const tvlMilestones = allMilestones.filter((m) => m.type === 'tvl');
          const transactionMilestones = allMilestones.filter(
            (m) => m.type === 'transactions',
          );
          const dexVolumeMilestones = allMilestones.filter(
            (m) => m.type === 'dex_volume',
          );

          // Check staleness and update data if needed
          let milestonesToUse = allMilestones;
          let needsRefetch = false;

          const hasStaleTvlData =
            yield* checkStalenessForMilestones(tvlMilestones);
          const hasStaleTransactionData = yield* checkStalenessForMilestones(
            transactionMilestones,
          );
          const hasStaleDexVolumeData =
            yield* checkStalenessForMilestones(dexVolumeMilestones);

          if (hasStaleTvlData) {
            yield* updateTvlMilestones(seasonId, tvlMilestones);
            needsRefetch = true;
          }

          if (hasStaleTransactionData) {
            yield* updateTransactionMilestones(seasonId, transactionMilestones);
            needsRefetch = true;
          }

          if (hasStaleDexVolumeData) {
            yield* updateDexVolumeMilestones(seasonId, dexVolumeMilestones);
            needsRefetch = true;
          }

          // Refetch milestones after updates
          if (needsRefetch) {
            milestonesToUse = yield* Effect.tryPromise({
              try: () =>
                db
                  .select()
                  .from(milestones)
                  .where(eq(milestones.seasonId, seasonId))
                  .orderBy(milestones.type, milestones.goal),
              catch: (error) => new DbError(error),
            });
          }

          return yield* formatMilestonesForFrontend(milestonesToUse);
        }),

        /**
         * Check if milestone data is stale (older than 1 hour)
         */
        checkStalenessForMilestones,

        /**
         * Update TVL milestones with sticky behavior
         */
        updateTvlMilestones,

        /**
         * Update transaction count milestones (not sticky)
         */
        updateTransactionMilestones,

        /**
         * Update DEX volume milestones (not sticky)
         */
        updateDexVolumeMilestones,

        /**
         * Group milestones by type and format for frontend
         */
        formatMilestonesForFrontend,

        /**
         * Get all milestones grouped by season for admin
         */
        getAllMilestonesGroupedBySeason: Effect.fn(function* () {
          const result = yield* Effect.tryPromise({
            try: () =>
              db
                .select()
                .from(milestones)
                .orderBy(milestones.seasonId, milestones.type, milestones.goal),
            catch: (error) => new DbError(error),
          });

          return result;
        }),

        /**
         * Update an existing milestone
         */
        updateMilestone: Effect.fn(function* (input: UpdateMilestoneInput) {
          const updateData: Partial<typeof milestones.$inferInsert> = {};
          let hasUpdates = false;

          if (input.newGoal !== undefined) {
            updateData.goal = input.newGoal;
            hasUpdates = true;
          }
          if (input.rewardXrd !== undefined) {
            updateData.rewardXrd = input.rewardXrd;
            hasUpdates = true;
          }
          if (input.currentValue !== undefined) {
            updateData.currentValue = input.currentValue;
            hasUpdates = true;
          }
          if (input.isAchieved !== undefined) {
            updateData.isAchieved = input.isAchieved;
            hasUpdates = true;
          }

          // Always update lastUpdated when there are changes
          if (hasUpdates) {
            updateData.lastUpdated = new Date();
          } else {
            // No updates provided, return null or throw an error
            return null;
          }

          const result = yield* Effect.tryPromise({
            try: () =>
              db
                .update(milestones)
                .set(updateData)
                .where(
                  and(
                    eq(milestones.seasonId, input.seasonId),
                    eq(milestones.type, input.type),
                    eq(milestones.goal, input.goal),
                  ),
                )
                .returning(),
            catch: (error) => new DbError(error),
          });

          return result[0];
        }),

        /**
         * Delete a milestone
         */
        deleteMilestone: Effect.fn(function* (input: DeleteMilestoneInput) {
          const result = yield* Effect.tryPromise({
            try: () =>
              db
                .delete(milestones)
                .where(
                  and(
                    eq(milestones.seasonId, input.seasonId),
                    eq(milestones.type, input.type),
                    eq(milestones.goal, input.goal),
                  ),
                )
                .returning(),
            catch: (error) => new DbError(error),
          });

          return result[0];
        }),
      } as const;
    }),
  },
) {}

export const MilestoneServiceLive = MilestoneService.Default;
