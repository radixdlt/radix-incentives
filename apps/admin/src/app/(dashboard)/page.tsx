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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your Radix Points incentives campaign
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value="12,345"
          change="+12%"
          direction="up"
          icon={<Users className="h-5 w-5" />}
          description="Total registered users"
        />
        <StatCard
          title="Points Distributed"
          value="1.2M"
          change="+8%"
          direction="up"
          icon={<BadgeDollarSign className="h-5 w-5" />}
          description="Total points given to users"
        />
        <StatCard
          title="Conversion Rate"
          value="32%"
          change="+5%"
          direction="up"
          icon={<MousePointerClick className="h-5 w-5" />}
          description="User engagement metric"
        />
        <StatCard
          title="Task Completions"
          value="45.6K"
          change="+15%"
          direction="up"
          icon={<CheckCheck className="h-5 w-5" />}
          description="Completed tasks this month"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="md:col-span-4 lg:col-span-4">
          <div className="h-[350px] rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">User Growth</h3>
                <p className="text-sm text-muted-foreground">
                  New user registrations over time
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-primary"></div>
                  <span className="text-sm text-muted-foreground">
                    This year
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-muted"></div>
                  <span className="text-sm text-muted-foreground">
                    Last year
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex h-[260px] items-end justify-between gap-2 rounded border-b pb-6">
              {/* Placeholder for chart */}
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="relative w-full">
                  <div
                    className="w-full rounded-t bg-primary"
                    style={{
                      height: `${100 + Math.random() * 150}px`,
                    }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="md:col-span-3 lg:col-span-3">
          <div className="h-[350px] rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Top Performers</h3>
                <p className="text-sm text-muted-foreground">
                  Users with most points earned
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {[
                { name: "Olivia Martin", points: 22450 },
                { name: "Jackson Lee", points: 19200 },
                { name: "Isabella Nguyen", points: 16750 },
                { name: "William Kim", points: 15300 },
                { name: "Sofia Davis", points: 13100 },
              ].map((user, i) => (
                <div
                  key={i}
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
            <h3 className="text-lg font-medium">Recent Activity</h3>
            <button className="text-sm text-primary hover:underline">
              View all
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {[
              {
                action: "Completed task",
                user: "Alex Johnson",
                time: "2 minutes ago",
                points: 100,
              },
              {
                action: "Referred a friend",
                user: "Samantha Lee",
                time: "15 minutes ago",
                points: 500,
              },
              {
                action: "Daily login",
                user: "Michael Chen",
                time: "42 minutes ago",
                points: 50,
              },
              {
                action: "Created a post",
                user: "Emma Williams",
                time: "1 hour ago",
                points: 250,
              },
              {
                action: "Shared content",
                user: "Ryan Taylor",
                time: "3 hours ago",
                points: 150,
              },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-4">
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
            <h3 className="text-lg font-medium">Task Completion</h3>
            <div className="flex h-8 items-center rounded-md bg-muted px-3 text-xs font-medium">
              This Week
            </div>
          </div>
          <div className="mt-4 space-y-4">
            {[
              { task: "Sign up", completed: 2450, total: 3000 },
              { task: "Verify email", completed: 1960, total: 3000 },
              { task: "Complete profile", completed: 1650, total: 3000 },
              { task: "First transaction", completed: 1200, total: 3000 },
              { task: "Invite friends", completed: 840, total: 3000 },
            ].map((task, i) => (
              <div key={i} className="space-y-2">
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
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Campaign Stats</h3>
            <button className="text-sm text-primary hover:underline">
              Configure
            </button>
          </div>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between rounded-md border bg-card/50 p-3">
              <div className="font-medium">Start date</div>
              <div className="text-muted-foreground">Jan 12, 2023</div>
            </div>
            <div className="flex items-center justify-between rounded-md border bg-card/50 p-3">
              <div className="font-medium">End date</div>
              <div className="text-muted-foreground">Dec 31, 2023</div>
            </div>
            <div className="flex items-center justify-between rounded-md border bg-card/50 p-3">
              <div className="font-medium">Total budget</div>
              <div className="text-muted-foreground">5,000,000 pts</div>
            </div>
            <div className="flex items-center justify-between rounded-md border bg-card/50 p-3">
              <div className="font-medium">Allocated</div>
              <div className="text-muted-foreground">1,245,300 pts</div>
            </div>
            <div className="flex items-center justify-between rounded-md border bg-card/50 p-3">
              <div className="font-medium">Remaining</div>
              <div className="text-muted-foreground">3,754,700 pts</div>
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
      <h3 className="mt-1 text-2xl font-bold">{value}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
