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
  pointsLabel = "points",
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
    return user.label || "Anonymous User";
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
          <div className="flex items-end justify-center gap-2 h-32 mb-4">
            {/* Second Place Platform */}
            {topThree[1] && (
              <div className="w-12 h-16 bg-gradient-to-t from-gray-300 to-gray-200 rounded-t-lg flex items-end justify-center pb-1">
                <span className="text-sm font-bold text-gray-700">#2</span>
              </div>
            )}

            {/* First Place Platform - Taller */}
            {topThree[0] && (
              <div className="w-16 h-24 bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t-lg flex items-end justify-center pb-1">
                <span className="text-base font-bold text-yellow-800">#1</span>
              </div>
            )}

            {/* Third Place Platform */}
            {topThree[2] && (
              <div className="w-12 h-12 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg flex items-end justify-center pb-1">
                <span className="text-sm font-bold text-orange-800">#3</span>
              </div>
            )}
          </div>

          {/* Mobile User Cards */}
          <div className="flex justify-center gap-2">
            {/* Second Place Card */}
            {topThree[1] && (
              <div
                className={`text-center p-2 rounded-lg border flex-1 max-w-[100px] ${
                  isCurrentUser(topThree[1])
                    ? "bg-primary/5 border-primary/30"
                    : "bg-card border-border"
                }`}
              >
                <div className="text-lg mb-1">🥈</div>
                <div className="font-medium text-xs">
                  {getDisplayName(topThree[1])}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatPoints(topThree[1].totalPoints)} {pointsLabel}
                </div>
                {isCurrentUser(topThree[1]) && (
                  <div className="text-xs font-medium text-primary mt-1">
                    You!
                  </div>
                )}
              </div>
            )}

            {/* First Place Card */}
            {topThree[0] && (
              <div
                className={`text-center p-2 rounded-lg border flex-1 max-w-[100px] ${
                  isCurrentUser(topThree[0])
                    ? "bg-primary/5 border-primary/30"
                    : "bg-card border-border"
                }`}
              >
                <div className="text-xl mb-1">🏆</div>
                <div className="font-bold text-xs">
                  {getDisplayName(topThree[0])}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatPoints(topThree[0].totalPoints)} {pointsLabel}
                </div>
                {isCurrentUser(topThree[0]) && (
                  <div className="text-xs font-medium text-primary mt-1">
                    You!
                  </div>
                )}
              </div>
            )}

            {/* Third Place Card */}
            {topThree[2] && (
              <div
                className={`text-center p-2 rounded-lg border flex-1 max-w-[100px] ${
                  isCurrentUser(topThree[2])
                    ? "bg-primary/5 border-primary/30"
                    : "bg-card border-border"
                }`}
              >
                <div className="text-lg mb-1">🥉</div>
                <div className="font-medium text-xs">
                  {getDisplayName(topThree[2])}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatPoints(topThree[2].totalPoints)} {pointsLabel}
                </div>
                {isCurrentUser(topThree[2]) && (
                  <div className="text-xs font-medium text-primary mt-1">
                    You!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Layout: Original design */}
        <div className="hidden sm:flex items-end justify-center gap-4 h-48">
          {/* Second Place */}
          {topThree[1] && (
            <div className="flex flex-col items-center">
              <div
                className={`text-center mb-2 p-3 rounded-lg border ${
                  isCurrentUser(topThree[1])
                    ? "bg-primary/5 border-primary/30"
                    : "bg-card border-border"
                }`}
              >
                <div className="text-2xl mb-1">🥈</div>
                <div className="font-medium text-sm">
                  {getDisplayName(topThree[1])}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatPoints(topThree[1].totalPoints)} {pointsLabel}
                </div>
                {isCurrentUser(topThree[1]) && (
                  <div className="text-xs font-medium text-primary mt-1">
                    You!
                  </div>
                )}
              </div>
              <div className="w-20 h-24 bg-gradient-to-t from-gray-300 to-gray-200 rounded-t-lg flex items-end justify-center pb-2">
                <span className="text-lg font-bold text-gray-700">#2</span>
              </div>
            </div>
          )}

          {/* First Place */}
          {topThree[0] && (
            <div className="flex flex-col items-center">
              <div
                className={`text-center mb-2 p-4 rounded-lg border ${
                  isCurrentUser(topThree[0])
                    ? "bg-primary/5 border-primary/30"
                    : "bg-card border-border"
                }`}
              >
                <div className="text-3xl mb-1">🏆</div>
                <div className="font-bold text-base">
                  {getDisplayName(topThree[0])}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatPoints(topThree[0].totalPoints)} {pointsLabel}
                </div>
                {isCurrentUser(topThree[0]) && (
                  <div className="text-sm font-medium text-primary mt-1">
                    You!
                  </div>
                )}
              </div>
              <div className="w-24 h-32 bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t-lg flex items-end justify-center pb-2">
                <span className="text-xl font-bold text-yellow-800">#1</span>
              </div>
            </div>
          )}

          {/* Third Place */}
          {topThree[2] && (
            <div className="flex flex-col items-center">
              <div
                className={`text-center mb-2 p-3 rounded-lg border ${
                  isCurrentUser(topThree[2])
                    ? "bg-primary/5 border-primary/30"
                    : "bg-card border-border"
                }`}
              >
                <div className="text-2xl mb-1">🥉</div>
                <div className="font-medium text-sm">
                  {getDisplayName(topThree[2])}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatPoints(topThree[2].totalPoints)} {pointsLabel}
                </div>
                {isCurrentUser(topThree[2]) && (
                  <div className="text-xs font-medium text-primary mt-1">
                    You!
                  </div>
                )}
              </div>
              <div className="w-20 h-20 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg flex items-end justify-center pb-2">
                <span className="text-lg font-bold text-orange-800">#3</span>
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
              className={`flex items-center justify-between p-3 rounded-lg border ${
                isCurrentUser(user)
                  ? "bg-primary/5 border-primary/30"
                  : "bg-card border-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                  {user.rank}
                </div>
                <div>
                  <div className="font-medium">
                    {getDisplayName(user)}
                    {isCurrentUser(user) && (
                      <span className="text-xs font-medium text-white/70 ml-2">
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
                <div className="text-xs text-muted-foreground">
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
          <div className="text-center text-sm text-muted-foreground">
            {userStats.rank > 5 ? "..." : ""}
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border bg-primary/5 border-primary/30 ring-2 ring-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium text-white">
                {userStats.rank}
              </div>
              <div>
                <div className="font-medium">
                  Your Position
                  <span className="text-xs font-medium text-white/70 ml-2">
                    (You)
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">
                {formatPoints(userStats.totalPoints)}
              </div>
              <div className="text-xs text-muted-foreground">{pointsLabel}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
