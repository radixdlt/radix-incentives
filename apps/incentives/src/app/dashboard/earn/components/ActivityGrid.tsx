import { ActivityCard } from './ActivityCard';

type ActivityData = {
  id: string;
  name: string | null;
  description: string | null;
  category: string;
  activityCategories: {
    id: string;
    name: string;
    description: string | null;
  };
  dApp?: {
    website: string;
    name: string;
  };
  ap?: boolean;
  multiplier?: boolean;
  hide?: boolean;
};

interface ActivityGridProps {
  activities: ActivityData[];
}

export const ActivityGrid = ({ activities }: ActivityGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  );
};
