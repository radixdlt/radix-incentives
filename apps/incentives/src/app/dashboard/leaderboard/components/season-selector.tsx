"use client";

import { Trophy, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

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
    const start = new Date(startDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const end = new Date(endDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${start} - ${end}`;
  };

  const getSeasonStatus = (status: string, startDate: Date, endDate: Date) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (status === "active" || (now >= start && now <= end)) return "current";
    if (now > end || status === "completed") return "past";
    return "future";
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
          <div className="h-8 w-8 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0">
            <Trophy className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Season</h2>
            <p className="text-sm text-muted-foreground">
              Choose a season to view the leaderboard
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Select value={selectedSeasonId || ""} onValueChange={onSeasonChange}>
          <SelectTrigger className="w-full h-16 px-4 glass-card border border-white/20 hover:border-white/30 transition-all duration-300 rounded-xl">
            <div className="flex items-center w-full">
              <div className="flex items-center gap-3">
                {selectedSeasonData && (
                  <>
                    <div
                      className={`h-3 w-3 rounded-full ${
                        getSeasonStatus(
                          selectedSeasonData.status,
                          selectedSeasonData.startDate,
                          selectedSeasonData.endDate
                        ) === "current"
                          ? "bg-green-400 animate-pulse"
                          : getSeasonStatus(
                                selectedSeasonData.status,
                                selectedSeasonData.startDate,
                                selectedSeasonData.endDate
                              ) === "past"
                            ? "bg-cyan-400"
                            : "bg-pink-400"
                      }`}
                    />
                    <div className="text-left">
                      <div className="text-base font-medium text-white text-left">
                        Season {getSeasonNumber(selectedSeasonData.name)}
                      </div>
                      <div className="text-sm text-white/60 flex items-center gap-2 text-left">
                        {formatSeasonRange(
                          selectedSeasonData.startDate,
                          selectedSeasonData.endDate
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
          <SelectContent className="w-full rounded-xl border border-white/20 glass shadow-xl">
            {seasons.map((season) => {
              const status = getSeasonStatus(
                season.status,
                season.startDate,
                season.endDate
              );
              return (
                <SelectItem
                  key={season.id}
                  value={season.id}
                  className="h-16 px-4 py-3 cursor-pointer transition-all duration-300 hover:bg-white/10 text-white"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        status === "current"
                          ? "bg-green-400 animate-pulse"
                          : status === "past"
                            ? "bg-cyan-400"
                            : "bg-pink-400"
                      }`}
                    />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-left">
                        Season {getSeasonNumber(season.name)}
                      </div>
                      <div className="text-sm opacity-60 flex items-center gap-2 text-left">
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
