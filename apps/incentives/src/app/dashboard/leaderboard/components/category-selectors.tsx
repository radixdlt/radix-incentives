'use client';

import { Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

interface Week {
  id: string;
  seasonId: string;
  startDate: Date;
  endDate: Date;
  seasonName: string;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface CategorySelectorsProps {
  weeks: Week[];
  categories: Category[];
  selectedWeekId: string;
  selectedCategoryId: string;
  onWeekChange: (weekId: string) => void;
  onCategoryChange: (categoryId: string) => void;
}

export function CategorySelectors({
  weeks,
  categories,
  selectedWeekId,
  selectedCategoryId,
  onWeekChange,
  onCategoryChange,
}: CategorySelectorsProps) {
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

  const getWeekStatus = (startDate: Date, endDate: Date) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now >= start && now <= end) return 'current';
    if (now > end) return 'past';
    return 'future';
  };

  const selectedWeekData = weeks.find((w) => w.id === selectedWeekId);
  const selectedCategoryData = categories.find(
    (c) => c.id === selectedCategoryId,
  );

  const truncateAfterWords = (text: string, maxWords = 3) => {
    const words = text.split(' ');
    if (words.length > maxWords) {
      return `${words.slice(0, maxWords).join(' ')}...`;
    }
    return text;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="gradient-brand flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg">
            <Calendar className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-white">
              Activity Points
            </h2>
            <p className="text-sm text-white/60">
              Choose a week and activity category to view the leaderboard
            </p>
          </div>
        </div>
      </div>

      {/* Selectors Row */}
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Week Selector - Half Width */}
        <div className="flex-1">
          <div className="relative">
            <Select value={selectedWeekId} onValueChange={onWeekChange}>
              <SelectTrigger className="glass-card h-16 w-full rounded-xl border border-white/20 px-4 transition-all duration-300 hover:border-white/30">
                <div className="flex w-full items-center">
                  <div className="flex items-center gap-3">
                    {selectedWeekData && (
                      <>
                        <div
                          className={`h-3 w-3 rounded-full ${
                            getWeekStatus(
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
                          }`}
                        />
                        <div className="text-left">
                          <div className="text-left font-medium text-base text-white">
                            {formatWeekRange(
                              selectedWeekData.startDate,
                              selectedWeekData.endDate,
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-left text-sm text-white/60">
                            {selectedWeekData.seasonName}
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                              {getWeekStatus(
                                selectedWeekData.startDate,
                                selectedWeekData.endDate,
                              ) === 'current' && 'Active'}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                    {!selectedWeekData && (
                      <SelectValue placeholder="Select a week" />
                    )}
                  </div>
                </div>
              </SelectTrigger>
              <SelectContent className="glass w-full rounded-xl border border-white/20 shadow-xl">
                {weeks.map((week) => {
                  const status = getWeekStatus(week.startDate, week.endDate);
                  return (
                    <SelectItem
                      key={week.id}
                      value={week.id}
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
                            {formatWeekRange(week.startDate, week.endDate)}
                          </div>
                          <div className="flex items-center gap-2 text-left text-sm opacity-60">
                            {week.seasonName}
                            <span className="rounded-full bg-muted/50 px-2 py-0.5 text-xs">
                              {status === 'current' && 'Active'}
                            </span>
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

        {/* Activity Category Selector - Half Width */}
        <div className="flex-1">
          <div className="relative">
            <Select value={selectedCategoryId} onValueChange={onCategoryChange}>
              <SelectTrigger className="glass-card h-16 w-full rounded-xl border border-white/20 px-4 transition-all duration-300 hover:border-white/30">
                <div className="flex w-full items-center">
                  <div className="flex items-center gap-3">
                    {selectedCategoryData && (
                      <>
                        <div className="h-3 w-3 rounded-full bg-cyan-400" />
                        <div className="min-w-0 flex-1 text-left">
                          <div className="text-left font-medium text-base text-white">
                            <span className="hidden sm:inline">
                              {selectedCategoryData.name}
                            </span>
                            <span className="truncate sm:hidden">
                              {truncateAfterWords(selectedCategoryData.name)}
                            </span>
                          </div>
                          <div className="text-left text-sm text-white/60">
                            Activity Category
                          </div>
                        </div>
                      </>
                    )}
                    {!selectedCategoryData && (
                      <SelectValue placeholder="Select an activity" />
                    )}
                  </div>
                </div>
              </SelectTrigger>
              <SelectContent className="glass w-full rounded-xl border border-white/20 shadow-xl">
                {categories.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.id}
                    className="h-16 cursor-pointer px-4 py-3 text-white transition-all duration-300 hover:bg-white/10"
                  >
                    <div className="flex w-full items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-cyan-400" />
                      <div className="min-w-0 flex-1 text-left">
                        <div className="text-left font-medium">
                          {category.name}
                        </div>
                        <div className="text-left text-sm opacity-60">
                          Activity Category
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
