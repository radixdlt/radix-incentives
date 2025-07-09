"use client";

interface Week {
  id: string;
  startDate: Date;
  endDate: Date;
}

interface Activity {
  id: string;
  name: string | null;
  description: string | null;
}

interface ActivityInfoProps {
  week: Week;
  activity: Activity;
}

export function ActivityInfo({ week, activity }: ActivityInfoProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatActivityName = (name: string | null, id?: string) => {
    if (!name) {
      // Fall back to ID if name is null
      return id ? id.replace(/_/g, " ").toUpperCase() : "UNKNOWN ACTIVITY";
    }
    return name.replace(/_/g, " ").toUpperCase();
  };

  return (
    <div className="p-4 rounded-lg bg-muted/50">
      <h3 className="font-medium">
        {formatActivityName(activity.name, activity.id)} -
        Week of {formatDate(week.startDate)}
      </h3>
      {activity.description && (
        <p className="text-sm text-muted-foreground mt-1">
          {activity.description}
        </p>
      )}
    </div>
  );
}