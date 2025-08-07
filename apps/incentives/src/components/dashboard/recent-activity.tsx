interface RecentActivityItem {
  id: string;
  type: string;
  description: string;
  points: number;
  timestamp: string;
}

interface RecentActivityProps {
  activities: RecentActivityItem[];
}

export const RecentActivity = ({ activities }: RecentActivityProps) => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm md:col-span-2">
      <div className="p-6">
        <h3 className="font-medium text-lg">Recent Activity</h3>
        <div className="mt-4 space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start justify-between">
              <div>
                <div className="font-medium">{activity.type}</div>
                <div className="text-muted-foreground text-sm">
                  {activity.description}
                </div>
              </div>
              <div className="text-right">
                <div>+{activity.points} pts</div>
                <div className="text-muted-foreground text-sm">
                  {activity.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
