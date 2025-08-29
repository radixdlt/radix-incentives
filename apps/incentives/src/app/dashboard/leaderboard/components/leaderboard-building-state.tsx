'use client';

import { Cog } from 'lucide-react';

interface LeaderboardBuildingStateProps {
  message: string;
  title?: string;
}

export function LeaderboardBuildingState({
  message,
  title = 'Leaderboard Being Built',
}: LeaderboardBuildingStateProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-r from-pink-500/20 to-pink-600/20">
          <Cog className="size-8 text-pink-400" />
        </div>

        <h3 className="mb-2 font-semibold text-lg text-white">{title}</h3>

        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  );
}
