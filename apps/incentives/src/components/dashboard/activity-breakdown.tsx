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
        {activities.length === 0 ? (
          <div className="mt-4 text-center py-8">
            <div className="text-muted-foreground">
              <svg
                className="mx-auto h-12 w-12 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p className="text-sm">No activity data available</p>
              <p className="text-xs mt-1">
                Start participating in activities to see your breakdown here.
              </p>
            </div>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};
