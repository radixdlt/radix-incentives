import {
  ArrowUpRight,
  BadgeDollarSign,
  BarChart3,
  CheckCheck,
  CircleUser,
  MousePointerClick,
  Users,
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your Radix Incentives campaign
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Users"
          value="12,345"
          change="+12%"
          direction="up"
          icon={<Users className="h-5 w-5" />}
          description="Participating accounts"
        />
        <StatCard
          title="Weekly Points"
          value="1.2M"
          change="+8%"
          direction="up"
          icon={<BadgeDollarSign className="h-5 w-5" />}
          description="Total points this week"
        />
        <StatCard
          title="On-chain Activity"
          value="32%"
          change="+5%"
          direction="up"
          icon={<MousePointerClick className="h-5 w-5" />}
          description="Active/Passive distribution"
        />
        <StatCard
          title="Season Progress"
          value="45%"
          change="+15%"
          direction="up"
          icon={<CheckCheck className="h-5 w-5" />}
          description="Week 6 of 12"
        />
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium">Activity Distribution</h2>
            <p className="text-sm text-muted-foreground">
              Breakdown of on-chain activities by type
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">
                Current week
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-muted" />
              <span className="text-sm text-muted-foreground">
                Previous week
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-6">
            {[
              {
                activity: 'DEX Trading',
                count: 5843,
                change: '+12%',
                color: 'bg-primary',
                id: 'dex-trading',
              },
              {
                activity: 'Liquidity Provider',
                count: 4237,
                change: '+8%',
                color: 'bg-blue-500',
                id: 'liquidity-provider',
              },
              {
                activity: 'NFT Collection',
                count: 1259,
                change: '+24%',
                color: 'bg-purple-500',
                id: 'nft-collection',
              },
              {
                activity: 'dApp Usage',
                count: 3125,
                change: '+18%',
                color: 'bg-orange-500',
                id: 'dapp-usage',
              },
              {
                activity: 'Bridging',
                count: 2478,
                change: '+9%',
                color: 'bg-teal-500',
                id: 'bridging',
              },
            ].map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${item.color}`} />
                      <span className="font-medium">{item.activity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">
                        {item.count.toLocaleString()}
                      </span>
                      <span className="text-xs text-emerald-500">
                        {item.change}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{
                      width: `${(item.count / 10000) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="h-[350px] flex items-end justify-between gap-2">
            {[
              {
                activity: 'DEX Trading',
                count: 5843,
                color: 'bg-primary',
                id: 'dex-bar',
              },
              {
                activity: 'Liquidity Provider',
                count: 4237,
                color: 'bg-blue-500',
                id: 'lp-bar',
              },
              {
                activity: 'NFT Collection',
                count: 1259,
                color: 'bg-purple-500',
                id: 'nft-bar',
              },
              {
                activity: 'dApp Usage',
                count: 3125,
                color: 'bg-orange-500',
                id: 'dapp-bar',
              },
              {
                activity: 'Bridging',
                count: 2478,
                color: 'bg-teal-500',
                id: 'bridging-bar',
              },
            ].map((item) => (
              <div
                key={item.id}
                className="relative flex flex-col items-center w-full"
              >
                <div
                  className={`w-full rounded-t ${item.color}`}
                  style={{
                    height: `${(item.count / 10000) * 300}px`,
                  }}
                />
                <div className="mt-2 text-xs text-muted-foreground text-center w-full">
                  {item.activity.split(' ')[0]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Recent On-chain Activity</h2>
            <button
              type="button"
              className="text-sm text-primary hover:underline"
            >
              View all
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {[
              {
                action: 'DEX Trading',
                user: '0x7a...3f9a',
                time: '2 minutes ago',
                points: 100,
                id: 'activity-1',
              },
              {
                action: 'Liquidity Provider',
                user: '0x5c...1e4b',
                time: '15 minutes ago',
                points: 500,
                id: 'activity-2',
              },
              {
                action: 'LSU Staking',
                user: '0x3b...8d2c',
                time: '42 minutes ago',
                points: 50,
                id: 'activity-3',
              },
              {
                action: 'XRD Holding',
                user: '0xf1...2e7d',
                time: '1 hour ago',
                points: 250,
                id: 'activity-4',
              },
              {
                action: 'NFT Collection',
                user: '0x9a...5f8b',
                time: '3 hours ago',
                points: 150,
                id: 'activity-5',
              },
            ].map((activity) => (
              <div key={activity.id} className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{activity.action}</p>
                    <span className="text-sm text-emerald-500">
                      +{activity.points} pts
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {activity.user}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Multiplier Distribution</h2>
            <div className="flex h-8 items-center rounded-md bg-muted px-3 text-xs font-medium">
              Current Week
            </div>
          </div>
          <div className="mt-4 space-y-4">
            {[
              {
                task: '1x Multiplier',
                completed: 2450,
                total: 3000,
                id: 'task-1',
              },
              {
                task: '1.2x - 1.5x',
                completed: 1960,
                total: 3000,
                id: 'task-2',
              },
              {
                task: '1.5x - 2.0x',
                completed: 1650,
                total: 3000,
                id: 'task-3',
              },
              {
                task: '2.0x - 2.5x',
                completed: 1200,
                total: 3000,
                id: 'task-4',
              },
              {
                task: '2.5x - 3.0x',
                completed: 840,
                total: 3000,
                id: 'task-5',
              },
            ].map((task) => (
              <div key={task.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{task.task}</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round((task.completed / task.total) * 100)}%
                  </p>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.round(
                        (task.completed / task.total) * 100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change: string;
  direction: 'up' | 'down';
  description: string;
}

function StatCard({
  title,
  value,
  icon,
  change,
  direction,
  description,
}: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          {icon}
        </div>
        <span
          className={`flex items-center text-xs font-medium ${
            direction === 'up' ? 'text-emerald-500' : 'text-rose-500'
          }`}
        >
          {change}
          <ArrowUpRight className="ml-1 h-3 w-3" />
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{title}</p>
      <h2 className="mt-1 text-2xl font-bold">{value}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
