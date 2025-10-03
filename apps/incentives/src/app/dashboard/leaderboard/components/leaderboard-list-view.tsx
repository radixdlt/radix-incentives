'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { truncateLongWords } from '~/lib/utils';
import { api } from '~/trpc/react';

type LeaderboardListViewProps = {
  seasonId?: string;
  categoryId?: string;
  weekId?: string;
  pointsLabel: string;
  highlightUserId?: string;
  isSeasonView?: boolean;
  currentUserRank?: number;
};

export function LeaderboardListView({
  seasonId,
  categoryId,
  weekId,
  pointsLabel,
  highlightUserId,
  isSeasonView = false,
  currentUserRank,
}: LeaderboardListViewProps) {
  const [page, setPage] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const limit = 50;

  // Determine which query to use based on props
  const isCategoryLeaderboard = !!categoryId && !!weekId;
  const isSeasonLeaderboard = !!seasonId;

  const categoryQuery =
    api.leaderboard.getActivityCategoryLeaderboardPaginated.useQuery(
      {
        categoryId: categoryId ?? '',
        weekId: weekId ?? '',
        page,
        limit,
      },
      {
        enabled: isCategoryLeaderboard,
      },
    );

  const seasonQuery = api.leaderboard.getSeasonLeaderboardPaginated.useQuery(
    {
      seasonId: seasonId ?? '',
      weekId: isSeasonView ? weekId : undefined,
      page,
      limit,
    },
    {
      enabled: isSeasonLeaderboard,
    },
  );

  const queryResult = isCategoryLeaderboard ? categoryQuery : seasonQuery;
  const { data, isLoading, error } = queryResult;

  // Reset page to 0 when seasonId, categoryId, or weekId changes
  useEffect(() => {
    setPage(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [seasonId, categoryId, weekId]);

  if (error) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Failed to load leaderboard data. Please try again later.
      </div>
    );
  }

  const formatPoints = (points: string) => {
    const num = Number.parseFloat(points);
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const entries = data?.data || [];
  const totalUsers = data?.totalUsers || 0;
  const totalPages = Math.ceil(totalUsers / limit);
  const startRank = page * limit + 1;
  const endRank = Math.min((page + 1) * limit, totalUsers);

  return (
    <div className="flex flex-col">
      {/* Pagination Info and Controls - Top */}
      <div className="mb-3 flex flex-col gap-2 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-muted-foreground text-xs sm:text-sm">
          <span className="font-semibold text-foreground">
            {startRank}-{endRank}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-foreground">
            {totalUsers.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || isLoading}
            className="flex items-center rounded-md border px-2 py-1.5 text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-xs sm:text-sm">
            Page <span className="font-semibold">{page + 1}</span> of{' '}
            {totalPages}
          </div>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1 || isLoading}
            className="flex items-center rounded-md border px-2 py-1.5 text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="grid grid-cols-[40px_1fr_80px] gap-1 border-b px-4 pb-2 font-medium text-muted-foreground text-xs sm:grid-cols-[80px_1fr_150px] sm:gap-4 sm:text-sm">
        <div>Rank</div>
        <div>User</div>
        <div className="text-right">{pointsLabel}</div>
      </div>

      {/* Scrollable Entries List - Fixed height */}
      <div
        ref={scrollContainerRef}
        className="mt-2 h-[300px] space-y-2 overflow-y-auto pr-2"
      >
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No entries available yet.
          </div>
        ) : (
          entries.map((entry) => {
            const isHighlighted = currentUserRank === entry.rank;

            // Determine styling based on rank or user highlight
            let borderClass = 'border-border';
            let bgClass = 'hover:bg-muted/50';
            let textColorClass = '';
            let shadowClass = '';

            if (isHighlighted) {
              borderClass = 'border-primary/30';
              bgClass = 'bg-primary/5';
              textColorClass = 'text-primary';
              shadowClass = 'shadow-[inset_0_0_15px_rgba(168,85,247,0.3)]';
            } else if (entry.rank === 1) {
              borderClass = 'border-yellow-500/30';
              bgClass = 'bg-yellow-500/5';
              textColorClass = 'text-yellow-600';
              shadowClass = 'shadow-[inset_0_0_15px_rgba(234,179,8,0.3)]';
            } else if (entry.rank === 2) {
              borderClass = 'border-gray-400/30';
              bgClass = 'bg-gray-400/5';
              textColorClass = 'text-gray-500';
              shadowClass = 'shadow-[inset_0_0_15px_rgba(156,163,175,0.3)]';
            } else if (entry.rank === 3) {
              borderClass = 'border-orange-500/30';
              bgClass = 'bg-orange-500/5';
              textColorClass = 'text-orange-600';
              shadowClass = 'shadow-[inset_0_0_15px_rgba(249,115,22,0.3)]';
            }

            return (
              <div
                key={`${entry.userId}-${entry.rank}`}
                className={`grid grid-cols-[40px_1fr_80px] gap-1 rounded-lg border px-4 py-3 transition-all duration-200 sm:grid-cols-[80px_1fr_150px] sm:gap-4 ${borderClass} ${bgClass} ${shadowClass}`}
              >
                <div
                  className={`flex items-center font-semibold text-xs sm:text-base ${textColorClass}`}
                >
                  #{entry.rank}
                </div>
                <div className="flex items-center overflow-hidden">
                  <div
                    className={`truncate font-medium text-xs sm:text-base ${textColorClass}`}
                  >
                    {truncateLongWords(entry.label || 'Anonymous')}
                  </div>
                </div>
                <div
                  className={`flex items-center justify-end font-semibold tabular-nums text-xs sm:text-base ${textColorClass}`}
                >
                  {formatPoints(entry.totalPoints)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
