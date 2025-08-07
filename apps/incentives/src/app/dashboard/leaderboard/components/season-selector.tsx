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

interface SeasonSelectorProps {
  seasons: Season[];
  selectedSeasonId: string;
  onSeasonChange: (seasonId: string) => void;
}

export function SeasonSelector({
  seasons,
  selectedSeasonId,
  onSeasonChange,
}: SeasonSelectorProps) {
  const formatSeasonRange = (startDate: Date, endDate: Date) => {
    const start = new Date(startDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const end = new Date(endDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${start} - ${end}`;
  };

  const getSeasonStatus = (status: string, startDate: Date, endDate: Date) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (status === 'active' || (now >= start && now <= end)) return 'current';
    if (now > end || status === 'completed') return 'past';
    return 'future';
  };

  const getSeasonNumber = (name: string) => {
    // Extract number from season name (e.g., "Season 1" -> "1")
    const match = name.match(/season\s*(\d+)/i);
    return match ? match[1] : name;
  };

  const selectedSeasonData = seasons.find((s) => s.id === selectedSeasonId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="gradient-brand flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg">
            <Trophy className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-lg">Season</h2>
            <p className="text-muted-foreground text-sm">
              Choose a season to view the leaderboard
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Select value={selectedSeasonId || ''} onValueChange={onSeasonChange}>
          <SelectTrigger className="glass-card h-16 w-full rounded-xl border border-white/20 px-4 transition-all duration-300 hover:border-white/30">
            <div className="flex w-full items-center">
              <div className="flex items-center gap-3">
                {selectedSeasonData && (
                  <>
                    <div
                      className={`h-3 w-3 rounded-full ${
                        getSeasonStatus(
                          selectedSeasonData.status,
                          selectedSeasonData.startDate,
                          selectedSeasonData.endDate,
                        ) === 'current'
                          ? 'animate-pulse bg-green-400'
                          : getSeasonStatus(
                                selectedSeasonData.status,
                                selectedSeasonData.startDate,
                                selectedSeasonData.endDate,
                              ) === 'past'
                            ? 'bg-cyan-400'
                            : 'bg-pink-400'
                      }`}
                    />
                    <div className="text-left">
                      <div className="text-left font-medium text-base text-white">
                        Season {getSeasonNumber(selectedSeasonData.name)}
                      </div>
                      <div className="flex items-center gap-2 text-left text-sm text-white/60">
                        {formatSeasonRange(
                          selectedSeasonData.startDate,
                          selectedSeasonData.endDate,
                        )}
                      </div>
                    </div>
                  </>
                )}
                {!selectedSeasonData && (
                  <SelectValue placeholder="Select a season to view the leaderboard" />
                )}
              </div>
            </div>
          </SelectTrigger>
          <SelectContent className="glass w-full rounded-xl border border-white/20 shadow-xl">
            {seasons.map((season) => {
              const status = getSeasonStatus(
                season.status,
                season.startDate,
                season.endDate,
              );
              return (
                <SelectItem
                  key={season.id}
                  value={season.id}
                  className="h-16 cursor-pointer px-4 py-3 text-white transition-all duration-300 hover:bg-white/10"
                >
                  <div className="flex w-full items-center gap-3">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        status === 'current'
                          ? 'animate-pulse bg-green-400'
                          : status === 'past'
                            ? 'bg-cyan-400'
                            : 'bg-pink-400'
                      }`}
                    />
                    <div className="flex-1 text-left">
                      <div className="text-left font-medium">
                        Season {getSeasonNumber(season.name)}
                      </div>
                      <div className="flex items-center gap-2 text-left text-sm opacity-60">
                        {formatSeasonRange(season.startDate, season.endDate)}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
