import { Award, MoveUpRight, Zap } from 'lucide-react';
import { Card } from '~/components/ui/card';
import { cn } from '~/lib/utils';

export default function DashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden">
        <div className="flex flex-col space-y-4 p-6">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">This Week</span>
            <span className="text-muted-foreground text-xs">
              Week 12 / Season 1
            </span>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-bold text-3xl tracking-tight">12,500</span>
            <MoveUpRight className="mb-1 h-4 w-4 text-green-500" />
            <span className="mb-1 text-green-500 text-xs">+8.2%</span>
          </div>
          <div className="text-muted-foreground text-xs">
            Points earned this week
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex flex-col space-y-4 p-6">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">Season Total</span>
            <span className="text-muted-foreground text-xs">Season 1</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-bold text-3xl tracking-tight">87,200</span>
            <MoveUpRight className="mb-1 h-4 w-4 text-green-500" />
            <span className="mb-1 text-green-500 text-xs">+12.5%</span>
          </div>
          <div className="text-muted-foreground text-xs">
            Total points this season
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex flex-col space-y-4 p-6">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">Multiplier</span>
            <span className="text-muted-foreground text-xs">
              Based on holdings
            </span>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-bold text-3xl tracking-tight">1.5x</span>
            <Zap className="mb-1 h-4 w-4 text-amber-500" />
          </div>
          <div className="text-muted-foreground text-xs">
            Current points multiplier
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex flex-col space-y-4 p-6">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">Rank</span>
            <span className="text-muted-foreground text-xs">Global</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-bold text-3xl tracking-tight">#342</span>
            <Award className="mb-1 h-4 w-4 text-blue-500" />
            <span className="mb-1 text-blue-500 text-xs">Top 5%</span>
          </div>
          <div className="text-muted-foreground text-xs">
            Global leaderboard position
          </div>
        </div>
      </Card>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm md:col-span-2">
        <div className="p-6">
          <h3 className="font-medium text-lg">Activity Breakdown</h3>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">DEX Trading</span>
              <span className="font-medium text-sm">4,200 pts</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={cn('h-full bg-primary')}
                style={{ width: '35%' }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Liquidity Provision</span>
              <span className="font-medium text-sm">3,800 pts</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={cn('h-full bg-primary')}
                style={{ width: '32%' }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Lending</span>
              <span className="font-medium text-sm">2,500 pts</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={cn('h-full bg-primary')}
                style={{ width: '21%' }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Staking</span>
              <span className="font-medium text-sm">1,500 pts</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={cn('h-full bg-primary')}
                style={{ width: '12%' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm md:col-span-2">
        <div className="p-6">
          <h3 className="font-medium text-lg">Recent Activity</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">DEX Trading</div>
                <div className="text-muted-foreground text-sm">xUSDC → XRD</div>
              </div>
              <div className="text-right">
                <div>+250 pts</div>
                <div className="text-muted-foreground text-sm">2 hours ago</div>
              </div>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">Liquidity Provision</div>
                <div className="text-muted-foreground text-sm">
                  XRD-xUSDC LP
                </div>
              </div>
              <div className="text-right">
                <div>+180 pts</div>
                <div className="text-muted-foreground text-sm">5 hours ago</div>
              </div>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">Lending</div>
                <div className="text-muted-foreground text-sm">
                  Supplied XRD
                </div>
              </div>
              <div className="text-right">
                <div>+120 pts</div>
                <div className="text-muted-foreground text-sm">1 day ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
