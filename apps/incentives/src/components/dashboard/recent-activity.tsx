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
    <div className="md:col-span-2 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-medium">Recent Activity</h3>
        <div className="mt-4 space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex justify-between items-start">
              <div>
                <div className="font-medium">{activity.type}</div>
                <div className="text-sm text-muted-foreground">
                  {activity.description}
                </div>
              </div>
              <div className="text-right">
                <div>+{activity.points} pts</div>
                <div className="text-sm text-muted-foreground">
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
