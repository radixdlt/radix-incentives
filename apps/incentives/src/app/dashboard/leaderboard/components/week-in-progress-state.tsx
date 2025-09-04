'use client';

import { Calendar, Clock } from 'lucide-react';

interface WeekInProgressStateProps {
  message: string;
  weekStart?: Date;
  weekEnd?: Date;
}

export function WeekInProgressState({
  message,
  weekStart,
  weekEnd,
}: WeekInProgressStateProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const now = new Date();
  const isInProgress =
    weekStart && weekEnd && now >= weekStart && now < weekEnd;
  const isUpcoming = weekStart && now < weekStart;

  return (
    <div className="flex items-center justify-center py-12">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500/20 to-cyan-600/20">
          {isInProgress ? (
            <Clock className="size-8 text-cyan-400" />
          ) : (
            <Calendar className="size-8 text-cyan-400" />
          )}
        </div>

        <h3 className="mb-2 font-semibold text-lg text-white">
          {isInProgress
            ? 'First Week In Progress'
            : isUpcoming
              ? 'Week Not Started'
              : 'Week Unavailable'}
        </h3>

        <p className="mb-4 text-muted-foreground text-sm">
          {message}
          {isInProgress && (
            <span className="mt-2 block">
              You can check the Activity Points leaderboard to see how you're
              doing in the first week.
            </span>
          )}
        </p>

        {weekStart && weekEnd && (
          <div className="rounded-lg border bg-card/50 p-4">
            <div className="space-y-2 text-sm">
              {isInProgress ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Started:</span>
                    <span className="font-medium text-white">
                      {formatDateTime(weekStart)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Ends:</span>
                    <span className="font-medium text-white">
                      {formatDateTime(weekEnd)}
                    </span>
                  </div>
                </>
              ) : isUpcoming ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Starts:</span>
                    <span className="font-medium text-white">
                      {formatDateTime(weekStart)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Ends:</span>
                    <span className="font-medium text-white">
                      {formatDateTime(weekEnd)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <span className="text-muted-foreground">
                    Week period: {formatDate(weekStart)} - {formatDate(weekEnd)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
