import type { RouterOutputs } from '~/trpc/react';

export type WeekDetailsData = RouterOutputs['week']['getWeekDetails'];

export interface AdminWeekDetailsProps {
  weekData: WeekDetailsData;
  seasonId?: string;
  weekId?: string;
  onActivityAction?: (activityId: string, action: 'edit' | 'delete') => void;
  onRecalculatePoints?: () => void;
  onUpdatePointsPool?: (categoryId: string, newPointsPool: number) => void;
}