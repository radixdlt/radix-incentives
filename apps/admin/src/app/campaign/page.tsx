import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import Link from "next/link";
import {
  Settings,
  Activity,
  TrendingUp,
  BarChart,
  Home,
  Users,
  CheckCircle,
  Flag,
  Gift,
  PlusCircle,
} from "lucide-react";

export default function CampaignPage() {
  // Menu items with links and icons
  const menuItems = [
    { name: "Overview", path: "/campaign", icon: <Home size={16} /> },
    {
      name: "Whitelists",
      path: "/campaign/whitelists",
      icon: <Users size={16} />,
    },
    {
      name: "Activities",
      path: "/campaign/activities",
      icon: <Activity size={16} />,
    },
    {
      name: "Verification",
      path: "/campaign/verification",
      icon: <CheckCircle size={16} />,
    },
    {
      name: "Campaigns",
      path: "/campaign/campaigns",
      icon: <Flag size={16} />,
    },
    { name: "Rewards", path: "/campaign/rewards", icon: <Gift size={16} /> },
    {
      name: "Settings",
      path: "/campaign/settings",
      icon: <Settings size={16} />,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Campaign Configuration
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage campaign parameters, rules, and settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <Activity className="h-5 w-5 text-primary mb-2" />
            <CardTitle>Activity Rules</CardTitle>
            <CardDescription>
              Configure point allocation for on-chain activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Define rules for each activity type, set point values, and manage
              rule versions
            </p>
            <Link href="/campaign/activities">
              <Button>Manage Rules</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <TrendingUp className="h-5 w-5 text-primary mb-2" />
            <CardTitle>Multiplier Configuration</CardTitle>
            <CardDescription>
              Configure the S-curve multiplier thresholds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Set thresholds, cap values, and visualize the multiplier curve
            </p>
            <Link href="/campaign/multipliers">
              <Button>Configure Multipliers</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <BarChart className="h-5 w-5 text-primary mb-2" />
            <CardTitle>Season Parameters</CardTitle>
            <CardDescription>
              Configure dates, rewards, and parameters for each season
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Set season dates, rewards allocation, and eligibility criteria
            </p>
            <Link href="/campaign/seasons">
              <Button>Manage Seasons</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <PlusCircle className="h-5 w-5 text-primary mb-2" />
            <CardTitle>Create New Season</CardTitle>
            <CardDescription>
              Start a new campaign season with specific dates and settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Define the parameters for the next season in the campaign
              schedule.
            </p>
            <Link href="/seasons/new">
              <Button>Create Season</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Settings className="h-5 w-5 text-primary mb-2" />
            <CardTitle>Global Settings</CardTitle>
            <CardDescription>
              Configure global campaign parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Set minimum holding requirements, excluded addresses, and global
              rules
            </p>
            <Link href="/campaign/settings">
              <Button>Manage Settings</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
