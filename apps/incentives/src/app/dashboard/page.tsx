import { cn } from "~/lib/utils";
import { MoveUpRight, Award, Zap } from "lucide-react";
import { Card } from "~/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden">
        <div className="p-6 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">This Week</span>
            <span className="text-xs text-muted-foreground">
              Week 12 / Season 1
            </span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold tracking-tight">12,500</span>
            <MoveUpRight className="h-4 w-4 text-green-500 mb-1" />
            <span className="text-xs text-green-500 mb-1">+8.2%</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Points earned this week
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="p-6 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Season Total</span>
            <span className="text-xs text-muted-foreground">Season 1</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold tracking-tight">87,200</span>
            <MoveUpRight className="h-4 w-4 text-green-500 mb-1" />
            <span className="text-xs text-green-500 mb-1">+12.5%</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Total points this season
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="p-6 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Multiplier</span>
            <span className="text-xs text-muted-foreground">
              Based on holdings
            </span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold tracking-tight">1.5x</span>
            <Zap className="h-4 w-4 text-amber-500 mb-1" />
          </div>
          <div className="text-xs text-muted-foreground">
            Current points multiplier
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="p-6 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Rank</span>
            <span className="text-xs text-muted-foreground">Global</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold tracking-tight">#342</span>
            <Award className="h-4 w-4 text-blue-500 mb-1" />
            <span className="text-xs text-blue-500 mb-1">Top 5%</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Global leaderboard position
          </div>
        </div>
      </Card>

      <div className="md:col-span-2 rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium">Activity Breakdown</h3>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">DEX Trading</span>
              <span className="text-sm font-medium">4,200 pts</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn("h-full bg-primary")}
                style={{ width: "35%" }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Liquidity Provision</span>
              <span className="text-sm font-medium">3,800 pts</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn("h-full bg-primary")}
                style={{ width: "32%" }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Lending</span>
              <span className="text-sm font-medium">2,500 pts</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn("h-full bg-primary")}
                style={{ width: "21%" }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Staking</span>
              <span className="text-sm font-medium">1,500 pts</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn("h-full bg-primary")}
                style={{ width: "12%" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="md:col-span-2 rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium">Recent Activity</h3>
          <div className="mt-4 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">DEX Trading</div>
                <div className="text-sm text-muted-foreground">xUSDC → XRD</div>
              </div>
              <div className="text-right">
                <div>+250 pts</div>
                <div className="text-sm text-muted-foreground">2 hours ago</div>
              </div>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">Liquidity Provision</div>
                <div className="text-sm text-muted-foreground">
                  XRD-xUSDC LP
                </div>
              </div>
              <div className="text-right">
                <div>+180 pts</div>
                <div className="text-sm text-muted-foreground">5 hours ago</div>
              </div>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">Lending</div>
                <div className="text-sm text-muted-foreground">
                  Supplied XRD
                </div>
              </div>
              <div className="text-right">
                <div>+120 pts</div>
                <div className="text-sm text-muted-foreground">1 day ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
