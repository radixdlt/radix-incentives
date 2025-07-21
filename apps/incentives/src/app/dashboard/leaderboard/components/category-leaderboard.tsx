"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import { usePersona } from "~/lib/hooks/usePersona";
import { CategorySelectors } from "./category-selectors";
import { CategoryInfo } from "./category-info";
import { LeaderboardContent } from "./leaderboard-content";
import { LoadingState } from "./loading-state";
import { EmptyState } from "./empty-state";

export function CategoryLeaderboard() {
  const [selectedWeekId, setSelectedWeekId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const persona = usePersona();
  const searchParams = useSearchParams();
  const utils = api.useUtils();

  // Fetch available weeks and activities (categories)
  const { data: weeks, isLoading: weeksLoading } =
    api.leaderboard.getAvailableWeeks.useQuery({});
  const { data: categories, isLoading: categoriesLoading } =
    api.leaderboard.getAvailableCategories.useQuery();

  // Set defaults when data loads, or use URL parameters
  useEffect(() => {
    const urlWeek = searchParams.get("week");
    const urlCategory = searchParams.get("category");

    if (weeks && weeks.length > 0 && !selectedWeekId) {
      if (urlWeek && weeks.some((w) => w.id === urlWeek)) {
        setSelectedWeekId(urlWeek);
      } else {
        // Default to the most recent active or completed week
        const activeWeek = weeks[0];
        if (activeWeek) {
          setSelectedWeekId(activeWeek.id);
        }
      }
    }
  }, [weeks, selectedWeekId, searchParams]);

  useEffect(() => {
    const urlCategory = searchParams.get("category");

    if (categories && categories.length > 0 && !selectedCategoryId) {
      if (urlCategory && categories.some((c) => c.id === urlCategory)) {
        setSelectedCategoryId(urlCategory);
      } else {
        // Default to first category
        // biome-ignore lint/style/noNonNullAssertion: always categories
        setSelectedCategoryId(categories[0]!.id);
      }
    }
  }, [categories, selectedCategoryId, searchParams]);

  // Fetch category leaderboard data
  const { data: leaderboardData, isLoading: leaderboardLoading } =
    api.leaderboard.getActivityCategoryLeaderboard.useQuery(
      {
        categoryId: selectedCategoryId,
        weekId: selectedWeekId,
      },
      { 
        enabled: !!selectedCategoryId && !!selectedWeekId,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
      }
    );

  // Invalidate queries when persona changes to ensure fresh data
  useEffect(() => {
    if (selectedCategoryId && selectedWeekId) {
      utils.leaderboard.getActivityCategoryLeaderboard.invalidate({
        categoryId: selectedCategoryId,
        weekId: selectedWeekId,
      });
    }
  }, [persona, selectedCategoryId, selectedWeekId, utils]);

  if (weeksLoading || categoriesLoading) {
    return <LoadingState message="Loading data..." />;
  }

  if (!weeks || weeks.length === 0) {
    return <EmptyState message="No weeks available yet." />;
  }

  if (!categories || categories.length === 0) {
    return <EmptyState message="No activities available yet." />;
  }

  const selectedWeek = weeks.find((w) => w.id === selectedWeekId);
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="space-y-6">
      {/* Week and Activity Selectors */}
      <CategorySelectors
        weeks={weeks}
        categories={categories}
        selectedWeekId={selectedWeekId}
        selectedCategoryId={selectedCategoryId}
        onWeekChange={setSelectedWeekId}
        onCategoryChange={setSelectedCategoryId}
      />

      {/* Selected Week and Activity Info */}
      {selectedWeek && selectedCategory && (
        <CategoryInfo week={selectedWeek} category={selectedCategory} />
      )}

      {leaderboardLoading ? (
        <LoadingState message="Loading leaderboard..." />
      ) : leaderboardData ? (
        <LeaderboardContent
          topUsers={leaderboardData.topUsers}
          userStats={leaderboardData.userStats}
          globalStats={leaderboardData.globalStats}
          pointsLabel="activity points"
          emptyMessage="No activity data available for this week and activity combination."
          isUserConnected={!!persona}
        />
      ) : (
        <EmptyState message="No activity data available for this week and activity combination." />
      )}
    </div>
  );
}
