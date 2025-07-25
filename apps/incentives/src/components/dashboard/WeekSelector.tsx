'use client';

import { Calendar, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

type WeekData = {
  id: string;
  startDate: Date;
  endDate: Date;
  seasonName: string;
};

type WeekSelectorProps = {
  weeks: WeekData[];
  selectedWeek: string | null;
  onWeekChange: (weekId: string) => void;
};

const WeekSelector = ({
  weeks,
  selectedWeek,
  onWeekChange,
}: WeekSelectorProps) => {
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

  const selectedWeekData = weeks.find((w) => w.id === selectedWeek);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-brand flex items-center justify-center">
            <Calendar className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Week Selection
            </h2>
            <p className="text-sm text-white/60">
              Choose a week to view your performance
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Select value={selectedWeek || ''} onValueChange={onWeekChange}>
          <SelectTrigger className="w-full h-16 px-4 glass-card border border-white/20 hover:border-white/30 transition-all duration-300 rounded-xl">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                {selectedWeekData && (
                  <>
                    <div
                      className={`h-3 w-3 rounded-full ${
                        getWeekStatus(
                          selectedWeekData.startDate,
                          selectedWeekData.endDate,
                        ) === 'current'
                          ? 'bg-green-400 animate-pulse'
                          : getWeekStatus(
                                selectedWeekData.startDate,
                                selectedWeekData.endDate,
                              ) === 'past'
                            ? 'bg-cyan-400'
                            : 'bg-pink-400'
                      }`}
                    />
                    <div>
                      <div className="text-base font-medium text-white">
                        {formatWeekRange(
                          selectedWeekData.startDate,
                          selectedWeekData.endDate,
                        )}
                      </div>
                      <div className="text-sm text-white/60 flex items-center gap-2">
                        {selectedWeekData.seasonName}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
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
                  <SelectValue placeholder="Select a week to view your stats" />
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
                        status === 'current'
                          ? 'bg-green-400 animate-pulse'
                          : status === 'past'
                            ? 'bg-cyan-400'
                            : 'bg-pink-400'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="font-medium">
                        {formatWeekRange(week.startDate, week.endDate)}
                      </div>
                      <div className="text-sm opacity-60 flex items-center gap-2">
                        {week.seasonName}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted/50">
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
  );
};

export { WeekSelector, type WeekSelectorProps, type WeekData };
