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

  // Prefetch category leaderboard data for other categories
  useEffect(() => {
    if (selectedWeekId && categories && categories.length > 0) {
      // Prefetch data for other categories - if cache isn't available, it will fail gracefully
      for (const category of categories) {
        if (category.id !== selectedCategoryId) {
          utils.leaderboard.getActivityCategoryLeaderboard
            .prefetch({
              categoryId: category.id,
              weekId: selectedWeekId,
            })
            .catch(() => {
              // Silently ignore prefetch errors (cache not available)
            });
        }
      }
    }
  }, [selectedWeekId, categories, selectedCategoryId, utils]);

  // Fetch category leaderboard data directly - cache check now happens in backend
  const {
    data: leaderboardData,
    isLoading: leaderboardLoading,
    error: leaderboardError,
    refetch: refetchLeaderboard,
  } = api.leaderboard.getActivityCategoryLeaderboard.useQuery(
    {
      categoryId: selectedCategoryId,
      weekId: selectedWeekId,
    },
    {
      enabled: !!selectedCategoryId && !!selectedWeekId,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry if it's a cache building error
        if (error?.data?.code === "PRECONDITION_FAILED") {
          return false;
        }
        return failureCount < 2;
      },
    }
  );

  // Refetch leaderboard data when persona changes to ensure fresh data
  useEffect(() => {
    // Force invalidation and refetch when user connects/disconnects
    if (selectedCategoryId && selectedWeekId) {
      utils.leaderboard.getActivityCategoryLeaderboard
        .invalidate()
        .then(() => {
          refetchLeaderboard();
        });
    }
  }, [persona, refetchLeaderboard, selectedCategoryId, selectedWeekId, utils]);

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
      ) : leaderboardError ? (
        <EmptyState
          message={
            leaderboardError.data?.code === "PRECONDITION_FAILED"
              ? leaderboardError.message ||
                "Leaderboard data is being processed. Please check back in a few minutes."
              : "Failed to load leaderboard data. Please try again later."
          }
        />
      ) : leaderboardData ? (
        <LeaderboardContent
          topUsers={leaderboardData.topUsers}
          userStats={leaderboardData.userStats}
          globalStats={leaderboardData.globalStats}
          pointsLabel="activity points"
          emptyMessage="Leaderboard data is being processed. Please check back later."
          isUserConnected={!!persona}
        />
      ) : (
        <LoadingState message="Loading leaderboard..." />
      )}
    </div>
  );
}