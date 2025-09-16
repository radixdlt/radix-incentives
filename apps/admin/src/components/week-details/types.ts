import type { RouterOutputs } from '~/trpc/react';

export type WeekDetailsData = RouterOutputs['week']['getWeekDetails'];

export interface AdminWeekDetailsProps {
  weekData: WeekDetailsData;
  seasonId?: string;
  weekId?: string;
  activityUserCounts?: { activityId: string; numberOfAccounts: number }[];
  onProcessWeek?: () => void;
  onTriggerActivityPoints?: () => void;
  onUpdatePointsPool?: (categoryId: string, newPointsPool: number) => void;
  onUpdateMultiplier?: (activityId: string, newMultiplier: number) => void;
  onUpdateLowerBoundsPercentage?: (
    categoryId: string,
    newLowerBoundsPercentage: string,
  ) => void;
  onUpdateOutlierThresholdPercentage?: (
    categoryId: string,
    newOutlierThresholdPercentage: string,
  ) => void;
  onUpdateEnableOutlierDetection?: (
    categoryId: string,
    enableOutlierDetection: boolean,
  ) => void;
  onCalculateMultiplier?: () => void;
}
