import { cn } from '~/lib/utils';

interface ActivityItem {
  name: string;
  points: number;
  percentage: number;
}

interface ActivityBreakdownProps {
  activities: ActivityItem[];
}

export const ActivityBreakdown = ({ activities }: ActivityBreakdownProps) => {
  return (
    <div className="w-full md:col-span-full rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-medium">Activity Breakdown</h3>
        <div className="mt-4 space-y-2">
          {activities.map((activity) => (
            <div key={activity.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">{activity.name}</span>
                <span className="text-sm font-medium">
                  {activity.points.toLocaleString()} pts
                </span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={cn('h-full bg-primary')}
                  style={{ width: `${activity.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
