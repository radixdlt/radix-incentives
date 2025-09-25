import type { LucideIcon } from 'lucide-react';
import { Card } from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';
import { formatMilestoneReward } from '~/lib/utils';

interface MilestoneItem {
  target: number;
  reward: number;
  achieved: boolean;
  current?: number;
}

interface MilestoneProgressProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  currentValue: number;
  unit: string;
  milestones: MilestoneItem[];
  formatValue?: (value: number) => string;
}

export const MilestoneProgress = ({
  title,
  icon: Icon,
  iconColor,
  currentValue,
  unit,
  milestones,
  formatValue = (value) => value.toLocaleString(),
}: MilestoneProgressProps) => {
  const nextMilestone = milestones.find((m) => !m.achieved);
  const completedMilestones = milestones.filter((m) => m.achieved).length;
  const totalMilestones = milestones.length;

  const getProgress = () => {
    if (!nextMilestone) return 100;
    const previousTarget = milestones
      .filter((m) => m.target < nextMilestone.target)
      .reduce((max, m) => Math.max(max, m.target), 0);

    const range = nextMilestone.target - previousTarget;
    const current = currentValue - previousTarget;
    return Math.max(0, Math.min(100, (current / range) * 100));
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${iconColor}`} />
            <span className="font-medium text-sm">{title}</span>
          </div>
          <div className="text-muted-foreground text-xs">
            {completedMilestones}/{totalMilestones}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current</span>
            <span className="font-medium">
              {formatValue(currentValue)} {unit}
            </span>
          </div>

          {nextMilestone && (
            <>
              <Progress value={getProgress()} className="h-2" />
              <div className="flex items-center justify-between text-muted-foreground text-xs">
                <span>
                  Next: {formatValue(nextMilestone.target)} {unit}
                </span>
                <span>+{formatMilestoneReward(nextMilestone.reward)}</span>
              </div>
            </>
          )}

          {!nextMilestone && (
            <div className="rounded-lg bg-green-500/10 p-2 text-center text-green-600 text-xs">
              All milestones achieved! 🎉
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
