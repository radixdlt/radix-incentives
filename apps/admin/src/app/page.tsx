import {
  ArrowUpRight,
  BadgeDollarSign,
  BarChart3,
  CheckCheck,
  CircleUser,
  MousePointerClick,
  Users,
} from "lucide-react";

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="md:col-span-4 lg:col-span-4">
          <div className="h-[350px] rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium">User Engagement</h2>
                <p className="text-sm text-muted-foreground">
                  Network participation over time
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span className="text-sm text-muted-foreground">
                    Current season
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-muted" />
                  <span className="text-sm text-muted-foreground">
                    Previous season
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex h-[260px] items-end justify-between gap-2 rounded border-b pb-6">
              {/* Placeholder for chart */}
              {Array.from({ length: 12 }).map((_, index) => {
                const height = 100 + Math.random() * 150;
                const barId = `chart-bar-${index}-${Math.floor(height)}`;
                return (
                  <div key={barId} className="relative w-full">
                    <div
                      className="w-full rounded-t bg-primary"
                      style={{
                        height: `${height}px`,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="md:col-span-3 lg:col-span-3">
          <div className="h-[350px] rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium">Top Performers</h2>
                <p className="text-sm text-muted-foreground">
                  Accounts with highest season points
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2 overflow-auto h-[calc(100%-4rem)]">
              {[
                { name: "Olivia Martin", points: 22450, id: "user-1" },
                { name: "Jackson Lee", points: 19200, id: "user-2" },
                { name: "Isabella Nguyen", points: 16750, id: "user-3" },
                { name: "William Kim", points: 15300, id: "user-4" },
                { name: "Sofia Davis", points: 13100, id: "user-5" },
                { name: "Ethan Johnson", points: 11800, id: "user-6" },
                { name: "Ava Robinson", points: 10500, id: "user-7" },
                { name: "Noah Garcia", points: 9200, id: "user-8" },
              ].map((user, i) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                      <CircleUser className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        #{i + 1} Ranked
                      </p>
                    </div>
                  </div>
                  <div className="font-medium">
                    {user.points.toLocaleString()} pts
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                action: "DEX Trading",
                user: "0x7a...3f9a",
                time: "2 minutes ago",
                points: 100,
                id: "activity-1",
              },
              {
                action: "Liquidity Provider",
                user: "0x5c...1e4b",
                time: "15 minutes ago",
                points: 500,
                id: "activity-2",
              },
              {
                action: "LSU Staking",
                user: "0x3b...8d2c",
                time: "42 minutes ago",
                points: 50,
                id: "activity-3",
              },
              {
                action: "XRD Holding",
                user: "0xf1...2e7d",
                time: "1 hour ago",
                points: 250,
                id: "activity-4",
              },
              {
                action: "NFT Collection",
                user: "0x9a...5f8b",
                time: "3 hours ago",
                points: 150,
                id: "activity-5",
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
                task: "1x Multiplier",
                completed: 2450,
                total: 3000,
                id: "task-1",
              },
              {
                task: "1.2x - 1.5x",
                completed: 1960,
                total: 3000,
                id: "task-2",
              },
              {
                task: "1.5x - 2.0x",
                completed: 1650,
                total: 3000,
                id: "task-3",
              },
              {
                task: "2.0x - 2.5x",
                completed: 1200,
                total: 3000,
                id: "task-4",
              },
              {
                task: "2.5x - 3.0x",
                completed: 840,
                total: 3000,
                id: "task-5",
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
                        (task.completed / task.total) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Campaign Configuration</h2>
            <button
              type="button"
              className="text-sm text-primary hover:underline"
            >
              Edit Rules
            </button>
          </div>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between rounded-md border bg-card/50 p-3">
              <div className="font-medium">Season</div>
              <div className="text-muted-foreground">Season 1</div>
            </div>
            <div className="flex items-center justify-between rounded-md border bg-card/50 p-3">
              <div className="font-medium">Current Week</div>
              <div className="text-muted-foreground">Week 6 of 12</div>
            </div>
            <div className="flex items-center justify-between rounded-md border bg-card/50 p-3">
              <div className="font-medium">Total XRD Budget</div>
              <div className="text-muted-foreground">250,000,000 XRD</div>
            </div>
            <div className="flex items-center justify-between rounded-md border bg-card/50 p-3">
              <div className="font-medium">Min XRD Requirement</div>
              <div className="text-muted-foreground">$50 worth of XRD</div>
            </div>
            <div className="flex items-center justify-between rounded-md border bg-card/50 p-3">
              <div className="font-medium">Last Rule Change</div>
              <div className="text-muted-foreground">3 days ago</div>
            </div>
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
  direction: "up" | "down";
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
            direction === "up" ? "text-emerald-500" : "text-rose-500"
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
