import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Skeleton } from '~/components/ui/skeleton';
import type { RouterOutputs } from '~/trpc/react';

type Season = RouterOutputs['season']['getSeasons'][number];
type Week = Exclude<
  RouterOutputs['season']['getSeasonById'],
  void
>['weeks'][number];

type SeasonAndWeekSelectorProps = {
  seasons: Season[] | undefined;
  isSeasonsLoading: boolean;
  selectedSeasonId: string;
  setSelectedSeasonId: (value: string) => void;
  filteredWeeks: Week[];
  isWeeksLoading: boolean;
  selectedWeekId: string;
  setSelectedWeekId: (value: string) => void;
  title?: string;
  description?: string;
};

/**
 * Reusable component for selecting season and week
 * - Controlled component - accepts all state as props
 * - Shows all weeks including future weeks
 * - Displays selected season and week details
 */
export function SeasonAndWeekSelector({
  seasons,
  isSeasonsLoading,
  selectedSeasonId,
  setSelectedSeasonId,
  filteredWeeks,
  isWeeksLoading,
  selectedWeekId,
  setSelectedWeekId,
  title = 'Select Season and Week',
  description,
}: SeasonAndWeekSelectorProps) {
  const selectedSeason = seasons?.find((s) => s.id === selectedSeasonId);
  const selectedWeek = filteredWeeks.find((w) => w.id === selectedWeekId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* Season Selector */}
        <div className="flex items-center gap-4">
          <Label htmlFor="season-select" className="min-w-fit">
            Season:
          </Label>
          {isSeasonsLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={selectedSeasonId}
              onValueChange={setSelectedSeasonId}
            >
              <SelectTrigger id="season-select" className="w-full">
                <SelectValue placeholder="Select a season" />
              </SelectTrigger>
              <SelectContent>
                {seasons?.map((season) => (
                  <SelectItem key={season.id} value={season.id}>
                    {season.name} ({season.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Week Selector */}
        <div className="flex items-center gap-4">
          <Label htmlFor="week-select" className="min-w-fit">
            Week:
          </Label>
          {isWeeksLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={selectedWeekId} onValueChange={setSelectedWeekId}>
              <SelectTrigger
                id="week-select"
                className="w-full"
                disabled={!selectedSeasonId || filteredWeeks.length === 0}
              >
                <SelectValue placeholder="Select a week" />
              </SelectTrigger>
              <SelectContent>
                {filteredWeeks.map((week) => (
                  <SelectItem key={week.id} value={week.id}>
                    Week {new Date(week.startDate).toLocaleDateString()} -{' '}
                    {new Date(week.endDate).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Display selected details */}
        {selectedSeason && selectedWeek && (
          <div className="rounded-md border bg-muted/50 p-3">
            <p className="text-muted-foreground text-sm">
              <span className="font-medium">
                Managing resource rewards for:
              </span>
              <br />
              Season: <span className="font-medium">{selectedSeason.name}</span>{' '}
              ({selectedSeason.status})
              <br />
              Week: {new Date(selectedWeek.startDate).toLocaleDateString()} -{' '}
              {new Date(selectedWeek.endDate).toLocaleDateString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
