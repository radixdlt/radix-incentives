export default function LeaderboardPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Leaderboard</h2>
        <div className="flex items-center gap-2">
          <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring">
            <option>Weekly</option>
            <option>Season</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 font-medium">Rank</th>
                <th className="px-6 py-3 font-medium">Account</th>
                <th className="px-6 py-3 font-medium text-right">Points</th>
                <th className="px-6 py-3 font-medium text-right">
                  Weekly Change
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="bg-green-50 dark:bg-green-950/20">
                <td className="px-6 py-4 font-medium">#342</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs">You</span>
                    </div>
                    <div>
                      <div className="font-medium">account_ab...z21</div>
                      <div className="text-xs text-muted-foreground">
                        Your account
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-medium">87,200</td>
                <td className="px-6 py-4 text-right text-green-600 dark:text-green-400">
                  ↑ 12
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">#1</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                      🏆
                    </div>
                    <div className="font-medium">account_12...f85</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-medium">384,520</td>
                <td className="px-6 py-4 text-right text-muted-foreground">
                  -
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">#2</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                      🥈
                    </div>
                    <div className="font-medium">account_35...d72</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-medium">356,780</td>
                <td className="px-6 py-4 text-right text-green-600 dark:text-green-400">
                  ↑ 1
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">#3</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                      🥉
                    </div>
                    <div className="font-medium">account_9a...b43</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-medium">328,950</td>
                <td className="px-6 py-4 text-right text-red-600 dark:text-red-400">
                  ↓ 1
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">#4</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                      4
                    </div>
                    <div className="font-medium">account_f7...1a2</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-medium">305,620</td>
                <td className="px-6 py-4 text-right text-muted-foreground">
                  -
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">#5</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                      5
                    </div>
                    <div className="font-medium">account_d2...e45</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-medium">287,430</td>
                <td className="px-6 py-4 text-right text-green-600 dark:text-green-400">
                  ↑ 3
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
          >
            Previous
          </button>
          <div className="text-sm text-muted-foreground">Page 1 of 20</div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
