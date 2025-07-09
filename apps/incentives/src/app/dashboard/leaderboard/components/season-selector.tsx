"use client";

interface Season {
  id: string;
  name: string;
  status: string;
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
  return (
    <div className="flex items-center gap-4">
      <label htmlFor="season-select" className="text-sm font-medium">
        Season:
      </label>
      <select
        id="season-select"
        value={selectedSeasonId}
        onChange={(e) => onSeasonChange(e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {seasons.map((season) => (
          <option key={season.id} value={season.id}>
            {season.name} ({season.status})
          </option>
        ))}
      </select>
    </div>
  );
}