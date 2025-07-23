"use client";

import { Calendar, Trophy } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

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
    const start = new Date(startDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const end = new Date(endDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${start} - ${end}`;
  };

  const getWeekStatus = (startDate: Date, endDate: Date) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now >= start && now <= end) return "current";
    if (now > end) return "past";
    return "future";
  };

  const selectedWeekData = weeks.find((w) => w.id === selectedWeekId);
  const selectedCategoryData = categories.find(
    (c) => c.id === selectedCategoryId
  );

  const truncateAfterWords = (text: string, maxWords = 3) => {
    const words = text.split(" ");
    if (words.length > maxWords) {
      return `${words.slice(0, maxWords).join(" ")}...`;
    }
    return text;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0">
            <Calendar className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Activity Points
            </h2>
            <p className="text-sm text-white/60">
              Choose a week and activity category to view the leaderboard
            </p>
          </div>
        </div>
      </div>

      {/* Selectors Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Week Selector - Half Width */}
        <div className="flex-1">
          <div className="relative">
            <Select value={selectedWeekId} onValueChange={onWeekChange}>
              <SelectTrigger className="w-full h-16 px-4 glass-card border border-white/20 hover:border-white/30 transition-all duration-300 rounded-xl">
                <div className="flex items-center w-full">
                  <div className="flex items-center gap-3">
                    {selectedWeekData && (
                      <>
                        <div
                          className={`h-3 w-3 rounded-full ${
                            getWeekStatus(
                              selectedWeekData.startDate,
                              selectedWeekData.endDate
                            ) === "current"
                              ? "bg-green-400 animate-pulse"
                              : getWeekStatus(
                                    selectedWeekData.startDate,
                                    selectedWeekData.endDate
                                  ) === "past"
                                ? "bg-cyan-400"
                                : "bg-pink-400"
                          }`}
                        />
                        <div className="text-left">
                          <div className="text-base font-medium text-white text-left">
                            {formatWeekRange(
                              selectedWeekData.startDate,
                              selectedWeekData.endDate
                            )}
                          </div>
                          <div className="text-sm text-white/60 flex items-center gap-2 text-left">
                            {selectedWeekData.seasonName}
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                              {getWeekStatus(
                                selectedWeekData.startDate,
                                selectedWeekData.endDate
                              ) === "current" && "Active"}
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
              <SelectContent className="w-full rounded-xl border border-white/20 glass shadow-xl">
                {weeks.map((week) => {
                  const status = getWeekStatus(week.startDate, week.endDate);
                  return (
                    <SelectItem
                      key={week.id}
                      value={week.id}
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
                            {formatWeekRange(week.startDate, week.endDate)}
                          </div>
                          <div className="text-sm opacity-60 flex items-center gap-2 text-left">
                            {week.seasonName}
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted/50">
                              {status === "current" && "Active"}
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
              <SelectTrigger className="w-full h-16 px-4 glass-card border border-white/20 hover:border-white/30 transition-all duration-300 rounded-xl">
                <div className="flex items-center w-full">
                  <div className="flex items-center gap-3">
                    {selectedCategoryData && (
                      <>
                        <div className="h-3 w-3 rounded-full bg-cyan-400" />
                        <div className="text-left min-w-0 flex-1">
                          <div className="text-base font-medium text-white text-left">
                            <span className="hidden sm:inline">
                              {selectedCategoryData.name}
                            </span>
                            <span className="sm:hidden truncate">
                              {truncateAfterWords(selectedCategoryData.name)}
                            </span>
                          </div>
                          <div className="text-sm text-white/60 text-left">
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
              <SelectContent className="w-full rounded-xl border border-white/20 glass shadow-xl">
                {categories.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.id}
                    className="h-16 px-4 py-3 cursor-pointer transition-all duration-300 hover:bg-white/10 text-white"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="h-3 w-3 rounded-full bg-cyan-400" />
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-medium text-left">
                          {category.name}
                        </div>
                        <div className="text-sm opacity-60 text-left">
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
