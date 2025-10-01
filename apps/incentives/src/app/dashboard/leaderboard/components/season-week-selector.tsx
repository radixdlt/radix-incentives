'use client';

import { Trophy } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

interface Season {
  id: string;
  name: string;
  status: string;
  startDate: Date;
  endDate: Date;
}

interface Week {
  id: string;
  seasonId: string;
  startDate: Date;
  endDate: Date;
  seasonName: string;
}

interface SeasonWeekSelectorProps {
  seasons: Season[];
  weeks: Week[];
  selectedSeasonId: string;
  selectedWeekId: string | null; // null means overall season view
  onSelectionChange: (seasonId: string, weekId: string | null) => void;
}

type SelectionValue = `${string}:overall` | `${string}:${string}`;

export function SeasonWeekSelector({
  seasons,
  weeks,
  selectedSeasonId,
  selectedWeekId,
  onSelectionChange,
}: SeasonWeekSelectorProps) {
  const getSeasonStatus = (status: string, startDate: Date, endDate: Date) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (status === 'active' || (now >= start && now <= end)) return 'current';
    if (now > end || status === 'completed') return 'past';
    return 'future';
  };

  const getWeekStatus = (startDate: Date, endDate: Date) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now >= start && now <= end) return 'current';
    if (now > end) return 'past';
    return 'future';
  };

  const getSeasonNumber = (name: string) => {
    // Extract number from season name (e.g., "Season 1" -> "1")
    const match = name.match(/season\s*(\d+)/i);
    return match ? match[1] : name;
  };

  const getWeekNumber = (weekId: string, seasonId: string) => {
    const seasonWeeks = weeks
      .filter((week) => week.seasonId === seasonId)
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      );

    const weekIndex = seasonWeeks.findIndex((week) => week.id === weekId);
    return weekIndex + 1;
  };

  const formatWeekRange = (startDate: Date, endDate: Date) => {
    const start = new Date(startDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const end = new Date(endDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${start} - ${end}`;
  };

  // Create the current selection value
  const currentValue: SelectionValue = selectedWeekId
    ? `${selectedSeasonId}:${selectedWeekId}`
    : `${selectedSeasonId}:overall`;

  const handleValueChange = (value: SelectionValue) => {
    const [seasonId, weekPart] = value.split(':');
    if (!seasonId) return;

    const weekId = weekPart === 'overall' ? null : weekPart || null;
    onSelectionChange(seasonId, weekId);
  };

  const selectedSeasonData = seasons.find((s) => s.id === selectedSeasonId);
  const selectedWeekData = selectedWeekId
    ? weeks.find((w) => w.id === selectedWeekId)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="gradient-brand flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg">
            <Trophy className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-lg">
              Season Points
            </h2>
            <p className="text-muted-foreground text-sm">
              Choose a season and view option for the leaderboard
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Select value={currentValue} onValueChange={handleValueChange}>
          <SelectTrigger className="glass-card h-16 w-full rounded-xl border border-white/20 px-4 transition-all duration-300 hover:border-white/30">
            <div className="flex w-full items-center">
              <div className="flex items-center gap-3">
                {selectedSeasonData && (
                  <>
                    <div
                      className={`h-3 w-3 rounded-full ${
                        selectedWeekData
                          ? getWeekStatus(
                              selectedWeekData.startDate,
                              selectedWeekData.endDate,
                            ) === 'current'
                            ? 'animate-pulse bg-green-400'
                            : getWeekStatus(
                                  selectedWeekData.startDate,
                                  selectedWeekData.endDate,
                                ) === 'past'
                              ? 'bg-cyan-400'
                              : 'bg-pink-400'
                          : getSeasonStatus(
                                selectedSeasonData.status,
                                selectedSeasonData.startDate,
                                selectedSeasonData.endDate,
                              ) === 'current'
                            ? 'bg-purple-400'
                            : getSeasonStatus(
                                  selectedSeasonData.status,
                                  selectedSeasonData.startDate,
                                  selectedSeasonData.endDate,
                                ) === 'past'
                              ? 'bg-purple-400'
                              : 'bg-purple-400'
                      }`}
                    />
                    <div className="text-left">
                      <div className="text-left font-medium text-base text-white">
                        {selectedWeekData
                          ? `Season ${getSeasonNumber(selectedSeasonData.name)}, Week ${getWeekNumber(selectedWeekData.id, selectedWeekData.seasonId)}`
                          : `Season ${getSeasonNumber(selectedSeasonData.name)} - Overall`}
                      </div>
                      {selectedWeekData && (
                        <div className="flex items-center gap-2 text-left text-sm text-white/60">
                          {formatWeekRange(
                            selectedWeekData.startDate,
                            selectedWeekData.endDate,
                          )}
                          {getWeekStatus(
                            selectedWeekData.startDate,
                            selectedWeekData.endDate,
                          ) === 'current' && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                              Active
                            </span>
                          )}
                        </div>
                      )}
                      {!selectedWeekData && (
                        <div className="text-left text-sm text-white/60">
                          All weeks combined
                        </div>
                      )}
                    </div>
                  </>
                )}
                {!selectedSeasonData && (
                  <SelectValue placeholder="Select a season and view option" />
                )}
              </div>
            </div>
          </SelectTrigger>
          <SelectContent className="glass w-full rounded-xl border border-white/20 shadow-xl">
            {seasons.map((season) => {
              const _seasonStatus = getSeasonStatus(
                season.status,
                season.startDate,
                season.endDate,
              );
              const seasonWeeks = weeks.filter(
                (week) => week.seasonId === season.id,
              );

              return (
                <div key={season.id}>
                  {/* Season Overall Option */}
                  <SelectItem
                    value={`${season.id}:overall`}
                    className="h-16 cursor-pointer px-4 py-3 text-white transition-all duration-300 hover:bg-white/10"
                  >
                    <div className="flex w-full items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-purple-400" />
                      <div className="flex-1 text-left">
                        <div className="text-left font-medium">
                          Season {getSeasonNumber(season.name)} - Overall
                        </div>
                        <div className="text-left text-sm opacity-60">
                          All weeks combined
                        </div>
                      </div>
                    </div>
                  </SelectItem>

                  {/* Individual weeks for this season */}
                  {seasonWeeks
                    .filter((week) => {
                      // Hide active/current weeks - leaderboard is only built after week ends
                      const weekStatus = getWeekStatus(
                        week.startDate,
                        week.endDate,
                      );
                      return weekStatus !== 'current';
                    })
                    .sort(
                      (a, b) =>
                        new Date(b.startDate).getTime() -
                        new Date(a.startDate).getTime(),
                    )
                    .map((week) => {
                      const weekStatus = getWeekStatus(
                        week.startDate,
                        week.endDate,
                      );
                      return (
                        <SelectItem
                          key={week.id}
                          value={`${season.id}:${week.id}`}
                          className="h-16 cursor-pointer px-4 py-3 text-white transition-all duration-300 hover:bg-white/10"
                        >
                          <div className="flex w-full items-center gap-3">
                            <div
                              className={`h-3 w-3 rounded-full ${
                                weekStatus === 'current'
                                  ? 'animate-pulse bg-green-400'
                                  : weekStatus === 'past'
                                    ? 'bg-cyan-400'
                                    : 'bg-pink-400'
                              }`}
                            />
                            <div className="flex-1 text-left">
                              <div className="text-left font-medium">
                                Season {getSeasonNumber(season.name)}, Week{' '}
                                {getWeekNumber(week.id, week.seasonId)}
                              </div>
                              <div className="flex items-center gap-2 text-left text-sm opacity-60">
                                {formatWeekRange(week.startDate, week.endDate)}
                                {weekStatus === 'current' && (
                                  <span className="rounded-full bg-muted/50 px-2 py-0.5 text-xs">
                                    Active
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                </div>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
