interface PodiumUser {
  userId: string;
  label: string | null;
  totalPoints: string;
  rank: number;
}

interface PodiumProps {
  users: PodiumUser[];
  pointsLabel?: string;
  userStats?: {
    rank: number;
    totalPoints: string;
  } | null;
}

export function Podium({
  users,
  pointsLabel = 'points',
  userStats,
}: PodiumProps) {
  const topThree = users.slice(0, 3);
  const remaining = users.slice(3, 5);

  const formatPoints = (points: string) => {
    const num = Number.parseFloat(points);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const getDisplayName = (user: PodiumUser) => {
    return user.label || 'Anonymous User';
  };

  const isCurrentUser = (user: PodiumUser) => {
    if (!userStats) return false;
    // User is current user if their rank and points match the userStats
    return (
      user.rank === userStats.rank && user.totalPoints === userStats.totalPoints
    );
  };

  const currentUserInTop5 = userStats ? userStats.rank <= 5 : false;

  return (
    <div className="space-y-6">
      {/* Podium */}
      <div className="relative mt-4">
        {/* Mobile Layout: Platform on top, cards below */}
        <div className="sm:hidden">
          <div className="mb-4 flex h-32 items-end justify-center gap-2">
            {/* Second Place Platform */}
            {topThree[1] && (
              <div className="flex h-16 w-12 items-end justify-center rounded-t-lg bg-gradient-to-t from-gray-300 to-gray-200 pb-1">
                <span className="font-bold text-gray-700 text-sm">#2</span>
              </div>
            )}

            {/* First Place Platform - Taller */}
            {topThree[0] && (
              <div className="flex h-24 w-16 items-end justify-center rounded-t-lg bg-gradient-to-t from-yellow-400 to-yellow-300 pb-1">
                <span className="font-bold text-base text-yellow-800">#1</span>
              </div>
            )}

            {/* Third Place Platform */}
            {topThree[2] && (
              <div className="flex h-12 w-12 items-end justify-center rounded-t-lg bg-gradient-to-t from-orange-400 to-orange-300 pb-1">
                <span className="font-bold text-orange-800 text-sm">#3</span>
              </div>
            )}
          </div>

          {/* Mobile User Cards */}
          <div className="flex justify-center gap-2">
            {/* Second Place Card */}
            {topThree[1] && (
              <div
                className={`max-w-[100px] flex-1 rounded-lg border p-2 text-center ${
                  isCurrentUser(topThree[1])
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border bg-card'
                }`}
              >
                <div className="mb-1 text-lg">🥈</div>
                <div className="font-medium text-xs">
                  {getDisplayName(topThree[1])}
                </div>
                <div className="text-muted-foreground text-xs">
                  {formatPoints(topThree[1].totalPoints)} {pointsLabel}
                </div>
                {isCurrentUser(topThree[1]) && (
                  <div className="mt-1 font-medium text-primary text-xs">
                    You!
                  </div>
                )}
              </div>
            )}

            {/* First Place Card */}
            {topThree[0] && (
              <div
                className={`max-w-[100px] flex-1 rounded-lg border p-2 text-center ${
                  isCurrentUser(topThree[0])
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border bg-card'
                }`}
              >
                <div className="mb-1 text-xl">🏆</div>
                <div className="font-bold text-xs">
                  {getDisplayName(topThree[0])}
                </div>
                <div className="text-muted-foreground text-xs">
                  {formatPoints(topThree[0].totalPoints)} {pointsLabel}
                </div>
                {isCurrentUser(topThree[0]) && (
                  <div className="mt-1 font-medium text-primary text-xs">
                    You!
                  </div>
                )}
              </div>
            )}

            {/* Third Place Card */}
            {topThree[2] && (
              <div
                className={`max-w-[100px] flex-1 rounded-lg border p-2 text-center ${
                  isCurrentUser(topThree[2])
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border bg-card'
                }`}
              >
                <div className="mb-1 text-lg">🥉</div>
                <div className="font-medium text-xs">
                  {getDisplayName(topThree[2])}
                </div>
                <div className="text-muted-foreground text-xs">
                  {formatPoints(topThree[2].totalPoints)} {pointsLabel}
                </div>
                {isCurrentUser(topThree[2]) && (
                  <div className="mt-1 font-medium text-primary text-xs">
                    You!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Layout: Original design */}
        <div className="hidden h-48 items-end justify-center gap-4 sm:flex">
          {/* Second Place */}
          {topThree[1] && (
            <div className="flex flex-col items-center">
              <div
                className={`mb-2 rounded-lg border p-3 text-center ${
                  isCurrentUser(topThree[1])
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border bg-card'
                }`}
              >
                <div className="mb-1 text-2xl">🥈</div>
                <div className="font-medium text-sm">
                  {getDisplayName(topThree[1])}
                </div>
                <div className="text-muted-foreground text-xs">
                  {formatPoints(topThree[1].totalPoints)} {pointsLabel}
                </div>
                {isCurrentUser(topThree[1]) && (
                  <div className="mt-1 font-medium text-primary text-xs">
                    You!
                  </div>
                )}
              </div>
              <div className="flex h-24 w-20 items-end justify-center rounded-t-lg bg-gradient-to-t from-gray-300 to-gray-200 pb-2">
                <span className="font-bold text-gray-700 text-lg">#2</span>
              </div>
            </div>
          )}

          {/* First Place */}
          {topThree[0] && (
            <div className="flex flex-col items-center">
              <div
                className={`mb-2 rounded-lg border p-4 text-center ${
                  isCurrentUser(topThree[0])
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border bg-card'
                }`}
              >
                <div className="mb-1 text-3xl">🏆</div>
                <div className="font-bold text-base">
                  {getDisplayName(topThree[0])}
                </div>
                <div className="text-muted-foreground text-sm">
                  {formatPoints(topThree[0].totalPoints)} {pointsLabel}
                </div>
                {isCurrentUser(topThree[0]) && (
                  <div className="mt-1 font-medium text-primary text-sm">
                    You!
                  </div>
                )}
              </div>
              <div className="flex h-32 w-24 items-end justify-center rounded-t-lg bg-gradient-to-t from-yellow-400 to-yellow-300 pb-2">
                <span className="font-bold text-xl text-yellow-800">#1</span>
              </div>
            </div>
          )}

          {/* Third Place */}
          {topThree[2] && (
            <div className="flex flex-col items-center">
              <div
                className={`mb-2 rounded-lg border p-3 text-center ${
                  isCurrentUser(topThree[2])
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border bg-card'
                }`}
              >
                <div className="mb-1 text-2xl">🥉</div>
                <div className="font-medium text-sm">
                  {getDisplayName(topThree[2])}
                </div>
                <div className="text-muted-foreground text-xs">
                  {formatPoints(topThree[2].totalPoints)} {pointsLabel}
                </div>
                {isCurrentUser(topThree[2]) && (
                  <div className="mt-1 font-medium text-primary text-xs">
                    You!
                  </div>
                )}
              </div>
              <div className="flex h-20 w-20 items-end justify-center rounded-t-lg bg-gradient-to-t from-orange-400 to-orange-300 pb-2">
                <span className="font-bold text-lg text-orange-800">#3</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4th and 5th place */}
      {remaining.length > 0 && (
        <div className="space-y-2">
          {remaining.map((user) => (
            <div
              key={user.userId}
              className={`flex items-center justify-between rounded-lg border p-3 ${
                isCurrentUser(user)
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border bg-card'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-medium text-sm">
                  {user.rank}
                </div>
                <div>
                  <div className="font-medium">
                    {getDisplayName(user)}
                    {isCurrentUser(user) && (
                      <span className="ml-2 font-medium text-white/70 text-xs">
                        (You)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {formatPoints(user.totalPoints)}
                </div>
                <div className="text-muted-foreground text-xs">
                  {pointsLabel}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current user placement if not in top 5 */}
      {!currentUserInTop5 && userStats && (
        <div className="space-y-2">
          <div className="text-center text-muted-foreground text-sm">
            {userStats.rank > 5 ? '...' : ''}
          </div>
          <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-3 ring-2 ring-primary/20">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 font-medium text-sm text-white">
                {userStats.rank}
              </div>
              <div>
                <div className="font-medium">
                  Your Position
                  <span className="ml-2 font-medium text-white/70 text-xs">
                    (You)
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">
                {formatPoints(userStats.totalPoints)}
              </div>
              <div className="text-muted-foreground text-xs">{pointsLabel}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
