"use client";

interface Week {
  id: string;
  startDate: Date;
  endDate: Date;
  seasonName: string;
}

interface Activity {
  id: string;
  name: string | null;
  description: string | null;
}

interface ActivitySelectorsProps {
  weeks: Week[];
  activities: Activity[];
  selectedWeekId: string;
  selectedActivityId: string;
  onWeekChange: (weekId: string) => void;
  onActivityChange: (activityId: string) => void;
}

export function ActivitySelectors({
  weeks,
  activities,
  selectedWeekId,
  selectedActivityId,
  onWeekChange,
  onActivityChange,
}: ActivitySelectorsProps) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label htmlFor="week-select" className="text-sm font-medium">
          Week:
        </label>
        <select
          id="week-select"
          value={selectedWeekId}
          onChange={(e) => onWeekChange(e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {weeks.map((week) => (
            <option key={week.id} value={week.id}>
              {formatDate(week.startDate)} - {formatDate(week.endDate)} (
              {week.seasonName})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="activity-select" className="text-sm font-medium">
          Activity:
        </label>
        <select
          id="activity-select"
          value={selectedActivityId}
          onChange={(e) => onActivityChange(e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {activities.map((activity) => (
            <option key={activity.id} value={activity.id}>
              {formatActivityName(activity.name, activity.id)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}