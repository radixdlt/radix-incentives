import * as React from 'react';
import { api } from '~/trpc/react';

/**
 * Hook to manage season and week selection with auto-selection logic
 * - Auto-selects the active season (or first season if none active)
 * - Fetches all weeks for the selected season (including future weeks)
 * - Sorts weeks by start date (newest first)
 * - Auto-selects the current week (or most recent if no current week)
 */
export function useSeasonAndWeekSelector() {
  const [selectedSeasonId, setSelectedSeasonId] = React.useState<string>('');
  const [selectedWeekId, setSelectedWeekId] = React.useState<string>('');

  // Get available seasons
  const { data: seasons, isLoading: isSeasonsLoading } =
    api.season.getSeasons.useQuery();

  // Auto-select the latest season when seasons data loads
  React.useEffect(() => {
    if (seasons && seasons.length > 0 && !selectedSeasonId) {
      // Find the active season, or use the first season
      const activeSeason = seasons.find((s) => s.status === 'active');
      const selectedSeason = activeSeason || seasons[0];
      if (selectedSeason) {
        setSelectedSeasonId(selectedSeason.id);
      }
    }
  }, [seasons, selectedSeasonId]);

  // Get season details with all weeks (including future weeks)
  const { data: seasonDetails, isLoading: isWeeksLoading } =
    api.season.getSeasonById.useQuery(
      { id: selectedSeasonId },
      { enabled: !!selectedSeasonId },
    );

  // Get weeks from the season details, sorted by start date (newest first)
  const filteredWeeks = React.useMemo(() => {
    const weeks = seasonDetails?.weeks ?? [];
    return [...weeks].sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    );
  }, [seasonDetails]);

  // Auto-select the current week (week where now is between start and end date)
  React.useEffect(() => {
    if (filteredWeeks.length > 0) {
      const now = new Date();
      // Find the current week (where now is between start and end date)
      const currentWeek = filteredWeeks.find(
        (week) =>
          new Date(week.startDate) <= now && new Date(week.endDate) >= now,
      );
      // If no current week, default to the most recent week
      const selectedWeek =
        currentWeek ||
        filteredWeeks.reduce((latest, current) =>
          new Date(current.endDate) > new Date(latest.endDate)
            ? current
            : latest,
        );
      setSelectedWeekId(selectedWeek.id);
    } else {
      setSelectedWeekId('');
    }
  }, [filteredWeeks]);

  return {
    seasons,
    isSeasonsLoading,
    selectedSeasonId,
    setSelectedSeasonId,
    filteredWeeks,
    isWeeksLoading,
    selectedWeekId,
    setSelectedWeekId,
  };
}
