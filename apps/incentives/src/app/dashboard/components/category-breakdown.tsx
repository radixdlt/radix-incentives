"use client";

import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import { api } from "~/trpc/react";
import { usePersona } from "~/lib/hooks/usePersona";
import {
  StackedProgressBar,
  type StackedProgressBarItem,
} from "~/components/ui/stacked-progress-bar";

interface CategoryBreakdownProps {
  weekId: string;
}

export function CategoryBreakdown({ weekId }: CategoryBreakdownProps) {
  const router = useRouter();
  const persona = usePersona();

  // Use the user API that gets user's category breakdown directly
  const { data: categoryData = [] } =
    api.user.getUserCategoryBreakdown.useQuery(
      { weekId },
      { enabled: !!persona && !!weekId }
    );

  if (!persona || !weekId) {
    return null;
  }

  const handleCategoryClick = (item: StackedProgressBarItem) => {
    router.push(`/dashboard/leaderboard?category=${item.id}&week=${weekId}`);
  };

  // Transform API data to component format
  const items: StackedProgressBarItem[] = categoryData.map((category) => ({
    id: category.categoryId,
    name: category.categoryName,
    value: category.points,
  }));

  return (
    <StackedProgressBar
      items={items}
      title="Activity Categories"
      onItemClick={handleCategoryClick}
      showNavigationIndicators={true}
      valueSuffix=" AP"
    />
  );
}
