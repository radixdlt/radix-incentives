import type { RouterOutputs } from "~/trpc/react";

export type WeekDetailsData = RouterOutputs["week"]["getWeekDetails"];

export interface AdminWeekDetailsProps {
  weekData: WeekDetailsData;
  seasonId?: string;
  weekId?: string;
  onProcessWeek?: () => void;
  onUpdatePointsPool?: (categoryId: string, newPointsPool: number) => void;
  onUpdateMultiplier?: (activityId: string, newMultiplier: number) => void;
}
